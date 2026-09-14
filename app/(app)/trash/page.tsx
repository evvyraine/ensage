import { PageHeading } from "@/components/app/page-heading"
import { Pagination } from "@/components/app/pagination"
import { SharesView } from "@/components/app/shares-view"
import {
  PAGE_SIZE,
  ownerCollections,
  ownerShareSummary,
  ownerShares,
} from "@/lib/server/queries"
import { cn } from "@/lib/utils"
export const dynamic = "force-dynamic"
export default async function Trash({
  searchParams,
}: {
  searchParams: Promise<{ page?: string; share?: string }>
}) {
  const { page, share } = await searchParams
  const current = Math.max(Number(page) || 1, 1)
  const { shares: rows, total } = await ownerShares({
    state: "trashed",
    page: current,
  })
  const collections = (await ownerCollections()).map((collection) => ({
    id: collection.id,
    name: collection.name,
  }))
  const selected = share ? await ownerShareSummary(share) : null
  return (
    <>
      <div className={cn(selected && "hidden lg:block")}>
        <PageHeading
          title="Trash"
          description="Deleted shares are retained for 30 days before permanent removal."
        />
      </div>
      <SharesView
        shares={rows}
        selected={selected}
        collections={collections}
        basePath="/trash"
        trash
      />
      <Pagination
        page={current}
        pageSize={PAGE_SIZE}
        total={total}
        basePath="/trash"
      />
    </>
  )
}
