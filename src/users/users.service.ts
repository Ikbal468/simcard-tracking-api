import { Injectable, NotFoundException } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository, In } from "typeorm";
import { User } from "../entities/user.entity";
import { Role } from "../entities/role.entity";
import { Permission } from "../entities/permission.entity";

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User)
    private readonly repo: Repository<User>,
    @InjectRepository(Role)
    private readonly roleRepo: Repository<Role>,
  ) {}

  async updateUserRole(userId: number, roleId: number) {
    const user = await this.repo.findOne({ where: { id: userId } });
    if (!user) throw new NotFoundException("User not found");

    const role = await this.roleRepo.findOne({
      where: { id: roleId },
      relations: ["permissions"],
    });
    if (!role) throw new NotFoundException("Role not found");

    user.roleId = role.id;
    user.role = role;
    user.roleName = role.name;
    return this.repo.save(user);
  }

  async setRolePermissions(roleId: number, permissionIds: number[]) {
    const role = await this.roleRepo.findOne({
      where: { id: roleId },
      relations: ["permissions"],
    });
    if (!role) throw new NotFoundException("Role not found");

    const perms = await this.roleRepo.manager
      .getRepository(Permission)
      .find({ where: { id: In(permissionIds) } });
    role.permissions = perms;
    return this.roleRepo.save(role);
  }

  async setUserPermissions(
    userId: number,
    roleId: number | null,
    permissionIds: number[],
  ) {
    const user = await this.repo.findOne({
      where: { id: userId },
      relations: ["role", "permissions"],
    });
    if (!user) throw new NotFoundException("User not found");

    if (roleId) {
      const role = await this.roleRepo.findOne({
        where: { id: roleId },
        relations: ["permissions"],
      });
      if (!role) throw new NotFoundException("Role not found");
      user.roleId = role.id;
      user.role = role;
      user.roleName = role.name;
    }

    const perms = await this.roleRepo.manager
      .getRepository(Permission)
      .find({ where: { id: In(permissionIds) } });
    user.permissions = perms;
    return this.repo.save(user);
  }

  async create(payload: Partial<User>) {
    // If payload contains a roleId or role (name), resolve it and set roleName
    if (payload.roleId && !payload.role) {
      const r = await this.roleRepo.findOne({ where: { id: payload.roleId } });
      if (r) {
        payload.role = r as any;
        payload.roleName = r.name;
      }
    } else if (payload.role && typeof payload.role === "string") {
      // provided role name
      const r = await this.roleRepo.findOne({
        where: { name: payload.role as any },
      });
      if (r) {
        payload.roleId = r.id;
        payload.role = r as any;
        payload.roleName = r.name;
      }
    } else if (payload.role && (payload.role as any).id) {
      // provided full role object
      payload.roleId = (payload.role as any).id;
      payload.roleName = (payload.role as any).name;
    }

    const ent = this.repo.create(payload);
    return this.repo.save(ent);
  }

  async findAll() {
    return this.repo.find({
      relations: ["role", "role.permissions", "permissions"],
    });
  }

  async findOne(id: number) {
    const ent = await this.repo.findOne({
      where: { id },
      relations: ["role", "role.permissions", "permissions"],
    });
    if (!ent) throw new NotFoundException("User not found");
    return ent;
  }

  async findByUsername(username: string) {
    return this.repo.findOne({
      where: { username },
      relations: ["role", "role.permissions", "permissions"],
    });
  }

  async findRoleByName(name: string) {
    return this.roleRepo.findOne({
      where: { name },
      relations: ["permissions"],
    });
  }

  async deleteUser(userId: number) {
    const user = await this.repo.findOne({ where: { id: userId } });
    if (!user) throw new NotFoundException("User not found");
    await this.repo.remove(user);
    return { success: true };
  }
}
