import { IsString, IsNotEmpty, IsIn } from "class-validator";

export class CreateUserDto {
  @IsString()
  @IsNotEmpty()
  username: string;

  @IsString()
  @IsNotEmpty()
  password: string;

  @IsString()
  @IsIn(["admin", "operator"])
  role: string;
}
