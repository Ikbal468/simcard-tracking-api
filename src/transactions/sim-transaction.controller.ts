import {
  Controller,
  Post,
  Body,
  Get,
  Param,
  Patch,
  Delete,
  ParseIntPipe,
  Query,
} from "@nestjs/common";
import { SimTransactionService } from "./sim-transaction.service";
import { TransactionType } from "../entities/sim-transaction.entity";
import { CreateTransactionDto } from "./dto/create-transaction.dto";
import { UpdateTransactionDto } from "./dto/update-transaction.dto";
import { SearchTransactionDto } from "./dto/search-transaction.dto";

@Controller("transactions")
export class SimTransactionController {
  constructor(private readonly svc: SimTransactionService) {}

  @Post()
  create(@Body() body: CreateTransactionDto) {
    return this.svc.create(body as any);
  }

  @Get()
  list(
    @Query("serialNumber") serialNumber?: string,
    @Query("type") type?: TransactionType,
    @Query("simStatus") simStatus?: string,
    @Query("page") page?: string,
    @Query("limit") limit?: string,
  ) {
    const p = page ? Number(page) : undefined;
    const l = limit ? Number(limit) : undefined;
    return this.svc.findAll({
      serialNumber,
      type,
      simStatus,
      page: p,
      limit: l,
    } as any);
  }

  @Post("search")
  search(@Body() body: SearchTransactionDto & { status?: string }) {
    const { serialNumber, type, simStatus, status, page, limit } = body as any;
    return this.svc.findAll({
      serialNumber,
      type,
      simStatus: simStatus ?? status,
      page: page ? Number(page) : undefined,
      limit: limit ? Number(limit) : undefined,
    } as any);
  }

  @Get(":id")
  one(@Param("id", ParseIntPipe) id: number) {
    return this.svc.findOne(id);
  }

  @Get("customer/:id/report")
  report(@Param("id") id: string) {
    return this.svc.reportByCustomer(Number(id));
  }

  @Patch(":id")
  update(
    @Param("id", ParseIntPipe) id: number,
    @Body() body: UpdateTransactionDto,
  ) {
    return this.svc.update(id, body as any);
  }

  @Delete(":id")
  remove(@Param("id", ParseIntPipe) id: number) {
    return this.svc.remove(id);
  }
}
