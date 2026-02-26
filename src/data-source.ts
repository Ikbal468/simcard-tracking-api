import 'reflect-metadata';
import { DataSource } from 'typeorm';
import { join } from 'path';

export default new DataSource({
  type: 'sqlite',
  database: join(process.cwd(), 'db', 'simcard.sqlite'),
  entities: [join(__dirname, '/**/*.entity{.ts,.js}')],
  migrations: [join(__dirname, '/migrations/*{.ts,.js}')],
  synchronize: false,
  logging: false,
});