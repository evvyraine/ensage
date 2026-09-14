"use client"
import { useState } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import {
  RiApps2Line,
  RiArchiveLine,
  RiArrowGoBackLine,
  RiAttachment2,
  RiCheckboxMultipleLine,
  RiCloseLine,
  RiDeleteBinLine,
  RiFileTextLine,
  RiLink,
  RiLockLine,
  RiMoreFill,
} from "@remixicon/react"
import { toast } from "sonner"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSub,
  DropdownMenuSubContent,
  DropdownMenuSubTrigger,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { cn } from "@/lib/utils"
import { formatDate } from "@/lib/format"
import type { ShareSummary } from "@/lib/types"
import { CheckIndicator } from "./check"

const kindIcon = {
  text: RiFileTextLine,
  file: RiAttachment2,
  link: RiLink,
} as const

function hrefFor(
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

export function ShareListInteractive({
  shares: rows,
  selectedId,
  collections,
  basePath = "/shares",
  query = {},
  trash = false,
}: {
  shares: ShareSummary[]
  selectedId?: string
  collections: { id: string; name: string }[]
  basePath?: string
  query?: Record<string, string | undefined>
  trash?: boolean
}) {
  const router = useRouter()
  const [selectMode, setSelectMode] = useState(false)
  const [selected, setSelected] = useState<Set<string>>(new Set())
  const [busy, setBusy] = useState(false)

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

  async function bulk(action: "trash" | "restore" | "delete") {
    const ids = [...selected]
    if (!ids.length) return
    setBusy(true)
    const results = await Promise.all(
      ids.map((id) =>
        fetch(`/api/v1/shares/${id}`, {
          method: action === "delete" ? "DELETE" : "PATCH",
          headers: { "content-type": "application/json" },
          body:
            action === "delete" ? undefined : JSON.stringify({ action }),
        })
      )
    )
    setBusy(false)
    if (results.some((result) => !result.ok)) {
      toast.error("Some shares could not be updated")
      return
    }
    toast.success(
      action === "trash"
        ? `Moved ${ids.length} to trash`
        : action === "restore"
          ? `Restored ${ids.length}`
          : `Deleted ${ids.length}`
    )
    exit()
    router.refresh()
  }

  async function bulkUpdate(
    patch: { visibility?: string; collectionId?: string | null },
    message: string
  ) {
    const ids = [...selected]
    if (!ids.length) return
    setBusy(true)
    const results = await Promise.all(
      ids.map((id) =>
        fetch(`/api/v1/shares/${id}`, {
          method: "PATCH",
          headers: { "content-type": "application/json" },
          body: JSON.stringify({ action: "update", ...patch }),
        })
      )
    )
    setBusy(false)
    if (results.some((result) => !result.ok)) {
      toast.error("Some shares could not be updated")
      return
    }
    toast.success(message)
    exit()
    router.refresh()
  }

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

  const count = selected.size

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <span className="text-xs text-muted-foreground">
          {rows.length} shown
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
        {rows.map((share, index) => {
          const Icon = kindIcon[share.kind]
          const isSelected = selected.has(share.id)
          const body = (
            <>
              {selectMode ? (
                <CheckIndicator checked={isSelected} />
              ) : (
                <span
                  className={cn(
                    "grid size-10 shrink-0 place-items-center rounded-xl",
                    share.id === selectedId
                      ? "bg-primary/15 text-primary"
                      : "bg-muted text-foreground/70"
                  )}
                >
                  <Icon className="size-4" />
                </span>
              )}
              <span className="min-w-0 flex-1">
                <span className="block truncate text-sm font-medium">
                  {share.title || share.originalName || "Untitled share"}
                </span>
                <span className="mt-0.5 block truncate text-xs text-muted-foreground">
                  {formatDate(share.createdAt)} ·{" "}
                  {share.viewCount} view{share.viewCount === 1 ? "" : "s"}
                </span>
              </span>
              {share.hasPassword && (
                <RiLockLine className="size-3.5 shrink-0 text-muted-foreground" />
              )}
              <Badge variant="secondary" className="shrink-0">
                {share.kind}
              </Badge>
            </>
          )
          const className = cn(
            "flex w-full items-center gap-3 px-4 py-3.5 text-left transition-colors outline-none",
            "focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-inset",
            isSelected || share.id === selectedId
              ? "bg-accent"
              : "hover:bg-accent/50"
          )
          return (
            <li
              key={share.id}
              style={{
                borderTop: index > 0 ? "1px solid var(--border)" : undefined,
              }}
            >
              {selectMode ? (
                <button
                  type="button"
                  aria-pressed={isSelected}
                  onClick={() => toggle(share.id)}
                  className={className}
                >
                  {body}
                </button>
              ) : (
                <Link
                  href={hrefFor(basePath, query, share.id)}
                  aria-current={share.id === selectedId ? "true" : undefined}
                  className={className}
                >
                  {body}
                </Link>
              )}
            </li>
          )
        })}
      </ul>

      {selectMode && count > 0 && (
        <div className="animate-panel-in sticky bottom-24 z-20 flex flex-wrap items-center gap-2 rounded-2xl border bg-popover/95 p-2 shadow-xl backdrop-blur lg:bottom-6">
          <span className="px-2 text-sm font-medium">{count} selected</span>
          <Button
            size="sm"
            variant="outline"
            onClick={() => bulk(trash ? "restore" : "trash")}
            disabled={busy}
          >
            {trash ? <RiArrowGoBackLine /> : <RiArchiveLine />}
            {trash ? "Restore" : "Trash"}
          </Button>
          <DropdownMenu>
            <DropdownMenuTrigger
              render={
                <Button
                  size="sm"
                  variant="outline"
                  disabled={busy}
                  aria-label="More bulk actions"
                />
              }
            >
              <RiMoreFill />
            </DropdownMenuTrigger>
            <DropdownMenuContent align="start" className="w-52">
              <DropdownMenuSub>
                <DropdownMenuSubTrigger>
                  <RiLockLine />
                  Set visibility
                </DropdownMenuSubTrigger>
                <DropdownMenuSubContent>
                  <DropdownMenuItem
                    onClick={() =>
                      bulkUpdate(
                        { visibility: "private" },
                        "Visibility set to private"
                      )
                    }
                  >
                    Private
                  </DropdownMenuItem>
                  <DropdownMenuItem
                    onClick={() =>
                      bulkUpdate(
                        { visibility: "unlisted" },
                        "Visibility set to link"
                      )
                    }
                  >
                    Anyone with link
                  </DropdownMenuItem>
                  <DropdownMenuItem
                    onClick={() =>
                      bulkUpdate(
                        { visibility: "public" },
                        "Visibility set to public"
                      )
                    }
                  >
                    Public
                  </DropdownMenuItem>
                </DropdownMenuSubContent>
              </DropdownMenuSub>
              {!trash && (
                <DropdownMenuSub>
                  <DropdownMenuSubTrigger>
                    <RiApps2Line />
                    Add to collection
                  </DropdownMenuSubTrigger>
                  <DropdownMenuSubContent>
                    {collections.map((collection) => (
                      <DropdownMenuItem
                        key={collection.id}
                        onClick={() =>
                          bulkUpdate(
                            { collectionId: collection.id },
                            `Added to ${collection.name}`
                          )
                        }
                      >
                        {collection.name}
                      </DropdownMenuItem>
                    ))}
                    <DropdownMenuItem
                      onClick={() =>
                        bulkUpdate(
                          { collectionId: null },
                          "Removed from collection"
                        )
                      }
                    >
                      Remove from collection
                    </DropdownMenuItem>
                  </DropdownMenuSubContent>
                </DropdownMenuSub>
              )}
            </DropdownMenuContent>
          </DropdownMenu>
          <Button
            size="sm"
            variant="destructive"
            onClick={() => bulk("delete")}
            disabled={busy}
          >
            <RiDeleteBinLine />
            Delete
          </Button>
          <Button
            size="sm"
            variant="ghost"
            className="ml-auto"
            onClick={exit}
          >
            <RiCloseLine />
            Clear
          </Button>
        </div>
      )}
    </div>
  )
}
