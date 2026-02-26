import {
  Injectable,
  CanActivate,
  ExecutionContext,
  UnauthorizedException,
} from "@nestjs/common";
import * as jwt from "jsonwebtoken";
import { UsersService } from "../../users/users.service";

const JWT_SECRET = process.env.JWT_SECRET || "change-me";

@Injectable()
export class AuthGuard implements CanActivate {
  constructor(private readonly usersService: UsersService) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest();
    const authHeader = request.headers.authorization;

    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      throw new UnauthorizedException("No token provided");
    }

    const token = authHeader.split(" ")[1];

    try {
      const payload: any = jwt.verify(token, JWT_SECRET);
      const user = await this.usersService.findOne(payload.sub);

      if (!user) {
        throw new UnauthorizedException("User not found");
      }

      // Attach user to request object
      request.user = user;
      return true;
    } catch (error) {
      throw new UnauthorizedException("Invalid token");
    }
  }
}
