export type ShareKind = "text" | "file" | "link"
export type ShareState = "pending" | "ready" | "trashed" | "deleted"
export type ShareVisibility = "private" | "unlisted" | "public"

// The shape safe to send across the server/client boundary. It deliberately
// excludes password hashes, management token hashes, and storage keys.
export type ShareSummary = {
  id: string
  slug: string
  kind: ShareKind
  state: ShareState
  visibility: ShareVisibility
  title: string | null
  content: string | null
  targetUrl: string | null
  originalName: string | null
  mediaType: string | null
  sizeBytes: number
  collectionId: string | null
  hasPassword: boolean
  expiresAt: Date | string | null
  lastViewedAt: Date | string | null
  viewCount: number
  createdAt: Date | string
  updatedAt: Date | string
}

export type CollectionSummary = {
  id: string
  name: string
  description: string | null
  icon: string
  slug: string
  visibility: ShareVisibility
  shareCount: number
  createdAt: Date | string
  updatedAt: Date | string
}
