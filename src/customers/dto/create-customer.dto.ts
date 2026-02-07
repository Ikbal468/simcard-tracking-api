import { IsString, IsNotEmpty, IsEmail, IsOptional } from "class-validator";

export class CreateCustomerDto {
  @IsString()
  @IsNotEmpty()
  name: string;

  @IsOptional()
  @IsEmail()
  email?: string;
}
