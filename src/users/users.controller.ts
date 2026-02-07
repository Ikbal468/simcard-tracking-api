import {
  Controller,
  Post,
  Body,
  Get,
  UsePipes,
  ValidationPipe,
} from "@nestjs/common";
import { UsersService } from "./users.service";
import { CreateUserDto } from "./dto/create-user.dto";
import * as bcrypt from "bcryptjs";

@Controller("users")
export class UsersController {
  constructor(private readonly svc: UsersService) {}

  @Post()
  @UsePipes(new ValidationPipe({ whitelist: true }))
  async create(@Body() body: CreateUserDto) {
    const hashed = await bcrypt.hash(body.password, 10);
    return this.svc.create({
      username: body.username,
      password: hashed,
      role: body.role,
    });
  }

  @Get()
  async list() {
    return this.svc.findAll();
  }
}
