import { describe, expect, it } from "vitest"
import {
  createCollectionInput,
  updateCollectionInput,
} from "../lib/validation/collection"

describe("collection request validation", () => {
  it("accepts a null description when creating", () => {
    const value = createCollectionInput.parse({
      name: "Docs",
      description: null,
    })
    expect(value.description).toBeNull()
  })

  it("applies create defaults", () => {
    const value = createCollectionInput.parse({ name: "Docs" })
    expect(value.description).toBeUndefined()
    expect(value.icon).toBe("folder")
    expect(value.visibility).toBe("private")
  })

  it("requires a non-empty name", () => {
    expect(() => createCollectionInput.parse({ name: "   " })).toThrow()
  })

  it("rejects unknown icons", () => {
    expect(() =>
      createCollectionInput.parse({ name: "Docs", icon: "skull" })
    ).toThrow()
  })

  it("accepts a null description when updating", () => {
    expect(
      updateCollectionInput.parse({ description: null }).description
    ).toBeNull()
  })

  it("allows clearing the description on update", () => {
    const value = updateCollectionInput.parse({
      description: null,
      icon: "rocket",
    })
    expect(value).toMatchObject({ description: null, icon: "rocket" })
  })
})
