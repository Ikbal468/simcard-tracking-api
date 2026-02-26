#!/usr/bin/env node

const http = require("http");

const BASE_URL = "http://localhost:3300/api";

function request(method, path, data, token) {
  return new Promise((resolve, reject) => {
    const url = new URL(BASE_URL + path);
    const options = {
      hostname: url.hostname,
      port: url.port,
      path: url.pathname,
      method: method,
      headers: {
        "Content-Type": "application/json",
      },
    };

    if (token) {
      options.headers["Authorization"] = `Bearer ${token}`;
    }

    const req = http.request(options, (res) => {
      let body = "";
      res.on("data", (chunk) => (body += chunk));
      res.on("end", () => {
        try {
          const json = JSON.parse(body);
          resolve({ status: res.statusCode, data: json });
        } catch {
          resolve({ status: res.statusCode, data: body });
        }
      });
    });

    req.on("error", reject);

    if (data) {
      req.write(JSON.stringify(data));
    }

    req.end();
  });
}

async function runTests() {
  console.log("🧪 Testing Permission System\n");

  try {
    // Test 1: Login as admin
    console.log("1️⃣  Testing Admin Login...");
    const adminLogin = await request("POST", "/auth/login", {
      username: "admin",
      password: "admin123",
    });

    if (adminLogin.status === 201 || adminLogin.status === 200) {
      console.log("   ✅ Admin login successful");
      console.log(
        `   Token: ${adminLogin.data.access_token.substring(0, 20)}...`,
      );
      const adminToken = adminLogin.data.access_token;

      // Test 2: Admin creating a new user
      console.log("\n2️⃣  Testing Admin Creating New User...");
      const newUser = await request(
        "POST",
        "/users",
        {
          username: `testuser_${Date.now()}`,
          password: "test123",
          roleId: 2,
        },
        adminToken,
      );

      if (newUser.status === 201 || newUser.status === 200) {
        console.log("   ✅ User created successfully");
        console.log(
          `   User ID: ${newUser.data.id}, Username: ${newUser.data.username}`,
        );
      } else {
        console.log(`   ❌ Failed to create user: ${newUser.status}`);
        console.log(`   Response:`, newUser.data);
      }

      // Test 3: Admin accessing customers
      console.log("\n3️⃣  Testing Admin Accessing Customers...");
      const customers = await request("GET", "/customers", null, adminToken);

      if (customers.status === 200) {
        console.log("   ✅ Admin can access customers");
        console.log(`   Found ${customers.data.length} customers`);
      } else {
        console.log(`   ❌ Failed to access customers: ${customers.status}`);
      }

      // Test 4: Get available roles
      console.log("\n4️⃣  Testing Get Available Roles...");
      const roles = await request("GET", "/users/roles", null, adminToken);

      if (roles.status === 200) {
        console.log("   ✅ Roles retrieved successfully");
        roles.data.forEach((role) => {
          console.log(
            `   - ${role.name}: ${role.permissions?.length || 0} permissions`,
          );
        });
      } else {
        console.log(`   ❌ Failed to get roles: ${roles.status}`);
      }

      // Test 5: Try operator login (if exists)
      console.log("\n5️⃣  Testing Operator Login...");
      const operatorLogin = await request("POST", "/auth/login", {
        username: "operator",
        password: "operator123",
      });

      if (operatorLogin.status === 201 || operatorLogin.status === 200) {
        console.log("   ✅ Operator login successful");
        const operatorToken = operatorLogin.data.access_token;

        // Test 6: Operator trying to create customer (should fail)
        console.log(
          "\n6️⃣  Testing Operator Creating Customer (should fail)...",
        );
        const createCustomer = await request(
          "POST",
          "/customers",
          {
            name: "Test Customer",
            address: "123 Test St",
          },
          operatorToken,
        );

        if (createCustomer.status === 403 || createCustomer.status === 400) {
          console.log(
            "   ✅ Operator correctly denied permission to create customer",
          );
          console.log(`   Message: ${createCustomer.data.message}`);
        } else {
          console.log(`   ❌ Unexpected response: ${createCustomer.status}`);
        }

        // Test 7: Operator viewing sim cards (should succeed)
        console.log(
          "\n7️⃣  Testing Operator Viewing Sim Cards (should succeed)...",
        );
        const viewSimCards = await request(
          "GET",
          "/simCards",
          null,
          operatorToken,
        );

        if (viewSimCards.status === 200) {
          console.log("   ✅ Operator can view sim cards");
          console.log(`   Found ${viewSimCards.data.length} sim cards`);
        } else {
          console.log(`   ❌ Failed to view sim cards: ${viewSimCards.status}`);
        }

        // Test 8: Operator trying to create user (should fail)
        console.log("\n8️⃣  Testing Operator Creating User (should fail)...");
        const operatorCreateUser = await request(
          "POST",
          "/users",
          {
            username: "shouldfail",
            password: "test123",
            roleId: 2,
          },
          operatorToken,
        );

        if (
          operatorCreateUser.status === 400 ||
          operatorCreateUser.status === 403
        ) {
          console.log(
            "   ✅ Operator correctly denied permission to create user",
          );
          console.log(`   Message: ${operatorCreateUser.data.message}`);
        } else {
          console.log(
            `   ❌ Unexpected response: ${operatorCreateUser.status}`,
          );
        }
      } else {
        console.log("   ⚠️  No operator user found (skip operator tests)");
      }
    } else {
      console.log(`   ❌ Admin login failed: ${adminLogin.status}`);
      console.log("   Make sure the server is running and admin user exists");
    }

    console.log("\n✨ Tests completed!\n");
  } catch (error) {
    console.error("\n❌ Error running tests:", error.message);
    console.log("\n⚠️  Make sure the server is running: npm run start:dev\n");
  }
}

// Run tests
runTests();
