import { cn } from "@/lib/utils"
import type { ShareSummary } from "@/lib/types"
import { Reveal } from "./reveal"
import { ShareDetail } from "./share-detail"
import { ShareListInteractive } from "./share-list-interactive"

// Master–detail workspace: the list stays full width until a share is chosen,
// then the content panel slides in beside it. Below `lg` the two panes swap.
export function SharesView({
  shares,
  selected,
  collections = [],
  basePath = "/shares",
  query = {},
  trash = false,
}: {
  shares: ShareSummary[]
  selected?: ShareSummary | null
  collections?: { id: string; name: string }[]
  basePath?: string
  query?: Record<string, string | undefined>
  trash?: boolean
}) {
  return (
    <div
      className={cn(
        selected &&
          "lg:grid lg:grid-cols-[minmax(0,1fr)_minmax(0,1.1fr)] lg:items-start lg:gap-6"
      )}
    >
      <div className={cn(selected && "hidden lg:block")}>
        <ShareListInteractive
          shares={shares}
          selectedId={selected?.id}
          collections={collections}
          basePath={basePath}
          query={query}
          trash={trash}
        />
      </div>
      {selected && (
        <Reveal className="lg:sticky lg:top-20">
          <ShareDetail
            share={selected}
            collections={collections}
            basePath={basePath}
            query={query}
          />
        </Reveal>
      )}
    </div>
  )
}
