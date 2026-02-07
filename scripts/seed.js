// Single clean seeder
const BASE = process.env.BASE_URL || "http://localhost:3000/api";

async function getFetch() {
  if (typeof fetch !== "undefined") return fetch;
  try {
    const mod = await import("node-fetch");
    return mod.default || mod;
  } catch (e) {
    throw new Error(
      "No fetch available. Run on Node 18+ or install node-fetch",
    );
  }
}

async function get(path) {
  const fetch = await getFetch();
  try {
    const res = await fetch(`${BASE}${path}`);
    if (!res.ok) return null;
    return res.json().catch(() => null);
  } catch (err) {
    return null;
  }
}

async function post(path, body) {
  const fetch = await getFetch();
  const res = await fetch(`${BASE}${path}`, {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify(body),
  });
  const data = await res.json().catch(() => ({}));
  if (!res.ok)
    throw new Error(
      `POST ${path} failed: ${res.status} ${JSON.stringify(data)}`,
    );
  return data;
}

async function waitForServer(retries = 40, delayMs = 500) {
  for (let i = 0; i < retries; i++) {
    const ok = await get("/simTypes");
    if (ok) return true;
    await new Promise((r) => setTimeout(r, delayMs));
  }
  return false;
}

async function run() {
  console.log("Seeding to", BASE);

  // users (admin / operator)
  const neededUsers = [
    { username: "admin", password: "adminpass", role: "admin" },
    { username: "operator", password: "operatorpass", role: "operator" },
  ];
  const existingUsers = (await get("/users")) || [];
  for (const u of neededUsers) {
    let found = existingUsers.find((e) => e.username === u.username);
    if (!found) {
      try {
        found = await post("/users", u);
        console.log("Created user", found.username || found.id);
      } catch (err) {
        console.log("Failed creating user", u.username, err.message || err);
      }
    } else {
      console.log("Using existing user", found.username || found.id);
    }
  }

  // sim types
  const neededTypes = [
    { name: "digi", purchaseProduct: "digi-product" },
    { name: "maxis", purchaseProduct: "maxis-product" },
    { name: "flexiroam", purchaseProduct: "flexiroam-product" },
    { name: "singtel", purchaseProduct: "singtel-product" },
  ];
  const existingTypes = (await get("/simTypes")) || [];
  const createdTypes = [];
  for (const t of neededTypes) {
    let found = existingTypes.find((e) => e.name === t.name);
    if (!found) {
      found = await post("/simTypes", t);
      console.log("Created sim-type", found.name || found.id);
    } else {
      console.log("Using existing sim-type", found.name || found.id);
    }
    createdTypes.push(found);
  }

  // customers
  const sampleCustomers = [
    { name: "ACME Corp", email: "contact@acme.test" },
    { name: "Beta Ltd", email: "info@beta.test" },
    { name: "Gamma LLC", email: "hello@gamma.test" },
    { name: "Delta Co", email: "sales@delta.test" },
    { name: "Epsilon Inc", email: "support@epsilon.test" },
    { name: "Zeta Partners", email: "contact@zeta.test" },
  ];
  const existingCustomers = (await get("/customers")) || [];
  const createdCustomers = [];
  for (const c of sampleCustomers) {
    let found = existingCustomers.find(
      (e) => e.email === c.email || e.name === c.name,
    );
    if (!found) {
      found = await post("/customers", c);
      console.log("Created customer", found.name || found.id);
    } else {
      console.log("Using existing customer", found.name || found.id);
    }
    createdCustomers.push(found);
  }

  // sim cards and transactions
  const sampleSimCards = [];
  for (let i = 1; i <= 12; i++)
    sampleSimCards.push({
      serialNumber: `SN${100000 + i}`,
      imsi: `IMSI${100000 + i}`,
    });
  const existingSimCards = (await get("/simCards")) || [];
  for (let i = 0; i < sampleSimCards.length; i++) {
    const s = sampleSimCards[i];
    let found = existingSimCards.find(
      (e) => e.serialNumber === s.serialNumber || e.imsi === s.imsi,
    );
    if (!found) {
      const assignedType = createdTypes[i % createdTypes.length];
      found = await post("/simCards", {
        serialNumber: s.serialNumber,
        imsi: s.imsi,
        simType: assignedType.id,
      });
      console.log("Created sim-card", found.serialNumber || found.id);
    } else {
      console.log("Using existing sim-card", found.serialNumber || found.id);
    }

    const simDetail = (await get(`/simCards/${found.id}`)) || {};
    const existingTrx = simDetail.transactions || [];
    const assignedCustomer = createdCustomers[i % createdCustomers.length];
    const hasIn = existingTrx.some((t) => t.type === "STOCK_IN");
    if (!hasIn) {
      const trxIn = await post("/transactions", {
        simCardId: found.id,
        customerId: assignedCustomer.id,
        type: "STOCK_IN",
      });
      console.log(
        "Created transaction (STOCK_IN) for",
        found.serialNumber || found.id,
        trxIn.id || "",
      );
    }
    if (i % 2 === 1) {
      const hasOut = existingTrx.some((t) => t.type === "STOCK_OUT");
      if (!hasOut) {
        const assignedCustomerOut =
          createdCustomers[(i + 1) % createdCustomers.length];
        const trxOut = await post("/transactions", {
          simCardId: found.id,
          customerId: assignedCustomerOut.id,
          type: "STOCK_OUT",
        });
        console.log(
          "Created transaction (STOCK_OUT) for",
          found.serialNumber || found.id,
          trxOut.id || "",
        );
      }
    }
  }

  console.log("Seeding complete");
}

(async () => {
  const ready = await waitForServer();
  if (!ready) {
    console.error("API not responding at", BASE);
    return;
  }
  try {
    await run();
  } catch (err) {
    console.error("Seeder failed:", err.message || err);
  }
})();
