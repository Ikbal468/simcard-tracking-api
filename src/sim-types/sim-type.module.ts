import { Module } from "@nestjs/common";
import { TypeOrmModule } from "@nestjs/typeorm";
import { SimType } from "../entities/sim-type.entity";
import { SimTypeService } from "./sim-type.service";
import { SimTypeController } from "./sim-type.controller";
import { AuthModule } from "../auth/auth.module";

@Module({
  imports: [TypeOrmModule.forFeature([SimType]), AuthModule],
  controllers: [SimTypeController],
  providers: [SimTypeService],
  exports: [SimTypeService, TypeOrmModule],
})
export class SimTypeModule {}
