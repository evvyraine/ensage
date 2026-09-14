import { PageHeading } from "@/components/app/page-heading"
import { CollectionDetail } from "@/components/app/collection-detail"
import { NewCollectionButton } from "@/components/app/collection-dialog"
import { CollectionListInteractive } from "@/components/app/collection-list-interactive"
import { Reveal } from "@/components/app/reveal"
import { ownerCollectionDetail, ownerCollections } from "@/lib/server/queries"
import { cn } from "@/lib/utils"
export const dynamic = "force-dynamic"
export default async function Collections({
  searchParams,
}: {
  searchParams: Promise<{ collection?: string }>
}) {
  const { collection } = await searchParams
  const rows = await ownerCollections()
  const selected = collection ? await ownerCollectionDetail(collection) : null
  return (
    <>
      <div className={cn(selected && "hidden lg:block")}>
        <PageHeading
          title="Collections"
          description="Group related shares and optionally publish the whole set."
          action={<NewCollectionButton />}
        />
      </div>
      <div
        className={cn(
          selected &&
            "lg:grid lg:grid-cols-[minmax(0,1fr)_minmax(0,1.1fr)] lg:items-start lg:gap-6"
        )}
      >
        <div className={cn(selected && "hidden lg:block")}>
          <CollectionListInteractive
            collections={rows}
            selectedId={selected?.collection.id}
          />
        </div>
        {selected && (
          <Reveal className="lg:sticky lg:top-20">
            <CollectionDetail
              collection={selected.collection}
              shares={selected.shares}
            />
          </Reveal>
        )}
      </div>
    </>
  )
}
