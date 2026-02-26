import { Module } from "@nestjs/common";
import { TypeOrmModule } from "@nestjs/typeorm";
import { SimTransaction } from "../entities/sim-transaction.entity";
import { SimTransactionService } from "./sim-transaction.service";
import { SimTransactionController } from "./sim-transaction.controller";
import { SimCard } from "../entities/sim-card.entity";
import { Customer } from "../entities/customer.entity";
import { AuthModule } from "../auth/auth.module";

@Module({
  imports: [
    TypeOrmModule.forFeature([SimTransaction, SimCard, Customer]),
    AuthModule,
  ],
  providers: [SimTransactionService],
  controllers: [SimTransactionController],
})
export class SimTransactionModule {}
