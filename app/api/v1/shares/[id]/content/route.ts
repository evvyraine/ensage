import { and, eq } from "drizzle-orm"
import { cookies } from "next/headers"
import { database } from "@/lib/db"
import { shares } from "@/lib/db/schema"
import { apiError } from "@/lib/server/http"
import { readStream } from "@/lib/server/storage"
import { authenticateRequest } from "@/lib/server/auth"
import {
  shareAccessCookieName,
  verifyShareAccessToken,
} from "@/lib/server/share-access"
export async function GET(
  request: Request,
  ctx: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await ctx.params
    const [share] = await database()
      .select()
      .from(shares)
      .where(and(eq(shares.id, id), eq(shares.state, "ready")))
      .limit(1)
    if (!share || share.kind !== "file" || !share.storageKey)
      return Response.json({ error: "Not found" }, { status: 404 })
    if (share.visibility === "private" || share.passwordHash) {
      const token = (await cookies()).get(shareAccessCookieName(share.id))
        ?.value
      if (!verifyShareAccessToken(share.id, token)) {
        try {
          const user = await authenticateRequest(request)
          if (user.id !== share.ownerId) throw new Error("UNAUTHORIZED")
        } catch {
          return Response.json(
            { error: "Authentication required" },
            { status: 401 }
          )
        }
      }
    }
    return new Response(readStream(share.storageKey), {
      headers: {
        "content-type": share.mediaType ?? "application/octet-stream",
        "content-disposition": `attachment; filename*=UTF-8''${encodeURIComponent(share.originalName ?? "download")}`,
        "x-content-type-options": "nosniff",
        "cache-control": "private, no-store",
      },
    })
  } catch (error) {
    return apiError(error)
  }
}
