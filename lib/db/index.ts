import "server-only"
import { drizzle } from "drizzle-orm/node-postgres"
import { Pool } from "pg"
import * as schema from "./schema"

// One pool per Node process. Storing it on globalThis keeps a single pool
// across Next.js dev-mode module reloads; production reuses it as well, so the
// server never opens a new pool per request.
const globalDb = globalThis as unknown as { pool?: Pool }

function getPool() {
  if (globalDb.pool) return globalDb.pool
  const url = process.env.DATABASE_URL
  if (!url) throw new Error("DATABASE_URL is required")
  const configuredMax = Number(process.env.DATABASE_POOL_MAX)
  const pool = new Pool({
    connectionString: url,
    max: Number.isFinite(configuredMax) && configuredMax > 0 ? configuredMax : 10,
    connectionTimeoutMillis: 5_000,
    idleTimeoutMillis: 30_000,
    ssl:
      process.env.DATABASE_SSL === "true"
        ? { rejectUnauthorized: true }
        : undefined,
  })
  globalDb.pool = pool
  return pool
}

export function database() {
  return drizzle(getPool(), { schema })
}
