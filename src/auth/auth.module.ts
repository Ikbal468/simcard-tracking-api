import { Module, forwardRef } from "@nestjs/common";
import { UsersModule } from "../users/users.module";
import { AuthService } from "./auth.service";
import { AuthController } from "./auth.controller";
import { AuthGuard } from "./guards/auth.guard";
import { PermissionsGuard } from "./guards/permissions.guard";

@Module({
  imports: [forwardRef(() => UsersModule)],
  providers: [AuthService, AuthGuard, PermissionsGuard],
  controllers: [AuthController],
  exports: [AuthService, AuthGuard, PermissionsGuard, UsersModule],
})
export class AuthModule {}
