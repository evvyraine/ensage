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

const collectionIcons = {
  folder: RiFolderLine,
  code: RiCodeLine,
  briefcase: RiBriefcaseLine,
  book: RiBookOpenLine,
  palette: RiPaletteLine,
  rocket: RiRocketLine,
  heart: RiHeartLine,
  star: RiStarLine,
} as const

export const collectionIconNames = Object.keys(collectionIcons) as Array<
  keyof typeof collectionIcons
>

export function CollectionIcon({
  name,
  className,
}: {
  name: string
  className?: string
}) {
  const Icon = collectionIcons[name as keyof typeof collectionIcons] ?? RiApps2Line
  return <Icon className={className} />
}
