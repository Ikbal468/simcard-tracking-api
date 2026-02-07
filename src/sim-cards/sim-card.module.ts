import { Module } from "@nestjs/common";
import { TypeOrmModule } from "@nestjs/typeorm";
import { SimCard } from "../entities/sim-card.entity";
import { SimTransaction } from "../entities/sim-transaction.entity";
import { Customer } from "../entities/customer.entity";
import { SimType } from "../entities/sim-type.entity";
import { SimCardService } from "./sim-card.service";
import { SimCardController } from "./sim-card.controller";
import { SimTypeModule } from "../sim-types/sim-type.module";

@Module({
  imports: [
    TypeOrmModule.forFeature([SimCard, SimTransaction, Customer, SimType]),
    SimTypeModule,
  ],
  providers: [SimCardService],
  controllers: [SimCardController],
  exports: [SimCardService, TypeOrmModule],
})
export class SimCardModule {}
