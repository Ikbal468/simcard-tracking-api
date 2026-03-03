import { MigrationInterface, QueryRunner } from "typeorm";

export class ConvertUserRoleToRoleId1772441930000 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    // This migration runs AFTER AutoMigration and fixes role_id based on role column

    // Find all users with a role but NULL role_id
    const users: Array<{ id: number; role: string }> = await queryRunner.query(
      `SELECT id, role FROM users WHERE role IS NOT NULL AND role != '' AND (role_id IS NULL OR role_id = '')`,
    );

    console.log(
      `Found ${users.length} users with NULL role_id that need fixing`,
    );

    for (const user of users) {
      const roleName = user.role;
      if (!roleName) continue;

      // Find the role in the roles table
      const roleRows = await queryRunner.query(
        `SELECT id FROM roles WHERE roleName = ?`,
        [roleName],
      );

      let roleId: number;

      if (roleRows && roleRows.length > 0) {
        // Role exists, use it
        roleId = roleRows[0].id;
      } else {
        // Role doesn't exist, create it
        console.log(`Creating missing role: ${roleName}`);
        await queryRunner.query(`INSERT INTO roles (roleName) VALUES (?)`, [
          roleName,
        ]);
        const newRoleRows = await queryRunner.query(
          `SELECT id FROM roles WHERE roleName = ?`,
          [roleName],
        );
        roleId = newRoleRows[0].id;
      }

      // Update the specific user
      await queryRunner.query(`UPDATE users SET role_id = ? WHERE id = ?`, [
        roleId,
        user.id,
      ]);

      console.log(`Updated user ${user.id} (${roleName}) -> role_id ${roleId}`);
    }

    console.log("Migration completed successfully");
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    // Revert: clear role_id for all users (cannot reliably undo created roles)
    await queryRunner.query(`UPDATE users SET role_id = NULL`);
  }
}
