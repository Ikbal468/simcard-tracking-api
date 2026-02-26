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
import { CustomerService } from "./customer.service";
import { CreateCustomerDto } from "./dto/create-customer.dto";
import { UpdateCustomerDto } from "./dto/update-customer.dto";
import { AuthGuard } from "../auth/guards/auth.guard";
import { PermissionsGuard } from "../auth/guards/permissions.guard";
import { RequirePermission } from "../auth/decorators/permissions.decorator";

@Controller("customers")
@UseGuards(AuthGuard, PermissionsGuard)
export class CustomerController {
  constructor(private readonly svc: CustomerService) {}

  @Post()
  @RequirePermission("customers", "create")
  create(@Body() body: CreateCustomerDto) {
    return this.svc.create(body);
  }

  @Get()
  @RequirePermission("customers", "view")
  list() {
    return this.svc.findAll();
  }

  @Get(":id")
  @RequirePermission("customers", "view")
  one(@Param("id") id: string) {
    return this.svc.findOne(Number(id));
  }

  @Patch(":id")
  @RequirePermission("customers", "edit")
  update(
    @Param("id", ParseIntPipe) id: number,
    @Body() body: UpdateCustomerDto,
  ) {
    return this.svc.update(id, body as any);
  }

  @Delete(":id")
  @RequirePermission("customers", "delete")
  remove(@Param("id", ParseIntPipe) id: number) {
    return this.svc.remove(id);
  }
}
