import {
  Controller,
  Post,
  Body,
  UsePipes,
  ValidationPipe,
} from "@nestjs/common";
import { AuthService } from "./auth.service";
import { IsString, IsNotEmpty } from "class-validator";

class LoginDto {
  @IsString()
  @IsNotEmpty()
  username: string;

  @IsString()
  @IsNotEmpty()
  password: string;
}

@Controller("auth")
export class AuthController {
  constructor(private readonly svc: AuthService) {}

  @Post("/login")
  @UsePipes(new ValidationPipe({ whitelist: true }))
  async login(@Body() body: LoginDto) {
    return this.svc.login(body.username, body.password);
  }
}
