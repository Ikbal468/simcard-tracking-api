import { Controller, Get, Query } from "@nestjs/common";
import { DashboardService } from "./dashboard.service";

@Controller("dashboard")
export class DashboardController {
  constructor(private readonly svc: DashboardService) {}

  @Get()
  async overview(@Query("days") days?: string) {
    const d = days ? Math.min(365, Math.max(1, Number(days))) : 30;
    return this.svc.getOverview(d);
  }
}
