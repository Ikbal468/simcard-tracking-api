import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  CreateDateColumn,
} from "typeorm";
import { SimCard } from "./sim-card.entity";
import { Customer } from "./customer.entity";

export enum TransactionType {
  STOCK_IN = "STOCK_IN",
  STOCK_OUT = "STOCK_OUT",
}

@Entity("sim_transactions")
export class SimTransaction {
  @PrimaryGeneratedColumn()
  id: number;

  @ManyToOne(() => SimCard, (sim) => sim.transactions)
  simCard: SimCard;

  @ManyToOne(() => Customer, (customer) => customer.transactions, {
    nullable: true,
  })
  customer: Customer;

  @Column({ type: "text" })
  type: TransactionType;

  @CreateDateColumn()
  createdAt: Date;
}
