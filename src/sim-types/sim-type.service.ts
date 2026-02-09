import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository, QueryFailedError } from "typeorm";
import { SimType } from "../entities/sim-type.entity";

@Injectable()
export class SimTypeService {
  constructor(
    @InjectRepository(SimType)
    private readonly repo: Repository<SimType>,
  ) {}

  async create(payload: Partial<SimType>) {
    const ent = this.repo.create(payload);
    try {
      return await this.repo.save(ent);
    } catch (err) {
      if (
        err instanceof QueryFailedError &&
        (err.message?.includes("UNIQUE constraint failed") ||
          (err as any).driverError?.code === "SQLITE_CONSTRAINT")
      ) {
        throw new BadRequestException("Sim type with that name already exists");
      }
      throw err;
    }
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
    try {
      return await this.repo.save(ent);
    } catch (err) {
      if (
        err instanceof QueryFailedError &&
        (err.message?.includes("UNIQUE constraint failed") ||
          (err as any).driverError?.code === "SQLITE_CONSTRAINT")
      ) {
        throw new BadRequestException("Sim type with that name already exists");
      }
      throw err;
    }
  }

  async remove(id: number) {
    const ent = await this.repo.findOne({ where: { id } });
    if (!ent) throw new NotFoundException("SimType not found");
    await this.repo.remove(ent);
    return { deleted: true };
  }
}
