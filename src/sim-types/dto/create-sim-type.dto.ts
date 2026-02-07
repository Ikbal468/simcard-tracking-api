import { IsString, IsNotEmpty } from "class-validator";

export class CreateSimTypeDto {
  @IsString()
  @IsNotEmpty()
  name: string;

  @IsString()
  @IsNotEmpty()
  purchaseProduct: string;
}
