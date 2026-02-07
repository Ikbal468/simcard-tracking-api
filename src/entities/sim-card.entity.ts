import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  OneToMany,
} from "typeorm";
import { SimType } from "./sim-type.entity";
import { SimTransaction } from "./sim-transaction.entity";

export enum SimStatus {
  IN_STOCK = "IN_STOCK",
  OUT_STOCK = "OUT_STOCK",
}

@Entity("sim_cards")
export class SimCard {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ unique: true })
  serialNumber: string;

  @Column({ unique: true })
  imsi: string;

  @Column({ type: "text", default: SimStatus.IN_STOCK })
  status: SimStatus;

  @ManyToOne(() => SimType, (type) => type.simCards)
  simType: SimType;

  @OneToMany(() => SimTransaction, (trx) => trx.simCard)
  transactions: SimTransaction[];
}
