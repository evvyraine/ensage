import { desc, eq } from "drizzle-orm"
import { database } from "@/lib/db"
import { auditEvents, collections } from "@/lib/db/schema"
import { authenticateRequest } from "@/lib/server/auth"
import { apiError } from "@/lib/server/http"
import { randomToken } from "@/lib/server/security"
import { createCollectionInput } from "@/lib/validation/collection"

const toSlug = (name: string) =>
  `${
    name
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-|-$/g, "")
      .slice(0, 50) || "collection"
  }-${randomToken(4).toLowerCase()}`
export async function GET(request: Request) {
  try {
    const user = await authenticateRequest(request)
    const rows = await database()
      .select()
      .from(collections)
      .where(eq(collections.ownerId, user.id))
      .orderBy(desc(collections.updatedAt))
    return Response.json({ collections: rows })
  } catch (e) {
    return apiError(e)
  }
}
export async function POST(request: Request) {
  try {
    const user = await authenticateRequest(request)
    const value = createCollectionInput.parse(await request.json())
    const [created] = await database().transaction(async (tx) => {
      const rows = await tx
        .insert(collections)
        .values({ ...value, ownerId: user.id, slug: toSlug(value.name) })
        .returning()
      await tx.insert(auditEvents).values({
        actorId: user.id,
        action: "collection.created",
        resourceType: "collection",
        resourceId: rows[0].id,
      })
      return rows
    })
    return Response.json({ collection: created }, { status: 201 })
  } catch (e) {
    return apiError(e)
  }
}
