import { and, eq, isNull } from "drizzle-orm"
import { database } from "@/lib/db"
import { apiKeys, auditEvents } from "@/lib/db/schema"
import { requireUser } from "@/lib/server/auth"
import { apiError } from "@/lib/server/http"

type Context = { params: Promise<{ id: string }> }
export async function DELETE(_request: Request, ctx: Context) {
  try {
    const user = await requireUser()
    const { id } = await ctx.params
    const [revoked] = await database()
      .update(apiKeys)
      .set({ revokedAt: new Date(), updatedAt: new Date() })
      .where(
        and(
          eq(apiKeys.id, id),
          eq(apiKeys.ownerId, user.id),
          isNull(apiKeys.revokedAt)
        )
      )
      .returning({ id: apiKeys.id })
    if (!revoked) return Response.json({ error: "Not found" }, { status: 404 })
    await database().insert(auditEvents).values({
      actorId: user.id,
      action: "api_key.revoked",
      resourceType: "api_key",
      resourceId: id,
    })
    return new Response(null, { status: 204 })
  } catch (error) {
    return apiError(error)
  }
}
