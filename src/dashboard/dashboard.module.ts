import { Module } from "@nestjs/common";
import { TypeOrmModule } from "@nestjs/typeorm";
import { DashboardService } from "./dashboard.service";
import { DashboardController } from "./dashboard.controller";
import { SimCard } from "../entities/sim-card.entity";
import { SimTransaction } from "../entities/sim-transaction.entity";
import { SimType } from "../entities/sim-type.entity";
import { Customer } from "../entities/customer.entity";

@Module({
  imports: [
    TypeOrmModule.forFeature([SimCard, SimTransaction, SimType, Customer]),
  ],
  providers: [DashboardService],
  controllers: [DashboardController],
})
export class DashboardModule {}
