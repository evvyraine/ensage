"use client"
import { useState } from "react"
import { useRouter } from "next/navigation"
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import type { ShareSummary } from "@/lib/types"
import { VisibilityPills } from "./visibility-pills"

export function ShareEditDialog({
  share,
  collections,
  open,
  onOpenChange,
}: {
  share: ShareSummary
  collections: { id: string; name: string }[]
  open: boolean
  onOpenChange: (open: boolean) => void
}) {
  const router = useRouter()
  const [busy, setBusy] = useState(false)

  async function save(form: FormData) {
    setBusy(true)
    const password = String(form.get("password") ?? "")
    const response = await fetch(`/api/v1/shares/${share.id}`, {
      method: "PATCH",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({
        action: "update",
        title: form.get("title") || null,
        visibility: form.get("visibility"),
        collectionId:
          form.get("collectionId") === "none" ? null : form.get("collectionId"),
        ...(password ? { password } : {}),
        ...(share.kind === "text" ? { content: form.get("content") } : {}),
        ...(share.kind === "link" ? { targetUrl: form.get("targetUrl") } : {}),
      }),
    })
    setBusy(false)
    if (!response.ok) {
      toast.error(
        (await response.json().catch(() => ({}))).error ??
          "Could not update share"
      )
      return
    }
    toast.success("Share updated")
    onOpenChange(false)
    router.refresh()
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[90dvh] overflow-y-auto sm:max-w-xl">
        <DialogHeader>
          <DialogTitle>Edit share</DialogTitle>
          <DialogDescription>
            Update content, access, and organization. Changing visibility
            revokes the current public link.
          </DialogDescription>
        </DialogHeader>
        <form action={save} className="space-y-5">
          <div>
            <Label>Title</Label>
            <Input
              name="title"
              defaultValue={share.title ?? ""}
              className="mt-2"
            />
          </div>
          {share.kind === "text" && (
            <div>
              <Label>Content</Label>
              <Textarea
                name="content"
                defaultValue={share.content ?? ""}
                className="mt-2 min-h-48 font-mono"
                required
              />
            </div>
          )}
          {share.kind === "link" && (
            <div>
              <Label>Destination URL</Label>
              <Input
                name="targetUrl"
                type="url"
                defaultValue={share.targetUrl ?? ""}
                className="mt-2"
                required
              />
            </div>
          )}
          <div className="space-y-2">
            <Label>Visibility</Label>
            <VisibilityPills
              defaultValue={share.visibility}
              name="visibility"
            />
          </div>
          <div>
            <Label>Collection</Label>
            <Select
              name="collectionId"
              defaultValue={share.collectionId ?? "none"}
              items={[
                { value: "none", label: "No collection" },
                ...collections.map((collection) => ({
                  value: collection.id,
                  label: collection.name,
                })),
              ]}
            >
              <SelectTrigger className="mt-2 w-full">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="none">No collection</SelectItem>
                {collections.map((collection) => (
                  <SelectItem value={collection.id} key={collection.id}>
                    {collection.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div>
            <Label>
              Viewer password{" "}
              <span className="text-muted-foreground">min 8 characters</span>
            </Label>
            <Input
              name="password"
              type="password"
              minLength={8}
              className="mt-2"
              placeholder={share.hasPassword ? "Set a new password" : "Optional"}
            />
            <p className="mt-2 text-xs text-muted-foreground">
              {share.hasPassword
                ? "Leave blank to keep the current password."
                : "Viewers must enter this password to open the share."}
            </p>
          </div>
          <div className="flex justify-end gap-2">
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={busy}>
              {busy ? "Saving…" : "Save changes"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}
