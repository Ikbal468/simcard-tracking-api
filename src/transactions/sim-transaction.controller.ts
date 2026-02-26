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
  UseGuards,
} from "@nestjs/common";
import { SimTransactionService } from "./sim-transaction.service";
import { TransactionType } from "../entities/sim-transaction.entity";
import { CreateTransactionDto } from "./dto/create-transaction.dto";
import { UpdateTransactionDto } from "./dto/update-transaction.dto";
import { SearchTransactionDto } from "./dto/search-transaction.dto";
import { AuthGuard } from "../auth/guards/auth.guard";
import { PermissionsGuard } from "../auth/guards/permissions.guard";
import { RequirePermission } from "../auth/decorators/permissions.decorator";

@Controller("transactions")
@UseGuards(AuthGuard, PermissionsGuard)
export class SimTransactionController {
  constructor(private readonly svc: SimTransactionService) {}

  @Post()
  @RequirePermission("transactions", "create")
  create(@Body() body: CreateTransactionDto) {
    return this.svc.create(body as any);
  }

  @Get()
  @RequirePermission("transactions", "view")
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
  @RequirePermission("transactions", "view")
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
  @RequirePermission("transactions", "view")
  one(@Param("id", ParseIntPipe) id: number) {
    return this.svc.findOne(id);
  }

  @Get("customer/:id/report")
  @RequirePermission("transactions", "view")
  report(@Param("id") id: string) {
    return this.svc.reportByCustomer(Number(id));
  }

  @Patch(":id")
  @RequirePermission("transactions", "edit")
  update(
    @Param("id", ParseIntPipe) id: number,
    @Body() body: UpdateTransactionDto,
  ) {
    return this.svc.update(id, body as any);
  }

  @Delete(":id")
  @RequirePermission("transactions", "delete")
  remove(@Param("id", ParseIntPipe) id: number) {
    return this.svc.remove(id);
  }
}
