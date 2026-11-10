import postgres from "postgres";

// One pool per server process; reused across hot reloads in dev.
const cache = globalThis as unknown as { sql?: postgres.Sql };

export function db() {
  if (!cache.sql) {
    const url = process.env.DATABASE_URL;
    if (!url) throw new Error("DATABASE_URL is not set.");
    // prepare: false is required by Supabase's transaction pooler (port 6543).
    cache.sql = postgres(url, { prepare: false, ssl: "require", max: 5, idle_timeout: 20 });
  }
  return cache.sql;
}
