/**
 * End-to-end workflow smoke test (cahier.md aligned).
 *
 * Requires:
 * - backend running on http://localhost:5000
 * - MySQL seeded (admin/shipper/carrier/client emails in seed.sql)
 * - DB has shipments.client_id (run migrate-add-client-id.js if needed)
 *
 * Usage:
 *   node scripts/smoke-workflow.js
 */

const BASE_URL = process.env.BASE_URL || "http://localhost:5000/api";

async function request(path, { method = "GET", token, body } = {}) {
  const res = await fetch(`${BASE_URL}${path}`, {
    method,
    headers: {
      "Content-Type": "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
    body: body ? JSON.stringify(body) : undefined,
  });
  const text = await res.text();
  let json;
  try {
    json = text ? JSON.parse(text) : null;
  } catch {
    json = { raw: text };
  }
  return { ok: res.ok, status: res.status, json };
}

function assert(cond, msg) {
  if (!cond) throw new Error(msg);
}

async function login(email, password) {
  const r = await request("/auth/login", { method: "POST", body: { email, password } });
  assert(r.ok, `login failed for ${email}: ${r.status} ${JSON.stringify(r.json)}`);
  return r.json.token;
}

async function main() {
  console.log("== Smoke workflow start ==");

  const adminToken = await login("admin@ecolog.fr", "password123");
  const shipperToken = await login("shipper@ecolog.fr", "password123");
  const carrierToken = await login("carrier@ecolog.fr", "password123");
  const clientToken = await login("client@ecolog.fr", "password123");

  // Admin can list users
  const users = await request("/users", { token: adminToken });
  assert(users.ok && Array.isArray(users.json), "admin users list failed");

  // Shipper creates a shipment for client
  const create = await request("/shipments", {
    method: "POST",
    token: shipperToken,
    body: {
      origin: "Paris 75001",
      destination: "Lyon 69001",
      weight_kg: 1200,
      client_email: "client@ecolog.fr",
    },
  });
  assert(create.ok, `shipper create shipment failed: ${create.status} ${JSON.stringify(create.json)}`);
  const shipmentId = create.json.id;
  const shipmentRef = create.json.reference;
  console.log("Created shipment", shipmentRef, "id=", shipmentId);

  // Carrier sees PENDING mission and accepts it
  const missions = await request("/missions", { token: carrierToken });
  assert(missions.ok && Array.isArray(missions.json), "carrier missions list failed");
  const pending = missions.json.find((m) => m.id === shipmentId) || missions.json.find((m) => m.reference === shipmentRef);
  assert(pending, "new shipment not visible as mission for carrier");
  assert(pending.status === "PENDING", `expected PENDING, got ${pending.status}`);

  const accept = await request(`/missions/${shipmentId}/accept`, { method: "PATCH", token: carrierToken });
  assert(accept.ok, `carrier accept failed: ${accept.status} ${JSON.stringify(accept.json)}`);

  // Carrier starts mission
  const inProg = await request(`/missions/${shipmentId}/status`, { method: "PATCH", token: carrierToken, body: { status: "IN_PROGRESS" } });
  assert(inProg.ok, `carrier in_progress failed: ${inProg.status} ${JSON.stringify(inProg.json)}`);

  // Carrier simulates GPS update
  const sim = await request(`/tracking/${shipmentId}/simulate`, { method: "POST", token: carrierToken });
  assert(sim.ok, `carrier simulate tracking failed: ${sim.status} ${JSON.stringify(sim.json)}`);

  // Client sees only their shipments (should include new one via client_id)
  const clientShips = await request("/shipments", { token: clientToken });
  assert(clientShips.ok && Array.isArray(clientShips.json), "client shipments list failed");
  const clientHas = clientShips.json.some((s) => s.id === shipmentId);
  assert(clientHas, "client cannot see their shipment (client_id scoping broken)");

  // Client can read tracking for their shipment
  const track = await request(`/tracking/${shipmentId}`, { token: clientToken });
  assert(track.ok && Array.isArray(track.json.history), "client tracking read failed");

  // Client cannot simulate tracking
  const simClient = await request(`/tracking/${shipmentId}/simulate`, { method: "POST", token: clientToken });
  assert(!simClient.ok && (simClient.status === 403 || simClient.status === 401), "client should not be able to simulate tracking");

  // Client can read documents for shipment
  const docs = await request(`/documents/shipment/${shipmentId}`, { token: clientToken });
  assert(docs.ok && Array.isArray(docs.json), "client documents read failed");

  // Shipper can buy credits (marketplace/compensation)
  const credits = await request("/compensations", { method: "POST", token: shipperToken, body: { tons: 1 } });
  assert(credits.ok, "shipper buy credits failed");

  // Admin can read audit logs
  const logs = await request("/audit/logs", { token: adminToken });
  assert(logs.ok, "admin audit logs failed");

  console.log("✅ Smoke workflow passed.");
}

main().catch((err) => {
  console.error("❌ Smoke workflow failed:", err.message);
  process.exit(1);
});

