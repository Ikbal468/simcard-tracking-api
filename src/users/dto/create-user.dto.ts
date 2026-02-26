import { IsString, IsNotEmpty, IsInt, IsOptional } from "class-validator";
import { Type } from "class-transformer";

export class CreateUserDto {
  @IsString()
  @IsNotEmpty()
  username: string;

  @IsString()
  @IsNotEmpty()
  password: string;

  @IsOptional()
  @IsInt()
  @Type(() => Number)
  roleId?: number;
}
