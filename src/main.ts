import "dotenv/config";
import { NestFactory } from "@nestjs/core";
import { AppModule } from "./app.module";
import { ValidationPipe } from "@nestjs/common";
import { DocumentBuilder, SwaggerModule } from "@nestjs/swagger";
import { DataSource } from "typeorm";

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  app.setGlobalPrefix("api");
  app.useGlobalPipes(new ValidationPipe({ whitelist: true, transform: true }));

  // ✅ Use Nest's existing connection
  const dataSource = app.get(DataSource);
  await dataSource.runMigrations(); //ensuring schema is up to date before listening

  const config = new DocumentBuilder()
    .setTitle("SimCard Tracking API")
    .setDescription("Mini project API for sim card inventory and transactions")
    .setVersion("0.1")
    .build();

  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup("api/docs", app, document);

  app.enableCors({
    origin: "*",
  });

  await app.listen(process.env.PORT ? Number(process.env.PORT) : 3000);
  console.log("SimCard Tracking API started on port", process.env.PORT || 3000);
}

bootstrap();
