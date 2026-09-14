import Link from "next/link"
import { RiApps2Line } from "@remixicon/react"
import { PageHeading } from "@/components/app/page-heading"
import { Pagination } from "@/components/app/pagination"
import { ShareFilters } from "@/components/app/share-filters"
import { SharesView } from "@/components/app/shares-view"
import {
  PAGE_SIZE,
  ownerCollections,
  ownerShareSummary,
  ownerShares,
  searchCollections,
} from "@/lib/server/queries"
import { cn } from "@/lib/utils"

export const dynamic = "force-dynamic"
export default async function Shares({
  searchParams,
}: {
  searchParams: Promise<{
    q?: string
    page?: string
    share?: string
    kind?: string
    visibility?: string
    password?: string
  }>
}) {
  const { q, page, share, kind, visibility, password } = await searchParams
  const current = Math.max(Number(page) || 1, 1)
  const { shares: rows, total } = await ownerShares({
    q,
    page: current,
    kind:
      kind === "text" || kind === "file" || kind === "link" ? kind : undefined,
    visibility:
      visibility === "private" ||
      visibility === "unlisted" ||
      visibility === "public"
        ? visibility
        : undefined,
    password:
      password === "protected" || password === "open" ? password : undefined,
  })
  const collections = (await ownerCollections()).map((collection) => ({
    id: collection.id,
    name: collection.name,
  }))
  const selected = share ? await ownerShareSummary(share) : null
  const collectionMatches = q ? await searchCollections(q) : []
  return (
    <>
      <div className={cn(selected && "hidden lg:block")}>
        <PageHeading
          title={q ? `Results for “${q}”` : "All shares"}
          description={`${total} share${total === 1 ? "" : "s"} in your workspace.`}
        />
      </div>
      {collectionMatches.length > 0 && (
        <section className="mb-8">
          <h2 className="mb-3 font-heading text-lg font-semibold">
            Matching collections
          </h2>
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {collectionMatches.map((collection) => (
              <Link
                key={collection.id}
                href={`/c/${collection.slug}`}
                className="flex items-start gap-3 rounded-2xl border bg-card p-4 transition-colors hover:bg-accent/60"
              >
                <RiApps2Line className="mt-0.5 size-4 shrink-0 text-primary" />
                <div className="min-w-0">
                  <p className="truncate text-sm font-medium">
                    {collection.name}
                  </p>
                  <p className="mt-1 line-clamp-1 text-xs text-muted-foreground">
                    {collection.description || "No description"}
                  </p>
                </div>
              </Link>
            ))}
          </div>
        </section>
      )}
      <ShareFilters />
      <SharesView
        shares={rows}
        selected={selected}
        collections={collections}
        basePath="/shares"
        query={{ q }}
      />
      <Pagination
        page={current}
        pageSize={PAGE_SIZE}
        total={total}
        basePath="/shares"
        query={{ q }}
      />
    </>
  )
}
