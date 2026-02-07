import { IsInt, IsOptional, IsIn } from "class-validator";

export class CreateTransactionDto {
  @IsInt()
  simCardId: number;

  @IsOptional()
  @IsInt()
  customerId?: number;

  @IsIn(["STOCK_IN", "STOCK_OUT"])
  type: "STOCK_IN" | "STOCK_OUT";
}
