import { IsOptional, IsIn, IsString, IsInt, Min } from "class-validator";
import { TransactionType } from "../../entities/sim-transaction.entity";

export class SearchTransactionDto {
  @IsOptional()
  @IsString()
  serialNumber?: string;

  @IsOptional()
  @IsIn([TransactionType.STOCK_IN, TransactionType.STOCK_OUT])
  type?: TransactionType;

  @IsOptional()
  @IsIn(["IN_STOCK", "OUT_STOCK"])
  simStatus?: string;

  @IsOptional()
  @IsInt()
  @Min(1)
  page?: number;

  @IsOptional()
  @IsInt()
  @Min(1)
  limit?: number;
}
