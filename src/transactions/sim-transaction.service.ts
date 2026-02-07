import { Injectable, NotFoundException } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository } from "typeorm";
import {
  SimTransaction,
  TransactionType,
} from "../entities/sim-transaction.entity";
import { SimCard, SimStatus } from "../entities/sim-card.entity";
import { Customer } from "../entities/customer.entity";

@Injectable()
export class SimTransactionService {
  constructor(
    @InjectRepository(SimTransaction)
    private readonly repo: Repository<SimTransaction>,
    @InjectRepository(SimCard)
    private readonly simRepo: Repository<SimCard>,
    @InjectRepository(Customer)
    private readonly custRepo: Repository<Customer>,
  ) {}

  async create(payload: {
    simCardId: number;
    customerId?: number;
    type: TransactionType;
  }) {
    const sim = await this.simRepo.findOne({
      where: { id: payload.simCardId },
    });
    if (!sim) throw new NotFoundException("SimCard not found");

    let customer: Customer | undefined;
    if (payload.customerId) {
      customer = await this.custRepo.findOne({
        where: { id: payload.customerId },
      });
      if (!customer) throw new NotFoundException("Customer not found");
    }

    // find latest transaction for this simCard
    const latest = await this.repo.findOne({
      where: { simCard: { id: sim.id } },
      order: { createdAt: "DESC" },
      relations: ["simCard", "customer"],
    });

    if (latest) {
      // update the latest transaction instead of creating a new one
      latest.type = payload.type;
      latest.customer = customer ?? undefined;
      await this.repo.save(latest);

      // update sim status
      sim.status =
        payload.type === TransactionType.STOCK_IN
          ? SimStatus.IN_STOCK
          : SimStatus.OUT_STOCK;
      await this.simRepo.save(sim);

      return latest;
    }

    // no existing transaction -> create a new one
    const trx = this.repo.create({
      simCard: sim,
      customer: customer,
      type: payload.type,
    });
    // update sim status
    sim.status =
      payload.type === TransactionType.STOCK_IN
        ? SimStatus.IN_STOCK
        : SimStatus.OUT_STOCK;
    await this.simRepo.save(sim);
    return this.repo.save(trx);
  }

  async reportByCustomer(customerId: number) {
    const inCount = await this.repo.count({
      where: { customer: { id: customerId }, type: TransactionType.STOCK_IN },
    });
    const outCount = await this.repo.count({
      where: { customer: { id: customerId }, type: TransactionType.STOCK_OUT },
    });
    return { customerId, stockIn: inCount, stockOut: outCount };
  }

  async findAll(filters?: {
    serialNumber?: string;
    type?: TransactionType;
    simStatus?: string;
    page?: number;
    limit?: number;
  }) {
    const qb = this.repo
      .createQueryBuilder("trx")
      .leftJoinAndSelect("trx.simCard", "simCard")
      .leftJoinAndSelect("trx.customer", "customer")
      .orderBy("trx.createdAt", "ASC")
      .addOrderBy("trx.id", "ASC");

    if (filters?.serialNumber) {
      qb.andWhere("simCard.serialNumber LIKE :serial", {
        serial: `%${filters.serialNumber}%`,
      });
    }

    if (filters?.type) {
      qb.andWhere("trx.type = :type", { type: filters.type });
    }

    if (filters?.simStatus) {
      qb.andWhere("simCard.status = :simStatus", {
        simStatus: filters.simStatus,
      });
    }

    const page = filters?.page && filters.page > 0 ? filters.page : 1;
    const limit =
      filters?.limit && filters.limit > 0 ? Math.min(filters.limit, 100) : 20;
    const skip = (page - 1) * limit;

    const [data, total] = await qb.skip(skip).take(limit).getManyAndCount();
    return { data, total, page, limit } as any;
  }

  async findOne(id: number) {
    const ent = await this.repo.findOne({
      where: { id },
      relations: ["simCard", "customer"],
    });
    if (!ent) throw new NotFoundException("Transaction not found");
    return ent;
  }

  async update(
    id: number,
    payload: {
      simCardId?: number;
      customerId?: number;
      type?: TransactionType;
    },
  ) {
    const trx = await this.repo.findOne({
      where: { id },
      relations: ["simCard"],
    });
    if (!trx) throw new NotFoundException("Transaction not found");

    const oldSim = trx.simCard;

    if (payload.simCardId && payload.simCardId !== trx.simCard.id) {
      const newSim = await this.simRepo.findOne({
        where: { id: payload.simCardId },
      });
      if (!newSim) throw new NotFoundException("SimCard not found");
      trx.simCard = newSim as any;
    }

    if (payload.customerId) {
      const cust = await this.custRepo.findOne({
        where: { id: payload.customerId },
      });
      if (!cust) throw new NotFoundException("Customer not found");
      trx.customer = cust as any;
    }

    if (payload.type) {
      trx.type = payload.type;
    }

    await this.repo.save(trx);

    // update sim statuses: set the sim for this transaction according to its type
    const targetSim = trx.simCard;
    targetSim.status =
      trx.type === TransactionType.STOCK_IN
        ? SimStatus.IN_STOCK
        : SimStatus.OUT_STOCK;
    await this.simRepo.save(targetSim);

    // if sim card changed, recompute oldSim status based on latest transaction
    if (oldSim && oldSim.id !== trx.simCard.id) {
      const latest = await this.repo.findOne({
        where: { simCard: { id: oldSim.id } },
        order: { createdAt: "DESC" },
      });
      if (latest) {
        oldSim.status =
          latest.type === TransactionType.STOCK_IN
            ? SimStatus.IN_STOCK
            : SimStatus.OUT_STOCK;
      } else {
        oldSim.status = SimStatus.IN_STOCK;
      }
      await this.simRepo.save(oldSim);
    }

    return trx;
  }

  async remove(id: number) {
    const trx = await this.repo.findOne({
      where: { id },
      relations: ["simCard"],
    });
    if (!trx) throw new NotFoundException("Transaction not found");
    const sim = trx.simCard;
    await this.repo.remove(trx);

    // recompute sim status based on latest transaction
    const latest = await this.repo.findOne({
      where: { simCard: { id: sim.id } },
      order: { createdAt: "DESC" },
    });
    if (latest) {
      sim.status =
        latest.type === TransactionType.STOCK_IN
          ? SimStatus.IN_STOCK
          : SimStatus.OUT_STOCK;
    } else {
      sim.status = SimStatus.IN_STOCK;
    }
    await this.simRepo.save(sim);

    return { deleted: true };
  }
}
