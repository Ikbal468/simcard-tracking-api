import { Injectable, NotFoundException } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository } from "typeorm";
import { SimType } from "../entities/sim-type.entity";

@Injectable()
export class SimTypeService {
  constructor(
    @InjectRepository(SimType)
    private readonly repo: Repository<SimType>,
  ) {}

  async create(payload: Partial<SimType>) {
    const ent = this.repo.create(payload);
    return this.repo.save(ent);
  }

  async findAll() {
    return this.repo.find();
  }

  async findOne(id: number) {
    const ent = await this.repo.findOne({ where: { id } });
    if (!ent) throw new NotFoundException("SimType not found");
    return ent;
  }

  async update(id: number, payload: Partial<SimType>) {
    const ent = await this.repo.findOne({ where: { id } });
    if (!ent) throw new NotFoundException("SimType not found");
    this.repo.merge(ent, payload);
    return this.repo.save(ent);
  }

  async remove(id: number) {
    const ent = await this.repo.findOne({ where: { id } });
    if (!ent) throw new NotFoundException("SimType not found");
    await this.repo.remove(ent);
    return { deleted: true };
  }
}
