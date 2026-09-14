import "server-only"
import {
  and,
  count,
  desc,
  eq,
  ilike,
  isNotNull,
  isNull,
  ne,
  or,
  sql,
} from "drizzle-orm"
import { database } from "@/lib/db"
import {
  auditEvents,
  collections,
  recentViews,
  settings,
  shares,
} from "@/lib/db/schema"
import { requirePageUser } from "./auth"

export const PAGE_SIZE = 25

const UUID =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i

// Column selection shared by every owner-facing list. Keeping it explicit
// guarantees secrets (password hash, management token hash, storage key) never
// cross into a Client Component.
const shareSummary = {
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
}

// Correlated count so collection lists can show how much they hold without a
// second round trip.
const collectionSummary = {
  id: collections.id,
  name: collections.name,
  description: collections.description,
  icon: collections.icon,
  slug: collections.slug,
  visibility: collections.visibility,
  createdAt: collections.createdAt,
  updatedAt: collections.updatedAt,
  shareCount: sql<number>`(select count(*) from ${shares} where ${shares.collectionId} = ${collections.id} and ${shares.state} = 'ready')`,
}

export async function workspaceData() {
  const user = await requirePageUser()
  const db = database()
  const [[active], [views], [collectionCount], recent] = await Promise.all([
    db
      .select({ value: count() })
      .from(shares)
      .where(and(eq(shares.ownerId, user.id), eq(shares.state, "ready"))),
    db
      .select({ value: sql<number>`coalesce(sum(${shares.viewCount}), 0)` })
      .from(shares)
      .where(eq(shares.ownerId, user.id)),
    db
      .select({ value: count() })
      .from(collections)
      .where(eq(collections.ownerId, user.id)),
    db
      .select(shareSummary)
      .from(shares)
      .where(and(eq(shares.ownerId, user.id), eq(shares.state, "ready")))
      .orderBy(desc(shares.createdAt))
      .limit(6),
  ])
  return {
    user,
    stats: {
      active: Number(active.value),
      views: Number(views.value),
      collections: Number(collectionCount.value),
    },
    recent,
  }
}

export async function ownerShares(
  options: {
    q?: string
    state?: "ready" | "trashed"
    recent?: boolean
    page?: number
    pageSize?: number
    kind?: "text" | "file" | "link"
    visibility?: "private" | "unlisted" | "public"
    password?: "protected" | "open"
  } = {}
) {
  const user = await requirePageUser()
  const db = database()
  const state = options.state ?? "ready"
  if (options.recent) {
    const rows = await db
      .select(shareSummary)
      .from(recentViews)
      .innerJoin(shares, eq(shares.id, recentViews.shareId))
      .where(and(eq(recentViews.userId, user.id), ne(shares.state, "deleted")))
      .orderBy(desc(recentViews.viewedAt))
      .limit(100)
    return { shares: rows, total: rows.length }
  }
  const query = options.q?.trim().slice(0, 100)
  const filter = query
    ? or(
        ilike(shares.title, `%${query}%`),
        ilike(shares.slug, `%${query}%`),
        ilike(shares.content, `%${query}%`),
        ilike(shares.originalName, `%${query}%`)
      )
    : undefined
  const where = and(
    eq(shares.ownerId, user.id),
    eq(shares.state, state),
    filter,
    options.kind ? eq(shares.kind, options.kind) : undefined,
    options.visibility ? eq(shares.visibility, options.visibility) : undefined,
    options.password === "protected"
      ? isNotNull(shares.passwordHash)
      : options.password === "open"
        ? isNull(shares.passwordHash)
        : undefined
  )
  const pageSize = Math.min(Math.max(options.pageSize ?? PAGE_SIZE, 1), 100)
  const page = Math.max(options.page ?? 1, 1)
  const [rows, [total]] = await Promise.all([
    db
      .select(shareSummary)
      .from(shares)
      .where(where)
      .orderBy(desc(state === "trashed" ? shares.trashedAt : shares.createdAt))
      .limit(pageSize)
      .offset((page - 1) * pageSize),
    db.select({ value: count() }).from(shares).where(where),
  ])
  return { shares: rows, total: Number(total.value) }
}

export async function searchCollections(q: string) {
  const user = await requirePageUser()
  const query = q.trim().slice(0, 100)
  if (!query) return []
  return database()
    .select({
      id: collections.id,
      name: collections.name,
      description: collections.description,
      icon: collections.icon,
      slug: collections.slug,
      visibility: collections.visibility,
    })
    .from(collections)
    .where(
      and(
        eq(collections.ownerId, user.id),
        or(
          ilike(collections.name, `%${query}%`),
          ilike(collections.description, `%${query}%`)
        )
      )
    )
    .orderBy(desc(collections.updatedAt))
    .limit(10)
}

export async function ownerCollections() {
  const user = await requirePageUser()
  return database()
    .select(collectionSummary)
    .from(collections)
    .where(eq(collections.ownerId, user.id))
    .orderBy(desc(collections.updatedAt))
}

export async function ownerCollectionDetail(id: string) {
  const user = await requirePageUser()
  if (!UUID.test(id)) return null
  const db = database()
  const [collection] = await db
    .select(collectionSummary)
    .from(collections)
    .where(and(eq(collections.id, id), eq(collections.ownerId, user.id)))
    .limit(1)
  if (!collection) return null
  const items = await db
    .select(shareSummary)
    .from(shares)
    .where(
      and(
        eq(shares.ownerId, user.id),
        eq(shares.collectionId, id),
        eq(shares.state, "ready")
      )
    )
    .orderBy(desc(shares.createdAt))
  return { collection, shares: items }
}

export async function ownerSettings() {
  const user = await requirePageUser()
  const [row] = await database()
    .select()
    .from(settings)
    .where(eq(settings.userId, user.id))
    .limit(1)
  return row
}

export async function ownerShareSummary(id: string) {
  const user = await requirePageUser()
  if (!UUID.test(id)) return null
  const [row] = await database()
    .select(shareSummary)
    .from(shares)
    .where(and(eq(shares.id, id), eq(shares.ownerId, user.id)))
    .limit(1)
  return row ?? null
}

export async function ownerAuditEvents(
  options: { page?: number; pageSize?: number } = {}
) {
  const user = await requirePageUser()
  const db = database()
  const pageSize = Math.min(Math.max(options.pageSize ?? PAGE_SIZE, 1), 100)
  const page = Math.max(options.page ?? 1, 1)
  const where = eq(auditEvents.actorId, user.id)
  const [rows, [total]] = await Promise.all([
    db
      .select()
      .from(auditEvents)
      .where(where)
      .orderBy(desc(auditEvents.createdAt))
      .limit(pageSize)
      .offset((page - 1) * pageSize),
    db.select({ value: count() }).from(auditEvents).where(where),
  ])
  return { events: rows, total: Number(total.value) }
}
