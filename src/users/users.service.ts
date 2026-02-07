import { Injectable, NotFoundException } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository } from "typeorm";
import { User } from "../entities/user.entity";

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User)
    private readonly repo: Repository<User>,
  ) {}

  async create(payload: Partial<User>) {
    const ent = this.repo.create(payload);
    return this.repo.save(ent);
  }

  async findAll() {
    return this.repo.find();
  }

  async findOne(id: number) {
    const ent = await this.repo.findOne({ where: { id } });
    if (!ent) throw new NotFoundException("User not found");
    return ent;
  }

  async findByUsername(username: string) {
    return this.repo.findOne({ where: { username } });
  }
}
