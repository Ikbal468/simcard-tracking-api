import { Injectable } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository, DataSource } from "typeorm";
import { SimCard, SimStatus } from "../entities/sim-card.entity";
import {
  SimTransaction,
  TransactionType,
} from "../entities/sim-transaction.entity";
import { SimType } from "../entities/sim-type.entity";
import { Customer } from "../entities/customer.entity";

@Injectable()
export class DashboardService {
  constructor(
    @InjectRepository(SimCard) private readonly simRepo: Repository<SimCard>,
    @InjectRepository(SimTransaction)
    private readonly trxRepo: Repository<SimTransaction>,
    @InjectRepository(SimType) private readonly typeRepo: Repository<SimType>,
    @InjectRepository(Customer)
    private readonly custRepo: Repository<Customer>,
    private readonly dataSource: DataSource,
  ) {}

  async getOverview(days = 30) {
    const now = new Date();
    const from = new Date(now);
    from.setDate(now.getDate() - (days - 1));
    from.setHours(0, 0, 0, 0);

    const raw = await this.trxRepo
      .createQueryBuilder("trx")
      .select("DATE(trx.createdAt)", "date")
      .addSelect("trx.type", "type")
      .addSelect("COUNT(trx.id)", "count")
      .where("trx.createdAt >= :from", { from: from.toISOString() })
      .groupBy("DATE(trx.createdAt)")
      .addGroupBy("trx.type")
      .orderBy("DATE(trx.createdAt)", "ASC")
      .getRawMany();

    const dayMap: Record<string, any> = {};
    for (let i = 0; i < days; i++) {
      const d = new Date(from);
      d.setDate(from.getDate() + i);
      const key = d.toISOString().slice(0, 10);
      dayMap[key] = { date: key, stockIn: 0, stockOut: 0 };
    }

    raw.forEach((r) => {
      const key = String(r.date).slice(0, 10);
      const cnt = Number(r.count || 0);
      if (!dayMap[key]) dayMap[key] = { date: key, stockIn: 0, stockOut: 0 };
      if (r.type === TransactionType.STOCK_IN) dayMap[key].stockIn = cnt;
      else dayMap[key].stockOut = cnt;
    });

    const transactionHistory = Object.values(dayMap);

    const byTypeRaw = await this.simRepo
      .createQueryBuilder("sim")
      .leftJoin("sim.simType", "type")
      .select("type.name", "name")
      .addSelect("COUNT(sim.id)", "count")
      .groupBy("type.name")
      .getRawMany();

    const byType = byTypeRaw.map((r) => ({
      name: r.name || "unknown",
      count: Number(r.count),
    }));

    const byCustomerRaw: any[] = await this.dataSource.query(
      `
      SELECT c.id, c.name, COUNT(*) as count FROM customers c
      JOIN sim_transactions trx ON trx.customerId = c.id
      JOIN (
        SELECT "simCardId", MAX("createdAt") as m FROM sim_transactions GROUP BY "simCardId"
      ) lt ON lt."simCardId" = trx."simCardId" AND lt.m = trx."createdAt"
      WHERE trx.type = 'STOCK_OUT'
      GROUP BY c.id, c.name
      ORDER BY count DESC
    `,
    );

    const byCustomer = byCustomerRaw.map((r) => ({
      id: Number(r.id),
      name: r.name,
      count: Number(r.count),
    }));

    const total = await this.simRepo.count();
    const inStock = await this.simRepo.count({
      where: { status: SimStatus.IN_STOCK },
    });
    const outStock = await this.simRepo.count({
      where: { status: SimStatus.OUT_STOCK },
    });

    return { total, inStock, outStock, transactionHistory, byType, byCustomer };
  }
}
