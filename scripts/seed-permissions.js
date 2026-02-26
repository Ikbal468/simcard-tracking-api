const sqlite3 = require("sqlite3").verbose();
const bcrypt = require("bcryptjs");
const path = require("path");

const dbPath = path.join(__dirname, "..", "db", "simcard.sqlite");
const db = new sqlite3.Database(dbPath);

async function seedPermissions() {
  return new Promise((resolve, reject) => {
    db.serialize(() => {
      // Create tables
      db.run(`
        CREATE TABLE IF NOT EXISTS roles (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          roleName TEXT UNIQUE NOT NULL
        )
      `);

      db.run(`
        CREATE TABLE IF NOT EXISTS permissions (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          resource TEXT NOT NULL,
          action TEXT NOT NULL
        )
      `);

      db.run(`
        CREATE TABLE IF NOT EXISTS role_permissions (
          role_id INTEGER NOT NULL,
          permission_id INTEGER NOT NULL,
          PRIMARY KEY (role_id, permission_id),
          FOREIGN KEY (role_id) REFERENCES roles(id) ON DELETE CASCADE,
          FOREIGN KEY (permission_id) REFERENCES permissions(id) ON DELETE CASCADE
        )
      `);

      // Drop old role column if exists and add role_id
      db.run(`ALTER TABLE users ADD COLUMN role_id INTEGER`, (err) => {
        if (err && !err.message.includes("duplicate column")) {
          console.error("Error adding role_id column:", err);
        }
      });

      // Insert roles
      db.run(
        `INSERT OR IGNORE INTO roles (id, roleName) VALUES (1, 'admin')`,
        (err) => {
          if (err) console.error("Error inserting admin role:", err);
        },
      );

      db.run(
        `INSERT OR IGNORE INTO roles (id, roleName) VALUES (2, 'operator')`,
        (err) => {
          if (err) console.error("Error inserting operator role:", err);
        },
      );

      // Define all permissions
      const resources = [
        "customers",
        "simcards",
        "simtypes",
        "transactions",
        "dashboard",
        "users",
      ];
      const actions = ["view", "create", "edit", "delete"];

      // Insert all permissions
      resources.forEach((resource) => {
        actions.forEach((action) => {
          db.run(
            `INSERT INTO permissions (resource, action) VALUES (?, ?)`,
            [resource, action],
            (err) => {
              if (err)
                console.error(
                  `Error inserting permission ${resource}:${action}:`,
                  err,
                );
            },
          );
        });
      });

      // Wait for all insertions to complete
      db.all(`SELECT id FROM permissions`, (err, permissions) => {
        if (err) {
          console.error("Error fetching permissions:", err);
          return reject(err);
        }

        // Admin gets all permissions (role_id = 1)
        permissions.forEach((perm) => {
          db.run(
            `INSERT OR IGNORE INTO role_permissions (role_id, permission_id) VALUES (1, ?)`,
            [perm.id],
            (err) => {
              if (err)
                console.error("Error assigning permission to admin:", err);
            },
          );
        });

        // Operator gets limited permissions (role_id = 2)
        // Operator can: view all, edit/delete simcards and transactions only
        const operatorPermissions = [
          // View permissions
          { resource: "customers", action: "view" },
          { resource: "simcards", action: "view" },
          { resource: "simtypes", action: "view" },
          { resource: "transactions", action: "view" },
          { resource: "dashboard", action: "view" },

          // Edit permissions (limited)
          { resource: "simcards", action: "edit" },
          { resource: "transactions", action: "edit" },

          // Delete permissions (limited)
          { resource: "simcards", action: "delete" },
          { resource: "transactions", action: "delete" },

          // Create permissions (limited)
          { resource: "simcards", action: "create" },
          { resource: "transactions", action: "create" },
        ];

        operatorPermissions.forEach(({ resource, action }) => {
          db.get(
            `SELECT id FROM permissions WHERE resource = ? AND action = ?`,
            [resource, action],
            (err, row) => {
              if (err) {
                console.error(
                  `Error finding permission ${resource}:${action}:`,
                  err,
                );
                return;
              }
              if (row) {
                db.run(
                  `INSERT OR IGNORE INTO role_permissions (role_id, permission_id) VALUES (2, ?)`,
                  [row.id],
                  (err) => {
                    if (err)
                      console.error(
                        "Error assigning permission to operator:",
                        err,
                      );
                  },
                );
              }
            },
          );
        });

        // Update existing users to have admin role
        db.run(`UPDATE users SET role_id = 1 WHERE role_id IS NULL`, (err) => {
          if (err) console.error("Error updating user roles:", err);
        });

        setTimeout(() => {
          console.log("Permissions seeded successfully!");
          console.log("\nAdmin role: Full access to all resources");
          console.log(
            "Operator role: View all, edit/delete/create only simcards and transactions",
          );
          resolve();
        }, 1000);
      });
    });
  });
}

// Run the seed
seedPermissions()
  .then(() => {
    db.close();
    process.exit(0);
  })
  .catch((err) => {
    console.error("Error seeding permissions:", err);
    db.close();
    process.exit(1);
  });
