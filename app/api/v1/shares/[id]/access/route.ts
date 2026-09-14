import { and, eq, isNotNull } from "drizzle-orm"
import { cookies } from "next/headers"
import { z } from "zod"
import { database } from "@/lib/db"
import { shares } from "@/lib/db/schema"
import { apiError } from "@/lib/server/http"
import { logger } from "@/lib/server/logger"
import { enforceRateLimit } from "@/lib/server/rate-limit"
import { verifySecret } from "@/lib/server/security"
import {
  SHARE_ACCESS_MAX_AGE_SECONDS,
  createShareAccessToken,
  shareAccessCookieName,
} from "@/lib/server/share-access"

type Context = { params: Promise<{ id: string }> }
export async function POST(request: Request, ctx: Context) {
  try {
    const { id } = await ctx.params
    const { password } = z
      .object({ password: z.string().min(1).max(128) })
      .parse(await request.json())
    const [share] = await database()
      .select()
      .from(shares)
      .where(
        and(
          eq(shares.id, id),
          eq(shares.state, "ready"),
          isNotNull(shares.passwordHash)
        )
      )
      .limit(1)
    if (!share?.passwordHash)
      return Response.json({ error: "Not found" }, { status: 404 })
    await enforceRateLimit(`share:access:${id}`, 10)
    if (!(await verifySecret(share.passwordHash, password))) {
      logger.warn("share.unlock_failed", { shareId: id })
      return Response.json({ error: "Incorrect password" }, { status: 403 })
    }
    const ttl = share.expiresAt
      ? Math.min(
          SHARE_ACCESS_MAX_AGE_SECONDS,
          Math.max(
            60,
            Math.floor((share.expiresAt.getTime() - Date.now()) / 1000)
          )
        )
      : SHARE_ACCESS_MAX_AGE_SECONDS
    const store = await cookies()
    store.set(shareAccessCookieName(id), createShareAccessToken(id, ttl), {
      httpOnly: true,
      sameSite: "lax",
      secure: process.env.NODE_ENV === "production",
      path: "/",
      maxAge: ttl,
    })
    return new Response(null, { status: 204 })
  } catch (error) {
    return apiError(error)
  }
}
