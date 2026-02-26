import { Module } from "@nestjs/common";
import { TypeOrmModule } from "@nestjs/typeorm";
import { typeOrmConfig } from "./config/typeorm.config";
import { SimTypeModule } from "./sim-types/sim-type.module";
import { CustomerModule } from "./customers/customer.module";
import { SimCardModule } from "./sim-cards/sim-card.module";
import { SimTransactionModule } from "./transactions/sim-transaction.module";
import { UsersModule } from "./users/users.module";
import { AuthModule } from "./auth/auth.module";
import { DashboardModule } from "./dashboard/dashboard.module";
import { join } from "path";

@Module({
  imports: [
    TypeOrmModule.forRoot({
      type: "sqlite",
      database: join(process.cwd(), "db", "simcard.sqlite"),
      entities: [__dirname + '/**/*.entity{.ts,.js}'],
      migrations: [__dirname + '/migrations/*{.ts,.js}'],
      synchronize: false,
    }),
    SimTypeModule,
    CustomerModule,
    SimCardModule,
    SimTransactionModule,
    DashboardModule,
    UsersModule,
    AuthModule,
  ],
})
export class AppModule {}
