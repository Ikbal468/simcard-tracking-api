import { NestFactory } from "@nestjs/core";
import { AppModule } from "./app.module";
import { ValidationPipe } from "@nestjs/common";
import { DocumentBuilder, SwaggerModule } from "@nestjs/swagger";

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  app.setGlobalPrefix("api");
  app.useGlobalPipes(new ValidationPipe({ whitelist: true, transform: true }));

  // Swagger setup
  const config = new DocumentBuilder()
    .setTitle("SimCard Tracking API")
    .setDescription("Mini project API for sim card inventory and transactions")
    .setVersion("0.1")
    .build();
  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup("api/docs", app, document);

  // CORS configuration: allow origins via env or common localhost variants.
  const allowed = (
    process.env.ALLOWED_ORIGINS || "http://localhost:4200,http://127.0.0.1:4200"
  ).split(",");
  app.enableCors({
    // origin: "*",    // For localhost purposes only
    origin: ['https://simcard-tracking.netlify.app'],
  });
  await app.listen(process.env.PORT ? Number(process.env.PORT) : 3000);
  console.log("SimCard Tracking API started on port", process.env.PORT || 3000);
}

bootstrap();
