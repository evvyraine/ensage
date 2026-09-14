import { and, eq, sql } from "drizzle-orm"
import { customAlphabet } from "nanoid"
import { database } from "@/lib/db"
import { auditEvents, collections, shares } from "@/lib/db/schema"
import { authenticateRequest } from "@/lib/server/auth"
import { apiError } from "@/lib/server/http"
import { updateCollectionInput } from "@/lib/validation/collection"
const makeSlug = customAlphabet("23456789abcdefghjkmnpqrstuvwxyz", 14)
export async function GET(
  request: Request,
  ctx: { params: Promise<{ id: string }> }
) {
  try {
    const user = await authenticateRequest(request)
    const { id } = await ctx.params
    const [collection] = await database()
      .select()
      .from(collections)
      .where(and(eq(collections.id, id), eq(collections.ownerId, user.id)))
      .limit(1)
    if (!collection)
      return Response.json({ error: "Not found" }, { status: 404 })
    const items = await database()
      .select({
        id: shares.id,
        slug: shares.slug,
        kind: shares.kind,
        state: shares.state,
        visibility: shares.visibility,
        title: shares.title,
        content: shares.content,
        targetUrl: shares.targetUrl,
        originalName: shares.originalName,
        mediaType: shares.mediaType,
        sizeBytes: shares.sizeBytes,
        collectionId: shares.collectionId,
        hasPassword: sql<boolean>`(${shares.passwordHash} is not null)`,
        expiresAt: shares.expiresAt,
        lastViewedAt: shares.lastViewedAt,
        viewCount: shares.viewCount,
        createdAt: shares.createdAt,
        updatedAt: shares.updatedAt,
      })
      .from(shares)
      .where(
        and(
          eq(shares.ownerId, user.id),
          eq(shares.collectionId, id),
          eq(shares.state, "ready")
        )
      )
    return Response.json({ collection, shares: items })
  } catch (e) {
    return apiError(e)
  }
}
export async function PATCH(
  request: Request,
  ctx: { params: Promise<{ id: string }> }
) {
  try {
    const user = await authenticateRequest(request)
    const { id } = await ctx.params
    const value = updateCollectionInput.parse(await request.json())
    const [current] = await database()
      .select()
      .from(collections)
      .where(and(eq(collections.id, id), eq(collections.ownerId, user.id)))
      .limit(1)
    if (!current) return Response.json({ error: "Not found" }, { status: 404 })
    const visibilityChanged =
      value.visibility !== undefined && value.visibility !== current.visibility
    const [updated] = await database()
      .update(collections)
      .set({
        ...value,
        slug: visibilityChanged || value.rotateLink ? makeSlug() : undefined,
        updatedAt: new Date(),
      })
      .where(eq(collections.id, id))
      .returning()
    await database().insert(auditEvents).values({
      actorId: user.id,
      action: "collection.updated",
      resourceType: "collection",
      resourceId: id,
    })
    return Response.json({ collection: updated })
  } catch (e) {
    return apiError(e)
  }
}
export async function DELETE(
  request: Request,
  ctx: { params: Promise<{ id: string }> }
) {
  try {
    const user = await authenticateRequest(request)
    const { id } = await ctx.params
    await database()
      .update(shares)
      .set({ collectionId: null })
      .where(and(eq(shares.ownerId, user.id), eq(shares.collectionId, id)))
    const [deleted] = await database()
      .delete(collections)
      .where(and(eq(collections.id, id), eq(collections.ownerId, user.id)))
      .returning({ id: collections.id })
    if (!deleted) return Response.json({ error: "Not found" }, { status: 404 })
    await database().insert(auditEvents).values({
      actorId: user.id,
      action: "collection.deleted",
      resourceType: "collection",
      resourceId: id,
    })
    return new Response(null, { status: 204 })
  } catch (e) {
    return apiError(e)
  }
}
