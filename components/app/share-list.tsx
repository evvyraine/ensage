import Link from "next/link"
import { RiFileTextLine, RiLink, RiLockLine, RiAttachment2 } from "@remixicon/react"
import { Badge } from "@/components/ui/badge"
import { cn } from "@/lib/utils"
import { formatDate } from "@/lib/format"
import type { ShareSummary } from "@/lib/types"

const kindIcon = {
  text: RiFileTextLine,
  file: RiAttachment2,
  link: RiLink,
} as const

export function shareHref(
  basePath: string,
  query: Record<string, string | undefined>,
  shareId: string
) {
  const params = new URLSearchParams()
  for (const [key, value] of Object.entries(query))
    if (value) params.set(key, value)
  params.set("share", shareId)
  return `${basePath}?${params.toString()}`
}

export function ShareList({
  shares: rows,
  selectedId,
  basePath = "/shares",
  query = {},
  trash = false,
}: {
  shares: ShareSummary[]
  selectedId?: string
  basePath?: string
  query?: Record<string, string | undefined>
  trash?: boolean
}) {
  if (!rows.length)
    return (
      <div className="rounded-2xl border border-dashed px-6 py-16 text-center">
        <RiFileTextLine className="mx-auto mb-4 size-8 text-muted-foreground" />
        <h3 className="font-medium">Nothing here yet</h3>
        <p className="mx-auto mt-1 max-w-xs text-sm text-muted-foreground">
          {trash
            ? "Trashed shares will appear here for 30 days."
            : "Create your first share and it will appear here."}
        </p>
      </div>
    )
  return (
    <ul className="overflow-hidden rounded-2xl border bg-card">
      {rows.map((share, index) => {
        const Icon = kindIcon[share.kind]
        const selected = share.id === selectedId
        return (
          <li key={share.id}>
            <Link
              href={shareHref(basePath, query, share.id)}
              aria-current={selected ? "true" : undefined}
              className={cn(
                "flex items-center gap-3 px-4 py-3.5 transition-colors outline-none",
                "focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-inset",
                "first:rounded-t-2xl last:rounded-b-2xl",
                selected ? "bg-accent" : "hover:bg-accent/50"
              )}
              style={{
                borderTop: index > 0 ? "1px solid var(--border)" : undefined,
              }}
            >
              <span
                className={cn(
                  "grid size-10 shrink-0 place-items-center rounded-xl",
                  selected
                    ? "bg-primary/15 text-primary"
                    : "bg-muted text-foreground/70"
                )}
              >
                <Icon className="size-4" />
              </span>
              <span className="min-w-0 flex-1">
                <span className="block truncate text-sm font-medium">
                  {share.title || share.originalName || "Untitled share"}
                </span>
                <span className="mt-0.5 block truncate text-xs text-muted-foreground">
                  {formatDate(share.createdAt)} ·{" "}
                  {share.viewCount} view{share.viewCount === 1 ? "" : "s"}
                  {share.collectionId ? " · in collection" : ""}
                </span>
              </span>
              {share.hasPassword && (
                <RiLockLine
                  className="size-3.5 shrink-0 text-muted-foreground"
                  aria-label="Password protected"
                />
              )}
              <Badge variant="secondary" className="shrink-0">
                {share.kind}
              </Badge>
            </Link>
          </li>
        )
      })}
    </ul>
  )
}
