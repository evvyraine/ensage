import Link from "next/link"
import { RiArrowRightUpLine, RiApps2Line, RiEyeLine, RiFileTextLine } from "@remixicon/react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { PageHeading } from "@/components/app/page-heading"
import { ShareList } from "@/components/app/share-list"
import { workspaceData } from "@/lib/server/queries"
export const dynamic = "force-dynamic"
export default async function Dashboard() {
  const { stats, recent } = await workspaceData()
  return (
    <>
      <PageHeading
        title="Your workspace"
        description="Everything you’ve shared, at a glance."
      />
      <div className="grid grid-cols-3 gap-2 sm:gap-4">
        {(
          [
            [RiFileTextLine, stats.active, "Active shares"],
            [RiEyeLine, stats.views, "Total views"],
            [RiApps2Line, stats.collections, "Collections"],
          ] as const
        ).map(([Icon, value, label]) => (
          <Card key={String(label)} className="animate-panel-in">
            <CardContent className="p-3 sm:p-5">
              <Icon className="size-4 text-muted-foreground" />
              <div className="mt-3 text-xl font-semibold sm:mt-5 sm:text-2xl">
                {String(value)}
              </div>
              <div className="truncate text-[11px] text-muted-foreground sm:text-xs">
                {String(label)}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
      <div className="mt-8 mb-4 flex items-center justify-between sm:mt-10">
        <h2 className="font-heading text-lg font-semibold sm:text-xl">
          Recently created
        </h2>
        <Button variant="ghost" asChild>
          <Link href="/shares">
            View all <RiArrowRightUpLine />
          </Link>
        </Button>
      </div>
      <ShareList shares={recent} />
    </>
  )
}
