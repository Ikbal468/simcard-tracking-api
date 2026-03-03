import { Controller, Get } from "@nestjs/common";

@Controller("health")
export class HealthController {
  @Get()
  check() {
    console.log('Health endpoint hit!');
    return { version: '1.0.7', status: 'ok' };
  }
}
