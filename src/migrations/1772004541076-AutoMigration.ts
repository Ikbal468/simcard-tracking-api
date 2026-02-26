import { MigrationInterface, QueryRunner } from "typeorm";

export class AutoMigration1772004541076 implements MigrationInterface {
    name = 'AutoMigration1772004541076'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TABLE "temporary_role_permissions" ("role_id" integer NOT NULL, "permission_id" integer NOT NULL, PRIMARY KEY ("role_id", "permission_id"))`);
        await queryRunner.query(`INSERT INTO "temporary_role_permissions"("role_id", "permission_id") SELECT "role_id", "permission_id" FROM "role_permissions"`);
        await queryRunner.query(`DROP TABLE "role_permissions"`);
        await queryRunner.query(`ALTER TABLE "temporary_role_permissions" RENAME TO "role_permissions"`);
        await queryRunner.query(`CREATE TABLE "temporary_users" ("id" integer PRIMARY KEY AUTOINCREMENT NOT NULL, "username" varchar NOT NULL, "password" varchar NOT NULL, "role" varchar NOT NULL DEFAULT ('operator'), "role_id" integer, CONSTRAINT "UQ_fe0bb3f6520ee0469504521e710" UNIQUE ("username"))`);
        await queryRunner.query(`INSERT INTO "temporary_users"("id", "username", "password", "role", "role_id") SELECT "id", "username", "password", "role", "role_id" FROM "users"`);
        await queryRunner.query(`DROP TABLE "users"`);
        await queryRunner.query(`ALTER TABLE "temporary_users" RENAME TO "users"`);
        await queryRunner.query(`CREATE TABLE "temporary_users" ("id" integer PRIMARY KEY AUTOINCREMENT NOT NULL, "username" varchar NOT NULL, "password" varchar NOT NULL, "role" varchar NOT NULL DEFAULT ('operator'), CONSTRAINT "UQ_fe0bb3f6520ee0469504521e710" UNIQUE ("username"))`);
        await queryRunner.query(`INSERT INTO "temporary_users"("id", "username", "password", "role") SELECT "id", "username", "password", "role" FROM "users"`);
        await queryRunner.query(`DROP TABLE "users"`);
        await queryRunner.query(`ALTER TABLE "temporary_users" RENAME TO "users"`);
        await queryRunner.query(`CREATE TABLE "temporary_users" ("id" integer PRIMARY KEY AUTOINCREMENT NOT NULL, "username" varchar NOT NULL, "password" varchar NOT NULL, "role" varchar NOT NULL DEFAULT ('operator'), "role_id" integer, CONSTRAINT "UQ_fe0bb3f6520ee0469504521e710" UNIQUE ("username"))`);
        await queryRunner.query(`INSERT INTO "temporary_users"("id", "username", "password", "role") SELECT "id", "username", "password", "role" FROM "users"`);
        await queryRunner.query(`DROP TABLE "users"`);
        await queryRunner.query(`ALTER TABLE "temporary_users" RENAME TO "users"`);
        await queryRunner.query(`CREATE TABLE "temporary_permissions" ("id" integer PRIMARY KEY AUTOINCREMENT NOT NULL, "resource" varchar NOT NULL, "action" varchar NOT NULL)`);
        await queryRunner.query(`INSERT INTO "temporary_permissions"("id", "resource", "action") SELECT "id", "resource", "action" FROM "permissions"`);
        await queryRunner.query(`DROP TABLE "permissions"`);
        await queryRunner.query(`ALTER TABLE "temporary_permissions" RENAME TO "permissions"`);
        await queryRunner.query(`CREATE TABLE "temporary_roles" ("id" integer PRIMARY KEY AUTOINCREMENT NOT NULL, "roleName" varchar NOT NULL, CONSTRAINT "UQ_992f24b9d80eb1312440ca577f1" UNIQUE ("roleName"))`);
        await queryRunner.query(`INSERT INTO "temporary_roles"("id", "roleName") SELECT "id", "roleName" FROM "roles"`);
        await queryRunner.query(`DROP TABLE "roles"`);
        await queryRunner.query(`ALTER TABLE "temporary_roles" RENAME TO "roles"`);
        await queryRunner.query(`CREATE TABLE "temporary_users" ("id" integer PRIMARY KEY AUTOINCREMENT NOT NULL, "username" varchar NOT NULL, "password" varchar NOT NULL, "role" varchar, "role_id" integer, CONSTRAINT "UQ_fe0bb3f6520ee0469504521e710" UNIQUE ("username"))`);
        await queryRunner.query(`INSERT INTO "temporary_users"("id", "username", "password", "role", "role_id") SELECT "id", "username", "password", "role", "role_id" FROM "users"`);
        await queryRunner.query(`DROP TABLE "users"`);
        await queryRunner.query(`ALTER TABLE "temporary_users" RENAME TO "users"`);
        await queryRunner.query(`CREATE INDEX "IDX_17022daf3f885f7d35423e9971" ON "role_permissions" ("permission_id") `);
        await queryRunner.query(`CREATE INDEX "IDX_178199805b901ccd220ab7740e" ON "role_permissions" ("role_id") `);
        await queryRunner.query(`CREATE INDEX "IDX_3495bd31f1862d02931e8e8d2e" ON "user_permissions" ("user_id") `);
        await queryRunner.query(`CREATE INDEX "IDX_8145f5fadacd311693c15e41f1" ON "user_permissions" ("permission_id") `);
        await queryRunner.query(`CREATE TABLE "temporary_users" ("id" integer PRIMARY KEY AUTOINCREMENT NOT NULL, "username" varchar NOT NULL, "password" varchar NOT NULL, "role" varchar, "role_id" integer, CONSTRAINT "UQ_fe0bb3f6520ee0469504521e710" UNIQUE ("username"), CONSTRAINT "FK_a2cecd1a3531c0b041e29ba46e1" FOREIGN KEY ("role_id") REFERENCES "roles" ("id") ON DELETE NO ACTION ON UPDATE NO ACTION)`);
        await queryRunner.query(`INSERT INTO "temporary_users"("id", "username", "password", "role", "role_id") SELECT "id", "username", "password", "role", "role_id" FROM "users"`);
        await queryRunner.query(`DROP TABLE "users"`);
        await queryRunner.query(`ALTER TABLE "temporary_users" RENAME TO "users"`);
        await queryRunner.query(`DROP INDEX "IDX_17022daf3f885f7d35423e9971"`);
        await queryRunner.query(`DROP INDEX "IDX_178199805b901ccd220ab7740e"`);
        await queryRunner.query(`CREATE TABLE "temporary_role_permissions" ("role_id" integer NOT NULL, "permission_id" integer NOT NULL, CONSTRAINT "FK_17022daf3f885f7d35423e9971e" FOREIGN KEY ("permission_id") REFERENCES "permissions" ("id") ON DELETE CASCADE ON UPDATE CASCADE, CONSTRAINT "FK_178199805b901ccd220ab7740ec" FOREIGN KEY ("role_id") REFERENCES "roles" ("id") ON DELETE NO ACTION ON UPDATE NO ACTION, PRIMARY KEY ("role_id", "permission_id"))`);
        await queryRunner.query(`INSERT INTO "temporary_role_permissions"("role_id", "permission_id") SELECT "role_id", "permission_id" FROM "role_permissions"`);
        await queryRunner.query(`DROP TABLE "role_permissions"`);
        await queryRunner.query(`ALTER TABLE "temporary_role_permissions" RENAME TO "role_permissions"`);
        await queryRunner.query(`CREATE INDEX "IDX_17022daf3f885f7d35423e9971" ON "role_permissions" ("permission_id") `);
        await queryRunner.query(`CREATE INDEX "IDX_178199805b901ccd220ab7740e" ON "role_permissions" ("role_id") `);
        await queryRunner.query(`DROP INDEX "IDX_3495bd31f1862d02931e8e8d2e"`);
        await queryRunner.query(`DROP INDEX "IDX_8145f5fadacd311693c15e41f1"`);
        await queryRunner.query(`CREATE TABLE "temporary_user_permissions" ("user_id" integer NOT NULL, "permission_id" integer NOT NULL, CONSTRAINT "FK_3495bd31f1862d02931e8e8d2e8" FOREIGN KEY ("user_id") REFERENCES "users" ("id") ON DELETE CASCADE ON UPDATE CASCADE, CONSTRAINT "FK_8145f5fadacd311693c15e41f10" FOREIGN KEY ("permission_id") REFERENCES "permissions" ("id") ON DELETE CASCADE ON UPDATE CASCADE, PRIMARY KEY ("user_id", "permission_id"))`);
        await queryRunner.query(`INSERT INTO "temporary_user_permissions"("user_id", "permission_id") SELECT "user_id", "permission_id" FROM "user_permissions"`);
        await queryRunner.query(`DROP TABLE "user_permissions"`);
        await queryRunner.query(`ALTER TABLE "temporary_user_permissions" RENAME TO "user_permissions"`);
        await queryRunner.query(`CREATE INDEX "IDX_3495bd31f1862d02931e8e8d2e" ON "user_permissions" ("user_id") `);
        await queryRunner.query(`CREATE INDEX "IDX_8145f5fadacd311693c15e41f1" ON "user_permissions" ("permission_id") `);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`DROP INDEX "IDX_8145f5fadacd311693c15e41f1"`);
        await queryRunner.query(`DROP INDEX "IDX_3495bd31f1862d02931e8e8d2e"`);
        await queryRunner.query(`ALTER TABLE "user_permissions" RENAME TO "temporary_user_permissions"`);
        await queryRunner.query(`CREATE TABLE "user_permissions" ("user_id" integer NOT NULL, "permission_id" integer NOT NULL, PRIMARY KEY ("user_id", "permission_id"))`);
        await queryRunner.query(`INSERT INTO "user_permissions"("user_id", "permission_id") SELECT "user_id", "permission_id" FROM "temporary_user_permissions"`);
        await queryRunner.query(`DROP TABLE "temporary_user_permissions"`);
        await queryRunner.query(`CREATE INDEX "IDX_8145f5fadacd311693c15e41f1" ON "user_permissions" ("permission_id") `);
        await queryRunner.query(`CREATE INDEX "IDX_3495bd31f1862d02931e8e8d2e" ON "user_permissions" ("user_id") `);
        await queryRunner.query(`DROP INDEX "IDX_178199805b901ccd220ab7740e"`);
        await queryRunner.query(`DROP INDEX "IDX_17022daf3f885f7d35423e9971"`);
        await queryRunner.query(`ALTER TABLE "role_permissions" RENAME TO "temporary_role_permissions"`);
        await queryRunner.query(`CREATE TABLE "role_permissions" ("role_id" integer NOT NULL, "permission_id" integer NOT NULL, PRIMARY KEY ("role_id", "permission_id"))`);
        await queryRunner.query(`INSERT INTO "role_permissions"("role_id", "permission_id") SELECT "role_id", "permission_id" FROM "temporary_role_permissions"`);
        await queryRunner.query(`DROP TABLE "temporary_role_permissions"`);
        await queryRunner.query(`CREATE INDEX "IDX_178199805b901ccd220ab7740e" ON "role_permissions" ("role_id") `);
        await queryRunner.query(`CREATE INDEX "IDX_17022daf3f885f7d35423e9971" ON "role_permissions" ("permission_id") `);
        await queryRunner.query(`ALTER TABLE "users" RENAME TO "temporary_users"`);
        await queryRunner.query(`CREATE TABLE "users" ("id" integer PRIMARY KEY AUTOINCREMENT NOT NULL, "username" varchar NOT NULL, "password" varchar NOT NULL, "role" varchar, "role_id" integer, CONSTRAINT "UQ_fe0bb3f6520ee0469504521e710" UNIQUE ("username"))`);
        await queryRunner.query(`INSERT INTO "users"("id", "username", "password", "role", "role_id") SELECT "id", "username", "password", "role", "role_id" FROM "temporary_users"`);
        await queryRunner.query(`DROP TABLE "temporary_users"`);
        await queryRunner.query(`DROP INDEX "IDX_8145f5fadacd311693c15e41f1"`);
        await queryRunner.query(`DROP INDEX "IDX_3495bd31f1862d02931e8e8d2e"`);
        await queryRunner.query(`DROP INDEX "IDX_178199805b901ccd220ab7740e"`);
        await queryRunner.query(`DROP INDEX "IDX_17022daf3f885f7d35423e9971"`);
        await queryRunner.query(`ALTER TABLE "users" RENAME TO "temporary_users"`);
        await queryRunner.query(`CREATE TABLE "users" ("id" integer PRIMARY KEY AUTOINCREMENT NOT NULL, "username" varchar NOT NULL, "password" varchar NOT NULL, "role" varchar NOT NULL DEFAULT ('operator'), "role_id" integer, CONSTRAINT "UQ_fe0bb3f6520ee0469504521e710" UNIQUE ("username"))`);
        await queryRunner.query(`INSERT INTO "users"("id", "username", "password", "role", "role_id") SELECT "id", "username", "password", "role", "role_id" FROM "temporary_users"`);
        await queryRunner.query(`DROP TABLE "temporary_users"`);
        await queryRunner.query(`ALTER TABLE "roles" RENAME TO "temporary_roles"`);
        await queryRunner.query(`CREATE TABLE "roles" ("id" integer PRIMARY KEY, "roleName" text NOT NULL, CONSTRAINT "UQ_992f24b9d80eb1312440ca577f1" UNIQUE ("roleName"))`);
        await queryRunner.query(`INSERT INTO "roles"("id", "roleName") SELECT "id", "roleName" FROM "temporary_roles"`);
        await queryRunner.query(`DROP TABLE "temporary_roles"`);
        await queryRunner.query(`ALTER TABLE "permissions" RENAME TO "temporary_permissions"`);
        await queryRunner.query(`CREATE TABLE "permissions" ("id" integer PRIMARY KEY, "resource" text NOT NULL, "action" text NOT NULL)`);
        await queryRunner.query(`INSERT INTO "permissions"("id", "resource", "action") SELECT "id", "resource", "action" FROM "temporary_permissions"`);
        await queryRunner.query(`DROP TABLE "temporary_permissions"`);
        await queryRunner.query(`ALTER TABLE "users" RENAME TO "temporary_users"`);
        await queryRunner.query(`CREATE TABLE "users" ("id" integer PRIMARY KEY AUTOINCREMENT NOT NULL, "username" varchar NOT NULL, "password" varchar NOT NULL, "role" varchar NOT NULL DEFAULT ('operator'), CONSTRAINT "UQ_fe0bb3f6520ee0469504521e710" UNIQUE ("username"))`);
        await queryRunner.query(`INSERT INTO "users"("id", "username", "password", "role") SELECT "id", "username", "password", "role" FROM "temporary_users"`);
        await queryRunner.query(`DROP TABLE "temporary_users"`);
        await queryRunner.query(`ALTER TABLE "users" RENAME TO "temporary_users"`);
        await queryRunner.query(`CREATE TABLE "users" ("id" integer PRIMARY KEY AUTOINCREMENT NOT NULL, "username" varchar NOT NULL, "password" varchar NOT NULL, "role" varchar NOT NULL DEFAULT ('operator'), "role_id" integer, CONSTRAINT "UQ_fe0bb3f6520ee0469504521e710" UNIQUE ("username"))`);
        await queryRunner.query(`INSERT INTO "users"("id", "username", "password", "role") SELECT "id", "username", "password", "role" FROM "temporary_users"`);
        await queryRunner.query(`DROP TABLE "temporary_users"`);
        await queryRunner.query(`ALTER TABLE "users" RENAME TO "temporary_users"`);
        await queryRunner.query(`CREATE TABLE "users" ("id" integer PRIMARY KEY AUTOINCREMENT NOT NULL, "username" varchar NOT NULL, "password" varchar NOT NULL, "role" varchar NOT NULL DEFAULT ('operator'), "role_id" integer, CONSTRAINT "UQ_fe0bb3f6520ee0469504521e710" UNIQUE ("username"))`);
        await queryRunner.query(`INSERT INTO "users"("id", "username", "password", "role", "role_id") SELECT "id", "username", "password", "role", "role_id" FROM "temporary_users"`);
        await queryRunner.query(`DROP TABLE "temporary_users"`);
        await queryRunner.query(`ALTER TABLE "role_permissions" RENAME TO "temporary_role_permissions"`);
        await queryRunner.query(`CREATE TABLE "role_permissions" ("role_id" integer NOT NULL, "permission_id" integer NOT NULL, CONSTRAINT "FK_17022daf3f885f7d35423e9971e" FOREIGN KEY ("permission_id") REFERENCES "permissions" ("id") ON DELETE CASCADE ON UPDATE NO ACTION, CONSTRAINT "FK_178199805b901ccd220ab7740ec" FOREIGN KEY ("role_id") REFERENCES "roles" ("id") ON DELETE CASCADE ON UPDATE NO ACTION, PRIMARY KEY ("role_id", "permission_id"))`);
        await queryRunner.query(`INSERT INTO "role_permissions"("role_id", "permission_id") SELECT "role_id", "permission_id" FROM "temporary_role_permissions"`);
        await queryRunner.query(`DROP TABLE "temporary_role_permissions"`);
    }

}
