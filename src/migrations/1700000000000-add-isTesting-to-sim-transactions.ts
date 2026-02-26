import { MigrationInterface, QueryRunner } from "typeorm";

export class AddIsTestingToSimTransactions1700000000000
  implements MigrationInterface
{
  name = "AddIsTestingToSimTransactions1700000000000";

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      ALTER TABLE sim_transactions 
      ADD COLUMN isTesting INTEGER DEFAULT 0
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    // SQLite does NOT support DROP COLUMN directly
    // For learning purpose, we leave this empty
  }
}