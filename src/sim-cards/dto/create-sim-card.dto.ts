import { IsString, IsNotEmpty, IsInt, IsOptional } from "class-validator";

export class CreateSimCardDto {
  @IsString()
  @IsNotEmpty()
  serialNumber: string;

  @IsString()
  @IsNotEmpty()
  imsi: string;

  @IsInt()
  simType: number;

  @IsOptional()
  @IsString()
  status?: string;
}
