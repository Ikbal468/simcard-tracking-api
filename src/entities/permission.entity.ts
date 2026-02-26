import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToMany,
  JoinTable,
} from "typeorm";
import { Role } from "./role.entity";
import { User } from "./user.entity";

@Entity("permissions")
export class Permission {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  resource: string; // 'customers', 'simcards', 'dashboard', 'simtypes', 'transactions'

  @Column()
  action: string; // 'view', 'create', 'edit', 'delete'

  @ManyToMany(() => Role, (role) => role.permissions)
  @JoinTable({
    name: "role_permissions",
    joinColumn: { name: "permission_id", referencedColumnName: "id" },
    inverseJoinColumn: { name: "role_id", referencedColumnName: "id" },
  })
  roles: Role[];

  @ManyToMany(() => User, (user) => user.permissions)
  users: User[];
}
