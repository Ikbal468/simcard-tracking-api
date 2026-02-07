import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository, DataSource } from "typeorm";
const XLSX: any = require("xlsx");
import { SimCard, SimStatus } from "../entities/sim-card.entity";
import { SimType } from "../entities/sim-type.entity";
import {
  SimTransaction,
  TransactionType,
} from "../entities/sim-transaction.entity";
import { Customer } from "../entities/customer.entity";

@Injectable()
export class SimCardService {
  constructor(
    @InjectRepository(SimCard)
    private readonly repo: Repository<SimCard>,
    @InjectRepository(SimType)
    private readonly typeRepo: Repository<SimType>,
    @InjectRepository(SimTransaction)
    private readonly trxRepo: Repository<SimTransaction>,
    @InjectRepository(Customer)
    private readonly custRepo: Repository<Customer>,
    private dataSource: DataSource,
  ) {}

  async create(payload: Partial<SimCard>) {
    if (payload.simType && typeof payload.simType === "number") {
      const t = await this.typeRepo.findOne({
        where: { id: payload.simType as any },
      });
      if (!t) throw new NotFoundException("SimType not found");
      payload.simType = t;
    }
    const serial = payload.serialNumber?.toString().trim();
    const imsi = payload.imsi != null ? payload.imsi?.toString().trim() : null;

    if (!serial) throw new BadRequestException("serialNumber is required");

    // prevent assigning an IMSI that's already used by another sim
    if (imsi) {
      const existsByImsi = await this.repo.findOne({ where: { imsi } });
      if (existsByImsi) {
        throw new BadRequestException("IMSI already assigned to another sim");
      }
    }

    const ent = this.repo.create(payload);
    const saved = await this.repo.save(ent);

    // create STOCK_IN transaction when sim is in stock
    if ((saved.status ?? SimStatus.IN_STOCK) === SimStatus.IN_STOCK) {
      try {
        await this.trxRepo.save({
          simCard: saved,
          type: TransactionType.STOCK_IN,
        } as any);
      } catch (err) {
        // don't fail creation if transaction save errors unexpectedly
      }
    }

    return saved;
  }

  async findAll() {
    const sims = await this.repo.find({
      relations: ["simType", "transactions", "transactions.customer"],
    });
    return sims.map((s) => {
      let customerName: string | null = null;
      if (
        s.status === SimStatus.OUT_STOCK &&
        s.transactions &&
        s.transactions.length
      ) {
        const outTrx = s.transactions
          .filter((t) => t.type === "STOCK_OUT" && t.customer)
          .sort((a, b) => (b.createdAt as any) - (a.createdAt as any));
        if (outTrx.length) customerName = outTrx[0].customer?.name || null;
      }
      return {
        id: s.id,
        serialNumber: s.serialNumber,
        imsi: s.imsi,
        status: s.status,
        simType: s.simType,
        customerName,
      };
    });
  }

  async findPaginated(page = 1, limit = 10) {
    const p = Math.max(1, Number(page) || 1);
    const l = Math.max(1, Math.min(200, Number(limit) || 10));
    const skip = (p - 1) * l;

    const [sims, total] = await this.repo.findAndCount({
      relations: ["simType", "transactions", "transactions.customer"],
      skip,
      take: l,
      order: { id: "ASC" },
    });

    const items = sims.map((s) => {
      let customerName: string | null = null;
      if (
        s.status === SimStatus.OUT_STOCK &&
        s.transactions &&
        s.transactions.length
      ) {
        const outTrx = s.transactions
          .filter((t) => t.type === "STOCK_OUT" && t.customer)
          .sort((a, b) => (b.createdAt as any) - (a.createdAt as any));
        if (outTrx.length) customerName = outTrx[0].customer?.name || null;
      }
      return {
        id: s.id,
        serialNumber: s.serialNumber,
        imsi: s.imsi,
        status: s.status,
        simType: s.simType,
        customerName,
      };
    });

    return { items, total, page: p, limit: l };
  }

  async findOne(id: number) {
    const ent = await this.repo.findOne({
      where: { id },
      relations: ["simType", "transactions", "transactions.customer"],
    });
    if (!ent) throw new NotFoundException("SimCard not found");
    let customerName: string | null = null;
    if (
      ent.status === SimStatus.OUT_STOCK &&
      ent.transactions &&
      ent.transactions.length
    ) {
      const outTrx = ent.transactions
        .filter((t) => t.type === "STOCK_OUT" && t.customer)
        .sort((a, b) => (b.createdAt as any) - (a.createdAt as any));
      if (outTrx.length) customerName = outTrx[0].customer?.name || null;
    }
    return {
      id: ent.id,
      serialNumber: ent.serialNumber,
      imsi: ent.imsi,
      status: ent.status,
      simType: ent.simType,
      transactions: ent.transactions,
      customerName,
    };
  }

