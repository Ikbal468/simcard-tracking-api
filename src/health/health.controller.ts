import { Controller, Get } from "@nestjs/common";
import { readFileSync } from "fs";
import { join } from "path";

@Controller("health")
export class HealthController {
  @Get("version")
  getVersion() {
    try {
      const packageJsonPath = join(process.cwd(), "package.json");
      const packageJson = JSON.parse(readFileSync(packageJsonPath, "utf8"));

      return {
        version: packageJson.version,
        name: packageJson.name,
        timestamp: new Date().toISOString(),
        environment: process.env.NODE_ENV || "development",
      };
    } catch (error) {
      return {
        version: "unknown",
        error: "Could not read version",
      };
    }
  }

  @Get()
  healthCheck() {
    return {
      status: "ok",
      timestamp: new Date().toISOString(),
    };
  }
}
