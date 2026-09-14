"use client"
import { useState } from "react"
import { useRouter } from "next/navigation"
import { RiFileCopyLine, RiMoreFill, RiPencilLine, RiRefreshLine, RiDeleteBinLine } from "@remixicon/react"
import { toast } from "sonner"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import type { CollectionSummary } from "@/lib/types"
import { CollectionDialog } from "./collection-dialog"

export function CollectionActions({
  collection,
}: {
  collection: CollectionSummary
}) {
  const router = useRouter()
  const [busy, setBusy] = useState(false)
  const [editing, setEditing] = useState(false)
  const [confirming, setConfirming] = useState(false)

  async function rotate() {
    setBusy(true)
    const response = await fetch(`/api/v1/collections/${collection.id}`, {
      method: "PATCH",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ rotateLink: true }),
    })
    setBusy(false)
    if (!response.ok) {
      toast.error("Could not regenerate the link")
      return
    }
    toast.success("Collection link regenerated")
    router.refresh()
  }

  async function remove() {
    setConfirming(false)
    setBusy(true)
    const response = await fetch(`/api/v1/collections/${collection.id}`, {
      method: "DELETE",
    })
    setBusy(false)
    if (!response.ok) {
      toast.error("Could not delete collection")
      return
    }
    toast.success("Collection deleted")
    router.push("/collections")
    router.refresh()
  }

  return (
    <div className="flex items-center gap-2">
      <Button
        variant="outline"
        onClick={() =>
          navigator.clipboard
            .writeText(`${location.origin}/c/${collection.slug}`)
            .then(() => toast.success("Collection link copied"))
        }
      >
        <RiFileCopyLine />
        Copy link
      </Button>
      <DropdownMenu>
        <DropdownMenuTrigger
          render={
            <Button
              type="button"
              variant="outline"
              size="icon"
              aria-label="Collection options"
              disabled={busy}
            />
          }
        >
          <RiMoreFill />
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-56">
          <DropdownMenuItem onClick={() => setEditing(true)}>
            <RiPencilLine />
            Edit collection
          </DropdownMenuItem>
          <DropdownMenuItem onClick={rotate}>
            <RiRefreshLine />
            Generate new link
          </DropdownMenuItem>
          <DropdownMenuSeparator />
          <DropdownMenuItem
            variant="destructive"
            onClick={() => setConfirming(true)}
          >
            <RiDeleteBinLine />
            Delete collection
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

      <CollectionDialog
        collection={collection}
        open={editing}
        onOpenChange={setEditing}
      />

      <AlertDialog open={confirming} onOpenChange={setConfirming}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete this collection?</AlertDialogTitle>
            <AlertDialogDescription>
              “{collection.name}” will be removed. Its shares are kept and stay
              in your workspace.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction variant="destructive" onClick={remove}>
              Delete collection
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}
