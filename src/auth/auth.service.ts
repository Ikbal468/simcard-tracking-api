import { Injectable, UnauthorizedException } from "@nestjs/common";
import { UsersService } from "../users/users.service";
import * as bcrypt from "bcryptjs";
import * as jwt from "jsonwebtoken";

const JWT_SECRET = process.env.JWT_SECRET || "change-me";
const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || "12h";

@Injectable()
export class AuthService {
  constructor(private readonly users: UsersService) {}

  async validateUser(username: string, password: string) {
    const user = await this.users.findByUsername(username);
    if (!user) return null;
    const ok = await bcrypt.compare(password, user.password);
    if (!ok) return null;
    return user;
  }

  async login(username: string, password: string) {
    const user = await this.validateUser(username, password);
    if (!user) throw new UnauthorizedException("Invalid credentials");
    const payload = {
      sub: user.id,
      username: user.username,
      role: user.role?.name || "operator",
    };
    const token = jwt.sign(payload, JWT_SECRET, { expiresIn: JWT_EXPIRES_IN });
    return {
      access_token: token,
      user: {
        id: user.id,
        username: user.username,
        role: user.role?.name || "operator",
        permissions: user.role?.permissions || [],
      },
    };
  }
}
