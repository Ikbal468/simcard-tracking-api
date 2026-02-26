import { Module } from "@nestjs/common";
import { TypeOrmModule } from "@nestjs/typeorm";
import { Customer } from "../entities/customer.entity";
import { CustomerService } from "./customer.service";
import { CustomerController } from "./customer.controller";
import { AuthModule } from "../auth/auth.module";

@Module({
  imports: [TypeOrmModule.forFeature([Customer]), AuthModule],
  providers: [CustomerService],
  controllers: [CustomerController],
  exports: [CustomerService, TypeOrmModule],
})
export class CustomerModule {}
