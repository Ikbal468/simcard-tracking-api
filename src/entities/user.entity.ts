import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  JoinColumn,
  ManyToMany,
  JoinTable,
} from "typeorm";
import { Role } from "./role.entity";
import { Permission } from "./permission.entity";

@Entity("users")
export class User {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ unique: true })
  username: string;

  @Column()
  password: string; // hashed

  @Column({ name: "role" })
  roleName: string | null; // legacy denormalized role column (e.g. 'admin')

  @Column({ name: "role_id", nullable: true })
  roleId: number;

  @ManyToOne(() => Role, (role) => role.users, { eager: true })
  @JoinColumn({ name: "role_id" })
  role: Role;

  @ManyToMany(() => Permission, { eager: true })
  @JoinTable({
    name: "user_permissions",
    joinColumn: { name: "user_id", referencedColumnName: "id" },
    inverseJoinColumn: { name: "permission_id", referencedColumnName: "id" },
  })
  permissions: Permission[];
}
