import {
  RiApps2Line,
  RiBookOpenLine,
  RiBriefcaseLine,
  RiCodeLine,
  RiFolderLine,
  RiHeartLine,
  RiPaletteLine,
  RiRocketLine,
  RiStarLine,
} from "@remixicon/react"
import type { ComponentType } from "react"
import { COLLECTION_ICONS, type CollectionIconName } from "@/lib/collections"

const collectionIcons: Record<
  CollectionIconName,
  ComponentType<{ className?: string }>
> = {
  folder: RiFolderLine,
  code: RiCodeLine,
  briefcase: RiBriefcaseLine,
  book: RiBookOpenLine,
  palette: RiPaletteLine,
  rocket: RiRocketLine,
  heart: RiHeartLine,
  star: RiStarLine,
}

export const collectionIconNames = COLLECTION_ICONS

export function CollectionIcon({
  name,
  className,
}: {
  name: string
  className?: string
}) {
  const Icon =
    collectionIcons[name as CollectionIconName] ?? RiApps2Line
  return <Icon className={className} />
}
