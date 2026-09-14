"use client"
import { useState } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import {
  RiApps2Line,
  RiCheckboxMultipleLine,
  RiCloseLine,
  RiDeleteBinLine,
} from "@remixicon/react"
import { toast } from "sonner"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"
import type { CollectionSummary } from "@/lib/types"
import { CheckIndicator } from "./check"
import { CollectionIcon } from "./collection-icons"

export function CollectionListInteractive({
  collections,
  selectedId,
}: {
  collections: CollectionSummary[]
  selectedId?: string
}) {
  const router = useRouter()
  const [selectMode, setSelectMode] = useState(false)
  const [selected, setSelected] = useState<Set<string>>(new Set())
  const [busy, setBusy] = useState(false)

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

  function toggle(id: string) {
    setSelected((current) => {
      const next = new Set(current)
      if (next.has(id)) next.delete(id)
      else next.add(id)
      return next
    })
  }
  function exit() {
    setSelectMode(false)
    setSelected(new Set())
  }
  async function bulkDelete() {
    const ids = [...selected]
    if (!ids.length) return
    setBusy(true)
    const results = await Promise.all(
      ids.map((id) =>
        fetch(`/api/v1/collections/${id}`, { method: "DELETE" })
      )
    )
    setBusy(false)
    if (results.some((result) => !result.ok)) {
      toast.error("Some collections could not be deleted")
      return
    }
    toast.success(`Deleted ${ids.length} collection${ids.length === 1 ? "" : "s"}`)
    exit()
    router.refresh()
  }

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <span className="text-xs text-muted-foreground">
          {collections.length} shown
        </span>
        <Button
          variant={selectMode ? "secondary" : "outline"}
          size="sm"
          onClick={() => (selectMode ? exit() : setSelectMode(true))}
        >
          <RiCheckboxMultipleLine />
          {selectMode ? "Done" : "Select"}
        </Button>
      </div>
      <ul className="overflow-hidden rounded-2xl border bg-card">
        {collections.map((collection, index) => {
          const isSelected = selected.has(collection.id)
          const body = (
            <>
              {selectMode ? (
                <CheckIndicator checked={isSelected} />
              ) : (
                <span
                  className={cn(
                    "grid size-10 shrink-0 place-items-center rounded-xl",
                    collection.id === selectedId
                      ? "bg-primary/15 text-primary"
                      : "bg-muted text-foreground/70"
                  )}
                >
                  <CollectionIcon name={collection.icon} className="size-4" />
                </span>
              )}
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
            </>
          )
          const className = cn(
            "flex w-full items-center gap-3 px-4 py-3.5 text-left transition-colors outline-none",
            "focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-inset",
            isSelected || collection.id === selectedId
              ? "bg-accent"
              : "hover:bg-accent/50"
          )
          return (
            <li
              key={collection.id}
              style={{
                borderTop: index > 0 ? "1px solid var(--border)" : undefined,
              }}
            >
              {selectMode ? (
                <button
                  type="button"
                  aria-pressed={isSelected}
                  onClick={() => toggle(collection.id)}
                  className={className}
                >
                  {body}
                </button>
              ) : (
                <Link
                  href={`/collections?collection=${collection.id}`}
                  aria-current={
                    collection.id === selectedId ? "true" : undefined
                  }
                  className={className}
                >
                  {body}
                </Link>
              )}
            </li>
          )
        })}
      </ul>
      {selectMode && selected.size > 0 && (
        <div className="animate-panel-in sticky bottom-24 z-20 flex flex-wrap items-center gap-2 rounded-2xl border bg-popover/95 p-2 shadow-xl backdrop-blur lg:bottom-6">
          <span className="px-2 text-sm font-medium">
            {selected.size} selected
          </span>
          <Button
            size="sm"
            variant="destructive"
            onClick={bulkDelete}
            disabled={busy}
          >
            <RiDeleteBinLine />
            Delete
          </Button>
          <Button size="sm" variant="ghost" className="ml-auto" onClick={exit}>
            <RiCloseLine />
            Clear
          </Button>
        </div>
      )}
    </div>
  )
}
