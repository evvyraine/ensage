import Link from "next/link"
import { RiApps2Line } from "@remixicon/react"
import { cn } from "@/lib/utils"
import type { CollectionSummary } from "@/lib/types"
import { CollectionIcon } from "./collection-icons"

export function CollectionList({
  collections,
  selectedId,
}: {
  collections: CollectionSummary[]
  selectedId?: string
}) {
  if (!collections.length)
    return (
      <div className="rounded-2xl border border-dashed px-6 py-16 text-center">
        <RiApps2Line className="mx-auto mb-4 size-8 text-muted-foreground" />
        <h3 className="font-medium">No collections yet</h3>
        <p className="mx-auto mt-1 max-w-xs text-sm text-muted-foreground">
          Create one to organize and share related items.
        </p>
      </div>
    )
  return (
    <ul className="overflow-hidden rounded-2xl border bg-card">
      {collections.map((collection, index) => {
        const selected = collection.id === selectedId
        return (
          <li key={collection.id}>
            <Link
              href={`/collections?collection=${collection.id}`}
              aria-current={selected ? "true" : undefined}
              className={cn(
                "flex items-center gap-3 px-4 py-3.5 transition-colors outline-none",
                "focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-inset",
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
                <CollectionIcon name={collection.icon} className="size-4" />
              </span>
              <span className="min-w-0 flex-1">
                <span className="block truncate text-sm font-medium">
                  {collection.name}
                </span>
                <span className="mt-0.5 block truncate text-xs text-muted-foreground">
                  {collection.description || "No description"}
                </span>
              </span>
              <span className="shrink-0 text-xs text-muted-foreground">
                {collection.shareCount} item
                {collection.shareCount === 1 ? "" : "s"}
              </span>
            </Link>
          </li>
        )
      })}
    </ul>
  )
}
