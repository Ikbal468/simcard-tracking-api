import { Injectable, NotFoundException } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository } from "typeorm";
import { Customer } from "../entities/customer.entity";

@Injectable()
export class CustomerService {
  constructor(
    @InjectRepository(Customer)
    private readonly repo: Repository<Customer>,
  ) {}

  async create(payload: Partial<Customer>) {
    const ent = this.repo.create(payload);
    return this.repo.save(ent);
  }

  async findAll() {
    return this.repo.find();
  }

  async findOne(id: number) {
    const ent = await this.repo.findOne({ where: { id } });
    if (!ent) throw new NotFoundException("Customer not found");
    return ent;
  }

  async update(id: number, payload: Partial<Customer>) {
    const ent = await this.repo.findOne({ where: { id } });
    if (!ent) throw new NotFoundException("Customer not found");
    this.repo.merge(ent, payload);
    return this.repo.save(ent);
  }

  async remove(id: number) {
    const ent = await this.repo.findOne({ where: { id } });
    if (!ent) throw new NotFoundException("Customer not found");
    await this.repo.remove(ent);
    return { deleted: true };
  }
}
