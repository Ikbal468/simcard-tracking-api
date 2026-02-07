import { IsOptional, IsInt } from "class-validator";

export class ChangeCustomerDto {
  @IsOptional()
  @IsInt()
  customerId?: number | null;
}
