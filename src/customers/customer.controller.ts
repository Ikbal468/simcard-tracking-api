import {
  Controller,
  Post,
  Body,
  Get,
  Param,
  Patch,
  Delete,
  ParseIntPipe,
} from "@nestjs/common";
import { CustomerService } from "./customer.service";
import { CreateCustomerDto } from "./dto/create-customer.dto";
import { UpdateCustomerDto } from "./dto/update-customer.dto";

@Controller("customers")
export class CustomerController {
  constructor(private readonly svc: CustomerService) {}

  @Post()
  create(@Body() body: CreateCustomerDto) {
    return this.svc.create(body);
  }

  @Get()
  list() {
    return this.svc.findAll();
  }

  @Get(":id")
  one(@Param("id") id: string) {
    return this.svc.findOne(Number(id));
  }

  @Patch(":id")
  update(
    @Param("id", ParseIntPipe) id: number,
    @Body() body: UpdateCustomerDto,
  ) {
    return this.svc.update(id, body as any);
  }

  @Delete(":id")
  remove(@Param("id", ParseIntPipe) id: number) {
    return this.svc.remove(id);
  }
}
