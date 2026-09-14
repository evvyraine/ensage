import Link from "next/link"
import { RiFileTextLine, RiLink, RiLockLine, RiAttachment2, RiCloseLine } from "@remixicon/react"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import type { ShareSummary } from "@/lib/types"
import { formatDate, formatDateTime } from "@/lib/format"
import { CopyButton } from "./copy-button"
import { ShareActions } from "./share-actions"

const kindIcon = { text: RiFileTextLine, file: RiAttachment2, link: RiLink } as const
const visibilityLabel = {
  private: "Private",
  unlisted: "Anyone with link",
  public: "Public",
} as const

function formatBytes(bytes: number) {
  if (bytes < 1024) return `${bytes} B`
  if (bytes < 1048576) return `${(bytes / 1024).toFixed(1)} KB`
  return `${(bytes / 1048576).toFixed(2)} MB`
}

export function ShareDetail({
  share,
  collections = [],
  basePath = "/shares",
  query = {},
}: {
  share: ShareSummary
  collections?: { id: string; name: string }[]
  basePath?: string
  query?: Record<string, string | undefined>
}) {
  const Icon = kindIcon[share.kind]
  const params = new URLSearchParams()
  for (const [key, value] of Object.entries(query))
    if (value) params.set(key, value)
  const backHref = params.toString() ? `${basePath}?${params}` : basePath
  const expiresAt = share.expiresAt ? new Date(share.expiresAt) : null
  const expired = expiresAt ? expiresAt < new Date() : false
  const collectionName = collections.find(
    (collection) => collection.id === share.collectionId
  )?.name

  return (
    <aside className="flex flex-col overflow-hidden rounded-2xl border bg-card lg:max-h-[calc(100vh-7rem)]">
      <header className="border-b p-5">
        <div className="flex items-start gap-3">
          <span className="grid size-10 shrink-0 place-items-center rounded-xl bg-primary/10 text-primary">
            <Icon className="size-4" />
          </span>
          <div className="min-w-0 flex-1">
            <h2 className="font-heading text-lg leading-tight font-semibold break-words">
              {share.title || share.originalName || "Untitled share"}
            </h2>
            <div className="mt-2 flex flex-wrap items-center gap-2">
              <Badge variant="secondary">{share.kind}</Badge>
              <Badge variant="secondary">
                {visibilityLabel[share.visibility]}
              </Badge>
              {share.hasPassword && (
                <Badge variant="secondary">
                  <RiLockLine />
                  Password
                </Badge>
              )}
              {share.state !== "ready" && (
                <Badge variant="secondary">{share.state}</Badge>
              )}
              {expiresAt && (
                <Badge variant={expired ? "destructive" : "secondary"}>
                  {expired
                    ? "Expired"
                    : `Expires ${formatDate(expiresAt)}`}
                </Badge>
              )}
            </div>
          </div>
          <Button
            asChild
            variant="ghost"
            size="icon"
            aria-label="Close share"
          >
            <Link href={backHref}>
              <RiCloseLine />
            </Link>
          </Button>
        </div>
        <div className="mt-5">
          <ShareActions share={share} collections={collections} />
        </div>
      </header>

      <div className="flex-1 space-y-6 overflow-y-auto p-5">
        {share.kind === "text" && (
          <section>
            <div className="mb-3 flex items-center justify-between gap-2">
              <h3 className="text-xs font-medium tracking-wider text-muted-foreground uppercase">
                Content
              </h3>
              <CopyButton value={share.content ?? ""} />
            </div>
            <pre className="overflow-x-auto rounded-2xl border bg-zinc-950 p-5 font-mono text-sm leading-7 whitespace-pre-wrap text-zinc-200">
              {share.content || "—"}
            </pre>
          </section>
        )}

        {share.kind === "link" && (
          <section>
            <div className="mb-3 flex items-center justify-between gap-2">
              <h3 className="text-xs font-medium tracking-wider text-muted-foreground uppercase">
                Destination
              </h3>
              <CopyButton value={share.targetUrl ?? ""} />
            </div>
            <a
              href={share.targetUrl ?? "#"}
              target="_blank"
              rel="noopener noreferrer"
              className="block rounded-2xl border p-5 break-all transition-colors hover:bg-accent/50"
            >
              <span className="text-xs font-medium tracking-wider text-muted-foreground uppercase">
                {share.targetUrl ? new URL(share.targetUrl).hostname : ""}
              </span>
              <p className="mt-2 text-sm">{share.targetUrl}</p>
            </a>
          </section>
        )}

        {share.kind === "file" && (
          <section className="rounded-2xl border p-6">
            <RiAttachment2 className="size-5 text-primary" />
            <p className="mt-4 font-medium">
              {share.originalName || "File"}
            </p>
            <p className="mt-1 text-sm text-muted-foreground">
              {formatBytes(share.sizeBytes)} ·{" "}
              {share.mediaType ?? "application/octet-stream"}
            </p>
          </section>
        )}

        <section>
          <h3 className="mb-3 text-xs font-medium tracking-wider text-muted-foreground uppercase">
            Details
          </h3>
          <dl className="grid grid-cols-2 gap-x-4 gap-y-3 text-sm">
            <dt className="text-muted-foreground">Created</dt>
            <dd>{formatDateTime(share.createdAt)}</dd>
            <dt className="text-muted-foreground">Updated</dt>
            <dd>{formatDateTime(share.updatedAt)}</dd>
            <dt className="text-muted-foreground">Views</dt>
            <dd>{share.viewCount}</dd>
            <dt className="text-muted-foreground">Last viewed</dt>
            <dd>
              {share.lastViewedAt
                ? formatDateTime(share.lastViewedAt)
                : "Never"}
            </dd>
            <dt className="text-muted-foreground">Expires</dt>
            <dd>{expiresAt ? formatDateTime(expiresAt) : "Never"}</dd>
            {collectionName && (
              <>
                <dt className="text-muted-foreground">Collection</dt>
                <dd>{collectionName}</dd>
              </>
            )}
          </dl>
        </section>
      </div>
    </aside>
  )
}
