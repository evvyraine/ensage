import { RiArchiveLine, RiUploadCloud2Line, RiKey2Line, RiPencilLine, RiRefreshLine, RiDeleteBinLine, RiArrowGoBackLine, RiCloseCircleLine } from "@remixicon/react"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent } from "@/components/ui/card"
import { formatDateTime } from "@/lib/format"

type AuditEvent = {
  id: string
  action: string
  resourceType: string
  resourceId: string | null
  createdAt: Date
}

const presentation: Record<
  string,
  { label: string; icon: typeof RiArchiveLine; destructive?: boolean }
> = {
  "share.created": { label: "Share created", icon: RiArchiveLine },
  "share.uploaded": { label: "File uploaded", icon: RiUploadCloud2Line },
  "share.updated": { label: "Share updated", icon: RiPencilLine },
  "share.updated_and_link_rotated": {
    label: "Share updated and link rotated",
    icon: RiRefreshLine,
  },
  "share.trashed": { label: "Share moved to trash", icon: RiDeleteBinLine, destructive: true },
  "share.restored": { label: "Share restored", icon: RiArrowGoBackLine },
  "share.deleted": { label: "Share deleted permanently", icon: RiCloseCircleLine, destructive: true },
  "share.purged": { label: "Share purged by cleanup", icon: RiCloseCircleLine, destructive: true },
  "collection.created": { label: "Collection created", icon: RiArchiveLine },
  "collection.updated": { label: "Collection updated", icon: RiPencilLine },
  "collection.deleted": { label: "Collection deleted", icon: RiDeleteBinLine, destructive: true },
  "api_key.created": { label: "API key created", icon: RiKey2Line },
  "api_key.revoked": { label: "API key revoked", icon: RiCloseCircleLine, destructive: true },
}

export function ActivityList({ events }: { events: AuditEvent[] }) {
  if (!events.length)
    return (
      <div className="rounded-2xl border border-dashed py-20 text-center">
        <RiArchiveLine className="mx-auto mb-4 size-8 text-muted-foreground" />
        <h3 className="font-medium">No activity yet</h3>
        <p className="mt-1 text-sm text-muted-foreground">
          Creating, editing, and deleting shares will show up here.
        </p>
      </div>
    )
  return (
    <Card>
      <CardContent className="divide-y p-0">
        {events.map((event) => {
          const view = presentation[event.action] ?? {
            label: event.action,
            icon: RiArchiveLine,
          }
          const Icon = view.icon
          return (
            <div key={event.id} className="flex items-center gap-4 px-5 py-4">
              <div
                className={`grid size-10 shrink-0 place-items-center rounded-xl ${
                  view.destructive
                    ? "bg-destructive/10 text-destructive"
                    : "bg-muted"
                }`}
              >
                <Icon className="size-4" />
              </div>
              <div className="min-w-0 flex-1">
                <p className="text-sm font-medium">{view.label}</p>
                <p className="mt-1 text-xs text-muted-foreground">
                  {event.resourceType}
                  {event.resourceId ? ` · ${event.resourceId}` : ""}
                </p>
              </div>
              <Badge variant="secondary">
                {formatDateTime(event.createdAt)}
              </Badge>
            </div>
          )
        })}
      </CardContent>
    </Card>
  )
}
