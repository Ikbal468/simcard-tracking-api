import { Entity, PrimaryGeneratedColumn, Column, OneToMany } from "typeorm";
import { SimCard } from "./sim-card.entity";

@Entity("sim_types")
export class SimType {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ unique: true })
  name: string; // digi, maxis, flexiroam, singtel

  @Column()
  purchaseProduct: string;

  @OneToMany(() => SimCard, (sim) => sim.simType)
  simCards: SimCard[];
}
