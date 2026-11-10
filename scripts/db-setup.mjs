// Runs every db/migrations/NNN_*.sql file in order. Usage: npm run db:setup
//
// Each migration must be idempotent (create ... if not exists, etc.), so
// running the whole set again is always safe and there's no tracking table.
// To add one: create the next number, e.g. 002_add_due_dates.sql.
import { readdirSync } from "node:fs";
import { fileURLToPath } from "node:url";
import postgres from "postgres";

const dir = fileURLToPath(new URL("../db/migrations/", import.meta.url));
const files = readdirSync(dir)
  .filter((f) => /^\d{3}_.+\.sql$/.test(f))
  .sort();

if (!process.env.DATABASE_URL) {
  console.error("DATABASE_URL is not set.");
  process.exit(1);
}

const sql = postgres(process.env.DATABASE_URL, { prepare: false, ssl: "require", max: 1 });
try {
  for (const file of files) {
    // One transaction per file: a failing migration leaves no partial changes.
    await sql.begin((tx) => tx.file(dir + file).simple());
    console.log(`✓ ${file}`);
  }
  console.log(`Database is up to date (${files.length} migration${files.length === 1 ? "" : "s"}).`);
} finally {
  await sql.end();
}
