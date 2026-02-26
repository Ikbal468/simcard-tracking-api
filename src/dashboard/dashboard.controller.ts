import { Controller, Get, Query, UseGuards } from "@nestjs/common";
import { DashboardService } from "./dashboard.service";
import { AuthGuard } from "../auth/guards/auth.guard";
import { PermissionsGuard } from "../auth/guards/permissions.guard";
import { RequirePermission } from "../auth/decorators/permissions.decorator";

@Controller("dashboard")
@UseGuards(AuthGuard, PermissionsGuard)
export class DashboardController {
  constructor(private readonly svc: DashboardService) {}

  @Get()
  @RequirePermission("dashboard", "view")
  async overview(@Query("days") days?: string) {
    const d = days ? Math.min(365, Math.max(1, Number(days))) : 30;
    return this.svc.getOverview(d);
  }
}
