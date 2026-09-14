/** Collection icon identifiers shared by the API schemas and the icon picker. */
export const COLLECTION_ICONS = [
  "folder",
  "code",
  "briefcase",
  "book",
  "palette",
  "rocket",
  "heart",
  "star",
] as const

export type CollectionIconName = (typeof COLLECTION_ICONS)[number]
