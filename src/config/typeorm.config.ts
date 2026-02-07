import { TypeOrmModuleOptions } from "@nestjs/typeorm";
import { join } from "path";

export const typeOrmConfig = (): TypeOrmModuleOptions => {
  const isMysql = process.env.DB_TYPE === "mysql";
  return {
    type: (process.env.DB_TYPE as any) || "sqlite",
    host: isMysql ? process.env.DB_HOST : undefined,
    port:
      isMysql && process.env.DB_PORT ? Number(process.env.DB_PORT) : undefined,
    username: isMysql ? process.env.DB_USERNAME : undefined,
    password: isMysql ? process.env.DB_PASSWORD : undefined,
    database: isMysql
      ? process.env.DB_NAME
      : process.env.DB_NAME || join(process.cwd(), "db", "simcard.sqlite"),
    entities: [
      process.env.NODE_ENV === "production"
        ? "dist/entities/*.entity.js"
        : "src/entities/*.entity.ts",
    ],
    synchronize: process.env.TYPEORM_SYNC
      ? process.env.TYPEORM_SYNC === "true"
      : true,
    logging: false,
  } as TypeOrmModuleOptions;
};
