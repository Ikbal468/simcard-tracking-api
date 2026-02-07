# SimCard Tracking API (mini)

Backend microproject using NestJS + TypeORM. Defaults to SQLite and can switch to MySQL via environment variables.

Run locally:

```bash
npm install
npm run start:dev
```

Important files:

- src/entities/\* - TypeORM entities
- src/\* modules and controllers
- src/config/typeorm.config.ts - database config
- .env - environment
