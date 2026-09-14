"use client"
import { useState } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { RiFileCopyLine, RiDownload2Line, RiExternalLinkLine, RiLockLine, RiMoreFill, RiPencilLine, RiRefreshLine, RiDeleteBinLine, RiArrowGoBackLine } from "@remixicon/react"
import { toast } from "sonner"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import type { ShareSummary } from "@/lib/types"
import { ShareEditDialog } from "./share-edit-dialog"

export function ShareActions({
  share,
  collections = [],
}: {
  share: ShareSummary
  collections?: { id: string; name: string }[]
}) {
  const router = useRouter()
  const [editing, setEditing] = useState(false)
  const [busy, setBusy] = useState(false)

  async function mutate(action: "trash" | "restore" | "delete" | "rotate") {
    setBusy(true)
    const response = await fetch(`/api/v1/shares/${share.id}`, {
      method: action === "delete" ? "DELETE" : "PATCH",
      headers: { "content-type": "application/json" },
      body:
        action === "delete"
          ? undefined
          : JSON.stringify(
              action === "rotate"
                ? { action: "update", rotateLink: true }
                : { action }
            ),
    })
    setBusy(false)
    if (!response.ok) {
      toast.error("Action failed")
      return
    }
    toast.success(
      action === "rotate"
        ? "Public link revoked and regenerated"
        : action === "trash"
          ? "Moved to trash"
          : action === "restore"
            ? "Share restored"
            : "Share deleted"
    )
    router.refresh()
  }

  const contentHref = `/api/v1/shares/${share.id}/content`
  const primary =
    share.kind === "file" ? (
      <Button asChild>
        <a href={contentHref}>
          <RiDownload2Line />
          Download
        </a>
      </Button>
    ) : share.kind === "link" ? (
      <Button asChild>
        <a href={share.targetUrl ?? "#"} target="_blank" rel="noopener noreferrer">
          <RiExternalLinkLine />
          Open destination
        </a>
      </Button>
    ) : (
      <Button asChild>
        <Link href={`/s/${share.slug}`} target="_blank">
          <RiExternalLinkLine />
          Open public page
        </Link>
      </Button>
    )

  return (
    <div className="flex items-center gap-2">
      {primary}
      <DropdownMenu>
        <DropdownMenuTrigger
          render={
            <Button
              type="button"
              variant="outline"
              size="icon"
              aria-label="Share options"
              disabled={busy}
            />
          }
        >
          <RiMoreFill />
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-52">
          <DropdownMenuItem onClick={() => setEditing(true)}>
            <RiPencilLine />
            Edit share
          </DropdownMenuItem>
          <DropdownMenuItem
            onClick={() =>
              navigator.clipboard
                .writeText(`${location.origin}/s/${share.slug}`)
                .then(() => toast.success("Link copied"))
            }
          >
            <RiFileCopyLine />
            Copy public link
          </DropdownMenuItem>
          <DropdownMenuItem onClick={() => mutate("rotate")}>
            <RiRefreshLine />
            Generate new link
          </DropdownMenuItem>
          {share.hasPassword && (
            <DropdownMenuItem
              onClick={async () => {
                const response = await fetch(`/api/v1/shares/${share.id}`, {
                  method: "PATCH",
                  headers: { "content-type": "application/json" },
                  body: JSON.stringify({ action: "update", password: null }),
                })
                if (!response.ok) {
                  toast.error("Could not remove password")
                  return
                }
                toast.success("Password removed")
                router.refresh()
              }}
            >
              <RiLockLine />
              Remove password
            </DropdownMenuItem>
          )}
          <DropdownMenuSeparator />
          {share.state === "trashed" ? (
            <>
              <DropdownMenuItem onClick={() => mutate("restore")}>
                <RiArrowGoBackLine />
                Restore
              </DropdownMenuItem>
              <DropdownMenuItem
                variant="destructive"
                onClick={() => mutate("delete")}
              >
                <RiDeleteBinLine />
                Delete permanently
              </DropdownMenuItem>
            </>
          ) : (
            <DropdownMenuItem
              variant="destructive"
              onClick={() => mutate("trash")}
            >
              <RiDeleteBinLine />
              Move to trash
            </DropdownMenuItem>
          )}
        </DropdownMenuContent>
      </DropdownMenu>
      <ShareEditDialog
        share={share}
        collections={collections}
        open={editing}
        onOpenChange={setEditing}
      />
    </div>
  )
}
