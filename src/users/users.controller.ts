import {
  Controller,
  Post,
  Body,
  Get,
  Delete,
  UsePipes,
  ValidationPipe,
  UseGuards,
  BadRequestException,
  NotFoundException,
  Patch,
  Param,
  ParseIntPipe,
  Put,
} from "@nestjs/common";
import { UsersService } from "./users.service";
import { CreateUserDto } from "./dto/create-user.dto";
import * as bcrypt from "bcryptjs";
import { AuthGuard } from "../auth/guards/auth.guard";
import { PermissionsGuard } from "../auth/guards/permissions.guard";
import { RequirePermission } from "../auth/decorators/permissions.decorator";
import { CurrentUser } from "../auth/decorators/current-user.decorator";
import { User } from "../entities/user.entity";
import { UpdateUserRoleDto } from "./dto/update-user-role.dto";
import { UpdateRolePermissionsDto } from "./dto/update-role-permissions.dto";

@Controller("users")
@UseGuards(AuthGuard, PermissionsGuard)
export class UsersController {
  constructor(private readonly svc: UsersService) {}

  private getEffectivePermissions(
    rolePerms: any[] = [],
    userPerms: any[] = [],
  ) {
    // If user has custom permissions, use only those (ignore role permissions)
    // Otherwise use role permissions
    if (userPerms && userPerms.length > 0) {
      return userPerms;
    }
    return rolePerms || [];
  }

  @Post()
  @UsePipes(new ValidationPipe({ whitelist: true, transform: true }))
  async create(@Body() body: CreateUserDto, @CurrentUser() currentUser: User) {
    // Only admin can create users
    if (!currentUser.role || currentUser.role.name !== "admin") {
      throw new BadRequestException("Only admin can create users");
    }

    const hashed = await bcrypt.hash(body.password, 10);
    const user = await this.svc.create({
      username: body.username,
      password: hashed,
      roleId: body.roleId || 2, // Default to operator role (id: 2)
    });

    const full = await this.svc.findOne((user as any).id);
    const effective = this.getEffectivePermissions(
      full.role?.permissions,
      full.permissions,
    );
    const { password, ...rest } = full as any;
    delete rest.permissions;
    if (rest.role) delete rest.role.permissions;
    rest.effectivePermissions = effective;
    return rest;
  }

  @Get()
  @RequirePermission("users", "view")
  async list() {
    const users = await this.svc.findAll();
    // Get effective permissions and don't return passwords
    return users.map((u) => {
      const { password, ...user } = u as any;
      const effective = this.getEffectivePermissions(
        user.role?.permissions,
        user.permissions,
      );
      delete user.permissions;
      if (user.role) delete user.role.permissions;
      user.effectivePermissions = effective;
      return user;
    });
  }

  @Get("roles")
  async getRoles() {
    // Anyone authenticated can see available roles
    const adminRole = await this.svc.findRoleByName("admin");
    const operatorRole = await this.svc.findRoleByName("operator");
    return [adminRole, operatorRole].filter(Boolean);
  }

  @Get(":id")
  @RequirePermission("users", "view")
  async getOne(@Param("id", ParseIntPipe) id: number) {
    const u = await this.svc.findOne(id);
    if (!u) {
      throw new NotFoundException("User not found");
    }
    const { password, ...user } = u as any;
    const effective = this.getEffectivePermissions(
      user.role?.permissions,
      user.permissions,
    );
    delete user.permissions;
    if (user.role) delete user.role.permissions;
    user.effectivePermissions = effective;
    return user;
  }

  @Delete(":id")
  async remove(
    @Param("id", ParseIntPipe) id: number,
    @CurrentUser() currentUser: User,
  ) {
    if (!currentUser.role || currentUser.role.name !== "admin") {
      throw new BadRequestException("Only admin can delete users");
    }

    return this.svc.deleteUser(id);
  }

  @Patch(":id/role")
  async changeUserRole(
    @Param("id", ParseIntPipe) id: number,
    @Body() body: UpdateUserRoleDto,
    @CurrentUser() currentUser: User,
  ) {
    if (!currentUser.role || currentUser.role.name !== "admin") {
      throw new BadRequestException("Only admin can change user roles");
    }

    const full = await this.svc.updateUserRole(id, body.roleId);
    const effective = this.getEffectivePermissions(
      full.role?.permissions,
      full.permissions,
    );
    const { password, ...result } = full as any;
    delete result.permissions;
    if (result.role) delete result.role.permissions;
    result.effectivePermissions = effective;
    return result;
  }

  @Put("roles/:id/permissions")
  async setRolePermissions(
    @Param("id", ParseIntPipe) id: number,
    @Body() body: UpdateRolePermissionsDto,
    @CurrentUser() currentUser: User,
  ) {
    if (!currentUser.role || currentUser.role.name !== "admin") {
      throw new BadRequestException("Only admin can modify role permissions");
    }

    const role = await this.svc.setRolePermissions(id, body.permissionIds);
    return role;
  }

  @Put(":userId/roles/:roleId/permissions")
  async setUserPermissions(
    @Param("userId", ParseIntPipe) userId: number,
    @Param("roleId", ParseIntPipe) roleId: number,
    @Body() body: UpdateRolePermissionsDto,
    @CurrentUser() currentUser: User,
  ) {
    if (!currentUser.role || currentUser.role.name !== "admin") {
      throw new BadRequestException("Only admin can modify user permissions");
    }

    const user = await this.svc.setUserPermissions(
      userId,
      roleId,
      body.permissionIds,
    );
    const effective = this.getEffectivePermissions(
      user.role?.permissions,
      user.permissions,
    );
    const { password, ...result } = user as any;
    delete result.permissions;
    if (result.role) delete result.role.permissions;
    result.effectivePermissions = effective;
    return result;
  }
}
