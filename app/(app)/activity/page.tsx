import { PageHeading } from "@/components/app/page-heading"
import { ActivityList } from "@/components/app/activity-list"
import { Pagination } from "@/components/app/pagination"
import { PAGE_SIZE, ownerAuditEvents } from "@/lib/server/queries"
export const dynamic = "force-dynamic"
export default async function Activity({
  searchParams,
}: {
  searchParams: Promise<{ page?: string }>
}) {
  const { page } = await searchParams
  const current = Math.max(Number(page) || 1, 1)
  const { events, total } = await ownerAuditEvents({ page: current })
  return (
    <>
      <PageHeading
        title="Activity"
        description="Audit trail of everything that happened in your workspace."
      />
      <ActivityList events={events} />
      <Pagination
        page={current}
        pageSize={PAGE_SIZE}
        total={total}
        basePath="/activity"
      />
    </>
  )
}
