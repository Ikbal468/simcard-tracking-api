import {
  Controller,
  Post,
  Body,
  Get,
  Param,
  Patch,
  Delete,
  ParseIntPipe,
  UseGuards,
} from "@nestjs/common";
import { SimTypeService } from "./sim-type.service";
import { CreateSimTypeDto } from "./dto/create-sim-type.dto";
import { UpdateSimTypeDto } from "./dto/update-sim-type.dto";
import { AuthGuard } from "../auth/guards/auth.guard";
import { PermissionsGuard } from "../auth/guards/permissions.guard";
import { RequirePermission } from "../auth/decorators/permissions.decorator";

@Controller("simTypes")
@UseGuards(AuthGuard, PermissionsGuard)
export class SimTypeController {
  constructor(private readonly svc: SimTypeService) {}

  @Post()
  @RequirePermission("simtypes", "create")
  create(@Body() body: CreateSimTypeDto) {
    return this.svc.create(body);
  }

  @Get()
  @RequirePermission("simtypes", "view")
  list() {
    return this.svc.findAll();
  }

  @Get(":id")
  @RequirePermission("simtypes", "view")
  one(@Param("id", ParseIntPipe) id: number) {
    return this.svc.findOne(id);
  }

  @Patch(":id")
  @RequirePermission("simtypes", "edit")
  update(
    @Param("id", ParseIntPipe) id: number,
    @Body() body: UpdateSimTypeDto,
  ) {
    return this.svc.update(id, body as any);
  }

  @Delete(":id")
  @RequirePermission("simtypes", "delete")
  remove(@Param("id", ParseIntPipe) id: number) {
    return this.svc.remove(id);
  }
}
