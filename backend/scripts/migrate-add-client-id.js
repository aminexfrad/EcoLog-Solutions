/**
 * One-time migration helper: add shipments.client_id if missing.
 *
 * Usage:
 *   node scripts/migrate-add-client-id.js
 */
require("dotenv").config();
const db = require("../config/db");

async function main() {
  const [cols] = await db.execute(
    `SELECT COLUMN_NAME
     FROM information_schema.COLUMNS
     WHERE TABLE_SCHEMA = DATABASE()
       AND TABLE_NAME = 'shipments'
       AND COLUMN_NAME = 'client_id'`
  );

  if (cols.length > 0) {
    console.log("✅ Migration skipped: shipments.client_id already exists.");
    process.exit(0);
  }

  console.log("⏳ Adding shipments.client_id...");
  await db.execute(`ALTER TABLE shipments ADD COLUMN client_id INT UNSIGNED NULL AFTER shipper_id`);
  await db.execute(`ALTER TABLE shipments ADD CONSTRAINT fk_shipments_client FOREIGN KEY (client_id) REFERENCES users(id) ON DELETE SET NULL`);
  await db.execute(`CREATE INDEX idx_shipments_client ON shipments(client_id)`);
  console.log("✅ Migration applied.");
  process.exit(0);
}

main().catch((err) => {
  console.error("❌ Migration failed:", err.message);
  process.exit(1);
});

