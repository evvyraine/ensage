import { sql } from "drizzle-orm"
import { database } from "@/lib/db"
import { logger } from "@/lib/server/logger"
export async function GET() {
  const started = Date.now()
  try {
    await database().execute(sql`select 1`)
    return Response.json({
      ok: true,
      service: "ensage",
      uptimeSeconds: Math.round(process.uptime()),
      dbLatencyMs: Date.now() - started,
    })
  } catch (error) {
    logger.error("health_check_failed", {
      message: error instanceof Error ? error.message : String(error),
    })
    return Response.json({ ok: false, service: "ensage" }, { status: 503 })
  }
}
