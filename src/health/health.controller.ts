import { Controller, Get } from "@nestjs/common";

@Controller("health")
export class HealthController {
  @Get()
  check() {
    return { version: '1.0.2', status: 'ok' };
  }
}
