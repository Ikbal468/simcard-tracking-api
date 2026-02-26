import {
  Injectable,
  CanActivate,
  ExecutionContext,
  ForbiddenException,
} from "@nestjs/common";
import { Reflector } from "@nestjs/core";
import { PERMISSIONS_KEY } from "../decorators/permissions.decorator";

@Injectable()
export class PermissionsGuard implements CanActivate {
  constructor(private reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    const requiredPermissions = this.reflector.getAllAndOverride<{
      resource: string;
      action: string;
    }>(PERMISSIONS_KEY, [context.getHandler(), context.getClass()]);

    if (!requiredPermissions) {
      return true; // No permissions required
    }

    const request = context.switchToHttp().getRequest();
    const user = request.user;

    if (!user) {
      throw new ForbiddenException("User not authenticated");
    }

    // Admin has all permissions
    if (user.role && user.role.name === "admin") {
      return true;
    }

    // Get effective permissions: user permissions override role permissions
    const effectivePermissions =
      user.permissions && user.permissions.length > 0
        ? user.permissions
        : user.role?.permissions || [];

    // Check if effective permissions include the required permission
    const hasPermission = effectivePermissions.some(
      (permission) =>
        permission.resource === requiredPermissions.resource &&
        permission.action === requiredPermissions.action,
    );

    if (!hasPermission) {
      throw new ForbiddenException(
        `You do not have permission to ${requiredPermissions.action} ${requiredPermissions.resource}`,
      );
    }

    return true;
  }
}
