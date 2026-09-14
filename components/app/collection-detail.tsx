import Link from "next/link"
import { RiCloseLine } from "@remixicon/react"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import type { CollectionSummary, ShareSummary } from "@/lib/types"
import { CollectionActions } from "./collection-actions"
import { CollectionIcon } from "./collection-icons"
import { ShareList } from "./share-list"

const visibilityLabel = {
  private: "Private",
  unlisted: "Anyone with link",
  public: "Public",
} as const

export function CollectionDetail({
  collection,
  shares,
}: {
  collection: CollectionSummary
  shares: ShareSummary[]
}) {
  return (
    <aside className="flex flex-col overflow-hidden rounded-2xl border bg-card lg:max-h-[calc(100vh-7rem)]">
      <header className="border-b p-5">
        <div className="flex items-start gap-3">
          <span className="grid size-10 shrink-0 place-items-center rounded-xl bg-primary/10 text-primary">
            <CollectionIcon name={collection.icon} className="size-4" />
          </span>
          <div className="min-w-0 flex-1">
            <h2 className="font-heading text-lg leading-tight font-semibold break-words">
              {collection.name}
            </h2>
            <div className="mt-2 flex flex-wrap items-center gap-2">
              <Badge variant="secondary">
                {visibilityLabel[collection.visibility]}
              </Badge>
              <Badge variant="secondary">
                {collection.shareCount} item
                {collection.shareCount === 1 ? "" : "s"}
              </Badge>
            </div>
          </div>
          <Button
            asChild
            variant="ghost"
            size="icon"
            aria-label="Close collection"
          >
            <Link href="/collections">
              <RiCloseLine />
            </Link>
          </Button>
        </div>
        <div className="mt-5">
          <CollectionActions collection={collection} />
        </div>
      </header>
      <div className="flex-1 space-y-5 overflow-y-auto p-5">
        {collection.description && (
          <p className="text-sm text-muted-foreground">
            {collection.description}
          </p>
        )}
        <section>
          <h3 className="mb-3 text-xs font-medium tracking-wider text-muted-foreground uppercase">
            Shares in this collection
          </h3>
          <ShareList shares={shares} basePath="/shares" />
        </section>
      </div>
    </aside>
  )
}
