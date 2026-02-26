import { Module } from "@nestjs/common";
import { TypeOrmModule } from "@nestjs/typeorm";
import { DashboardService } from "./dashboard.service";
import { DashboardController } from "./dashboard.controller";
import { SimCard } from "../entities/sim-card.entity";
import { SimTransaction } from "../entities/sim-transaction.entity";
import { SimType } from "../entities/sim-type.entity";
import { Customer } from "../entities/customer.entity";
import { AuthModule } from "../auth/auth.module";

@Module({
  imports: [
    TypeOrmModule.forFeature([SimCard, SimTransaction, SimType, Customer]),
    AuthModule,
  ],
  providers: [DashboardService],
  controllers: [DashboardController],
})
export class DashboardModule {}