  async setStatus(id: number, status: SimStatus) {
    const sim = await this.repo.findOne({ where: { id } });
    if (!sim) throw new NotFoundException("SimCard not found");
    sim.status = status;
    return this.repo.save(sim);
  }

  async update(id: number, payload: Partial<SimCard>) {
    const ent = await this.repo.findOne({ where: { id } });
    if (!ent) throw new NotFoundException("SimCard not found");
    if (payload.simType && typeof payload.simType === "number") {
      const t = await this.typeRepo.findOne({
        where: { id: payload.simType as any },
      });
      if (!t) throw new NotFoundException("SimType not found");
      payload.simType = t as any;
    }
    this.repo.merge(ent, payload as any);
    return this.repo.save(ent);
  }

  /**
   * Change the customer associated with a sim card. This will update the
   * most recent STOCK_OUT transaction's customer. If no STOCK_OUT exists and a
   * customerId is provided, a STOCK_OUT transaction will be created.
   */
  async changeCustomer(id: number, customerId: number | null) {
    return this.dataSource.transaction(async (manager) => {
      const simRepo = manager.getRepository<SimCard>(SimCard);
      const trxRepo = manager.getRepository<SimTransaction>(SimTransaction);
      const custRepo = manager.getRepository<Customer>(Customer);

      const sim = await simRepo.findOne({
        where: { id },
        relations: ["transactions"],
      });
      if (!sim) throw new NotFoundException("SimCard not found");

      let customer: Customer | null = null;
      if (customerId != null) {
        customer = await custRepo.findOne({ where: { id: customerId } });
        if (!customer) throw new NotFoundException("Customer not found");
      }

      // find latest STOCK_OUT transaction (by createdAt desc)
      const outTrx = (sim.transactions || [])
        .filter((t) => t.type === TransactionType.STOCK_OUT)
        .sort((a, b) => (b.createdAt as any) - (a.createdAt as any));

      if (outTrx.length) {
        const latest = outTrx[0];
        latest.customer = customer ?? undefined;
        await trxRepo.save(latest);
      } else {
        // no STOCK_OUT found: if customer provided, create one to reflect assignment
        if (customer) {
          await trxRepo.save({
            simCard: sim,
            customer: customer,
            type: TransactionType.STOCK_OUT,
          } as any);
        }
      }

      // return updated sim with relations
      return simRepo.findOne({
        where: { id },
        relations: ["simType", "transactions", "transactions.customer"],
      });
    });
  }

  async remove(id: number) {
    const ent = await this.repo.findOne({ where: { id } });
    if (!ent) throw new NotFoundException("SimCard not found");
    await this.repo.remove(ent);
    return { deleted: true };
  }

  async summary() {
    const total = await this.repo.count();
    const inStock = await this.repo.count({
      where: { status: SimStatus.IN_STOCK },
    });
    const outStock = await this.repo.count({
      where: { status: SimStatus.OUT_STOCK },
    });

    const byTypeRaw = await this.repo
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

    return { total, inStock, outStock, byType };
  }

