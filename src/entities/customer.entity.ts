import { Entity, PrimaryGeneratedColumn, Column, OneToMany } from "typeorm";
import { SimTransaction } from "./sim-transaction.entity";

@Entity("customers")
export class Customer {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  name: string;

  @Column({ nullable: true })
  email: string;

  @OneToMany(() => SimTransaction, (trx) => trx.customer)
  transactions: SimTransaction[];
}
