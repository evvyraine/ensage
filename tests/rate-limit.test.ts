import { randomUUID } from "node:crypto"
import { sql } from "drizzle-orm"
import { afterAll, describe, expect, it } from "vitest"

// Integration test. Runs only when a migrated database is provided, so the
// default `npm test` stays hermetic.
const databaseUrl = process.env.TEST_DATABASE_URL
if (databaseUrl) process.env.DATABASE_URL = databaseUrl

describe.skipIf(!databaseUrl)("enforceRateLimit", () => {
  const keys: string[] = []
  afterAll(async () => {
    const { database } = await import("@/lib/db")
    for (const key of keys)
      await database().execute(sql`delete from rate_limits where key = ${key}`)
  })

  it("allows requests up to the limit, then blocks", async () => {
    const { enforceRateLimit } = await import("@/lib/server/rate-limit")
    const key = `test:${randomUUID()}`
    keys.push(key)
    await enforceRateLimit(key, 2)
    await enforceRateLimit(key, 2)
    await expect(enforceRateLimit(key, 2)).rejects.toThrow("RATE_LIMITED")
  })
})
