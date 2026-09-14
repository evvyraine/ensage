import { z } from "zod"
import { COLLECTION_ICONS } from "@/lib/collections"

const visibility = z.enum(["private", "unlisted", "public"])
const icon = z.enum(COLLECTION_ICONS)

// `description` is nullable as well as optional: the client sends `null` when
// the field is cleared, so both create and update must accept it.
export const createCollectionInput = z.object({
  name: z.string().trim().min(1).max(100),
  description: z.string().trim().max(500).nullable().optional(),
  visibility: visibility.default("private"),
  icon: icon.default("folder"),
})

export const updateCollectionInput = z.object({
  name: z.string().trim().min(1).max(100).optional(),
  description: z.string().trim().max(500).nullable().optional(),
  icon: icon.optional(),
  visibility: visibility.optional(),
  rotateLink: z.boolean().optional(),
})
