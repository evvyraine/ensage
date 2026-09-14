import { PageHeading } from "@/components/app/page-heading"
import { SharesView } from "@/components/app/shares-view"
import {
  ownerCollections,
  ownerShareSummary,
  ownerShares,
} from "@/lib/server/queries"
import { cn } from "@/lib/utils"
export const dynamic = "force-dynamic"
export default async function Recent({
  searchParams,
}: {
  searchParams: Promise<{ share?: string }>
}) {
  const { share } = await searchParams
  const { shares: rows } = await ownerShares({ recent: true })
  const collections = (await ownerCollections()).map((collection) => ({
    id: collection.id,
    name: collection.name,
  }))
  const selected = share ? await ownerShareSummary(share) : null
  return (
    <>
      <div className={cn(selected && "hidden lg:block")}>
        <PageHeading
          title="Recently viewed"
          description="Quickly return to shares you opened recently."
        />
      </div>
      <SharesView
        shares={rows}
        selected={selected}
        collections={collections}
        basePath="/recent"
      />
    </>
  )
}
