import Link from "next/link"
import { RiArrowLeftSLine, RiArrowRightSLine } from "@remixicon/react"
import { Button } from "@/components/ui/button"

export function Pagination({
  page,
  pageSize,
  total,
  basePath,
  query = {},
}: {
  page: number
  pageSize: number
  total: number
  basePath: string
  query?: Record<string, string | undefined>
}) {
  const pages = Math.max(1, Math.ceil(total / pageSize))
  if (pages <= 1) return null
  const href = (target: number) => {
    const params = new URLSearchParams()
    for (const [key, value] of Object.entries(query))
      if (value) params.set(key, value)
    if (target > 1) params.set("page", String(target))
    const search = params.toString()
    return search ? `${basePath}?${search}` : basePath
  }
  return (
    <div className="mt-5 flex items-center justify-between">
      <p className="text-sm text-muted-foreground">
        Page {page} of {pages} · {total} total
      </p>
      <div className="flex gap-2">
        <Button variant="outline" size="sm" disabled={page <= 1} asChild={page > 1}>
          {page > 1 ? (
            <Link href={href(page - 1)}>
              <RiArrowLeftSLine />
              Previous
            </Link>
          ) : (
            <span>
              <RiArrowLeftSLine />
              Previous
            </span>
          )}
        </Button>
        <Button
          variant="outline"
          size="sm"
          disabled={page >= pages}
          asChild={page < pages}
        >
          {page < pages ? (
            <Link href={href(page + 1)}>
              Next
              <RiArrowRightSLine />
            </Link>
          ) : (
            <span>
              Next
              <RiArrowRightSLine />
            </span>
          )}
        </Button>
      </div>
    </div>
  )
}