  async importFromExcel(buffer: Buffer) {
    const wb = XLSX.read(buffer, { type: "buffer" });
    const sheetName = wb.SheetNames[0];
    const rows: Record<string, any>[] = XLSX.utils.sheet_to_json(
      wb.Sheets[sheetName],
      { defval: null },
    );
    const results: Array<any> = [];

    await this.dataSource.transaction(async (manager) => {
      const simRepo = manager.getRepository<SimCard>(SimCard);
      const typeRepo = manager.getRepository<SimType>(SimType);
      const trxRepo = manager.getRepository<SimTransaction>(SimTransaction);
      const custRepo = manager.getRepository<Customer>(Customer);

      for (let i = 0; i < rows.length; i++) {
        const row = rows[i];
        const line = i + 1;
        try {
          const rawStatus = (row["status"] ?? "IN_STOCK")
            .toString()
            .trim()
            .toUpperCase();
          if (rawStatus !== "IN_STOCK") {
            results.push({ line, status: "skipped", reason: "not IN_STOCK" });
            continue;
          }

          const serial = (row["serialNumber"] ?? row["serial"] ?? "")
            .toString()
            .trim();
          if (!serial) throw new Error("serialNumber is required");

          const imsi = row["imsi"] ?? null;

          // resolve or create simType
          let simType: SimType | null = null;
          if (row["simTypeId"]) {
            simType = await typeRepo.findOne({
              where: { id: Number(row["simTypeId"]) },
            });
          } else if (row["simTypeName"] || row["simType"]) {
            const name = (row["simTypeName"] ?? row["simType"])
              .toString()
              .trim();
            simType = await typeRepo.findOne({ where: { name } });
            if (!simType) {
              simType = await typeRepo.save({
                name,
                purchaseProduct: row["purchaseProduct"] ?? null,
              } as any);
            }
          }

          // resolve or create customer
          let customer: Customer | null = null;
          if (row["customerId"]) {
            customer = await custRepo.findOne({
              where: { id: Number(row["customerId"]) },
            });
          } else if (row["customerName"]) {
            const cname = row["customerName"].toString().trim();
            customer = await custRepo.findOne({ where: { name: cname } });
            if (!customer) {
              customer = await custRepo.save({ name: cname } as any);
            }
          }

          // upsert sim card with duplicate check (skip if same serial+imsi already IN_STOCK)
          let sim = await simRepo.findOne({ where: { serialNumber: serial } });

          if (!sim) {
            // create new sim and a STOCK_IN transaction
            sim = await simRepo.save({
              serialNumber: serial,
              imsi: imsi ?? null,
              status: SimStatus.IN_STOCK,
              simType: simType ?? undefined,
            } as any);
            const incomingImsiRaw = imsi != null ? String(imsi).trim() : null;
            results.push({
              line,
              status: "created",
              serial,
              debug: {
                incomingImsi: row["imsi"],
                incomingImsiRaw,
                existingImsi: null,
                existingImsiRaw: null,
                imsiMatch: false,
              },
            });

            await trxRepo.save({
              simCard: sim,
              customer: customer ?? undefined,
              type: TransactionType.STOCK_IN,
              createdAt: row["receivedDate"]
                ? new Date(row["receivedDate"])
                : undefined,
            } as any);
          } else {
            // existing sim found: check if both serialNumber and IMSI match exactly

            const incomingImsiRaw = imsi != null ? String(imsi).trim() : null;
            const existingImsiRaw =
              sim.imsi != null ? String(sim.imsi).trim() : null;

            // Compare IMSI: both null/empty OR both have same value (case-insensitive)
            const imsiMatch =
              (incomingImsiRaw === null && existingImsiRaw === null) ||
              (incomingImsiRaw === "" && existingImsiRaw === "") ||
              (incomingImsiRaw !== null &&
                existingImsiRaw !== null &&
                incomingImsiRaw.toLowerCase() ===
                  existingImsiRaw.toLowerCase());

            if (imsiMatch) {
              // Duplicate: same serial + same IMSI -> reject/skip (no update, no transaction)
              results.push({
                line,
                status: "skipped",
                reason: "duplicate serial+imsi",
                debug: {
                  incomingImsi: row["imsi"],
                  incomingImsiRaw,
                  existingImsi: sim.imsi,
                  existingImsiRaw,
                  imsiMatch: true,
                  simId: sim.id,
                },
              });
              continue;
            }

            // Different IMSI -> update sim and create STOCK_IN transaction
            const prevImsi = sim.imsi;
            sim.imsi = imsi ?? sim.imsi;
            sim.status = SimStatus.IN_STOCK;
            if (simType) sim.simType = simType as any;
            await simRepo.save(sim);
            results.push({
              line,
              status: "updated",
              serial,
              debug: {
                incomingImsi: row["imsi"],
                incomingImsiRaw,
                existingImsi: prevImsi,
                existingImsiRaw:
                  prevImsi != null ? String(prevImsi).trim() : null,
                imsiMatch: false,
                simId: sim.id,
              },
            });

            await trxRepo.save({
              simCard: sim,
              customer: customer ?? undefined,
              type: TransactionType.STOCK_IN,
              createdAt: row["receivedDate"]
                ? new Date(row["receivedDate"])
                : undefined,
            } as any);
          }
        } catch (err: any) {
          results.push({ line, status: "error", message: err.message });
        }
      }
    });

    return { total: rows.length, results };
  }
}
