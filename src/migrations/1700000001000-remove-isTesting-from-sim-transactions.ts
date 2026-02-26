import { MigrationInterface, QueryRunner } from "typeorm";

export class RemoveIsTestingFromSimTransactions1700000001000
  implements MigrationInterface
{
  name = "RemoveIsTestingFromSimTransactions1700000001000";

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      CREATE TABLE sim_transactions_temp (
        id INTEGER PRIMARY KEY,
        type TEXT,
        createdAt DATETIME,
        simCardId INTEGER,
        customerId INTEGER
      );
    `);

    await queryRunner.query(`
      INSERT INTO sim_transactions_temp (id, type, createdAt, simCardId, customerId)
      SELECT id, type, createdAt, simCardId, customerId
      FROM sim_transactions;
    `);

    await queryRunner.query(`DROP TABLE sim_transactions;`);

    await queryRunner.query(`
      ALTER TABLE sim_transactions_temp RENAME TO sim_transactions;
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      ALTER TABLE sim_transactions 
      ADD COLUMN isTesting INTEGER DEFAULT 0;
    `);
  }
}