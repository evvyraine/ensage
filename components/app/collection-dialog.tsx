"use client"
import { useState } from "react"
import { useRouter } from "next/navigation"
import { RiAddLine, RiApps2Line, RiPencilLine } from "@remixicon/react"
import { toast } from "sonner"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { cn } from "@/lib/utils"
import type { CollectionSummary } from "@/lib/types"
import { CollectionIcon, collectionIconNames } from "./collection-icons"
import { VisibilityPills } from "./visibility-pills"

function IconPicker({ value = "folder" }: { value?: string }) {
  const [icon, setIcon] = useState(value)
  return (
    <div>
      <Label>Icon</Label>
      <div className="mt-2 grid grid-cols-8 gap-1 rounded-2xl border bg-muted/40 p-1.5">
        <input type="hidden" name="icon" value={icon} />
        {collectionIconNames.map((name) => {
          const active = icon === name
          return (
            <button
              key={name}
              type="button"
              aria-label={name}
              aria-pressed={active}
              onClick={() => setIcon(name)}
              className={cn(
                "pressable grid aspect-square place-items-center rounded-xl",
                active
                  ? "bg-background text-foreground shadow-sm ring-1 ring-foreground/5"
                  : "text-muted-foreground hover:text-foreground"
              )}
            >
              <CollectionIcon name={name} className="size-4" />
            </button>
          )
        })}
      </div>
    </div>
  )
}

export function CollectionDialog({
  collection,
  open,
  onOpenChange,
}: {
  collection?: CollectionSummary
  open: boolean
  onOpenChange: (open: boolean) => void
}) {
  const router = useRouter()
  const [busy, setBusy] = useState(false)
  const editing = Boolean(collection)

  async function save(form: FormData) {
    setBusy(true)
    const payload = {
      name: form.get("name"),
      description: (form.get("description") as string) || null,
      icon: form.get("icon"),
      ...(editing ? { visibility: form.get("visibility") } : {}),
    }
    const response = await fetch(
      editing ? `/api/v1/collections/${collection!.id}` : "/api/v1/collections",
      {
        method: editing ? "PATCH" : "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify(
          editing ? payload : { ...payload, visibility: "private" }
        ),
      }
    )
    setBusy(false)
    if (!response.ok) {
      toast.error(
        editing ? "Could not update collection" : "Could not create collection"
      )
      return
    }
    toast.success(editing ? "Collection updated" : "Collection created")
    onOpenChange(false)
    router.refresh()
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[90dvh] overflow-y-auto sm:max-w-lg">
        <DialogHeader>
          <div className="mb-1 grid size-10 place-items-center rounded-xl bg-primary/10 text-primary">
            {editing ? (
              <RiPencilLine className="size-5" />
            ) : (
              <RiApps2Line className="size-5" />
            )}
          </div>
          <DialogTitle>
            {editing ? "Edit collection" : "New collection"}
          </DialogTitle>
          <DialogDescription>
            {editing
              ? "Changing visibility revokes the existing collection link."
              : "Group shares into a customizable space."}
          </DialogDescription>
        </DialogHeader>
        <form action={save} className="space-y-5">
          <div>
            <Label>Name</Label>
            <Input
              name="name"
              required
              maxLength={100}
              defaultValue={collection?.name ?? ""}
              className="mt-2"
            />
          </div>
          <div>
            <Label>Description</Label>
            <Input
              name="description"
              maxLength={500}
              defaultValue={collection?.description ?? ""}
              className="mt-2"
            />
          </div>
          <IconPicker value={collection?.icon} />
          {editing && (
            <div className="space-y-2">
              <Label>Visibility</Label>
              <VisibilityPills
                name="visibility"
                defaultValue={collection!.visibility}
              />
            </div>
          )}
          <div className="flex justify-end gap-2">
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={busy}>
              {busy
                ? "Saving…"
                : editing
                  ? "Save collection"
                  : "Create collection"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}

export function NewCollectionButton() {
  const [open, setOpen] = useState(false)
  return (
    <>
      <Button onClick={() => setOpen(true)}>
        <RiAddLine />
        New collection
      </Button>
      <CollectionDialog open={open} onOpenChange={setOpen} />
    </>
  )
}
