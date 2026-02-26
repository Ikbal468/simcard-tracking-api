import { MigrationInterface, QueryRunner } from "typeorm";

export class ConvertUserRoleToRoleId1700000000000 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    // Find distinct role strings in users (legacy denormalized column)
    const rows: Array<{ role: string }> = await queryRunner.query(
      `SELECT DISTINCT role FROM users WHERE role IS NOT NULL AND role != ''`,
    );

    for (const r of rows) {
      const roleName = r.role;
      if (!roleName) continue;

      // Check if a role with this roleName already exists
      const existing = await queryRunner.query(
        `SELECT id FROM roles WHERE roleName = ?`,
        [roleName],
      );

      let roleId: number;
      if (existing && existing.length) {
        roleId = existing[0].id;
      } else {
        // Insert new role and then fetch its id
        await queryRunner.query(`INSERT INTO roles (roleName) VALUES (?)`, [
          roleName,
        ]);
        const newRow = await queryRunner.query(
          `SELECT id FROM roles WHERE roleName = ?`,
          [roleName],
        );
        roleId = newRow[0].id;
      }

      // Update users to set role_id based on role string
      await queryRunner.query(`UPDATE users SET role_id = ? WHERE role = ?`, [
        roleId,
        roleName,
      ]);
    }
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    // Revert: clear role_id for all users (cannot reliably undo created roles)
    await queryRunner.query(`UPDATE users SET role_id = NULL`);
  }
}
