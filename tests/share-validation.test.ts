import { describe, expect, it } from "vitest"
import { createShareInput } from "../lib/validation/share"

describe("share request validation", () => {
  it("preserves meaningful text whitespace", () => {
    const value = createShareInput.parse({
      share: { kind: "text", content: "  code\n" },
    })
    expect(value.share.kind === "text" && value.share.content).toBe("  code\n")
  })
  it("rejects unsafe link protocols", () => {
    expect(() =>
      createShareInput.parse({
        share: { kind: "link", url: "file:///etc/passwd" },
      })
    ).toThrow()
  })
  it("rejects unknown expiration values", () => {
    expect(() =>
      createShareInput.parse({
        share: { kind: "text", content: "x" },
        expiresInHours: 0,
      })
    ).toThrow()
  })
  it("requires viewer passwords to be at least 8 characters", () => {
    expect(() =>
      createShareInput.parse({
        share: { kind: "text", content: "x" },
        password: "short",
      })
    ).toThrow()
    expect(
      createShareInput.parse({
        share: { kind: "text", content: "x" },
        password: "longenough",
      }).password
    ).toBe("longenough")
  })
  it("rejects a non-uuid collection id", () => {
    expect(() =>
      createShareInput.parse({
        share: { kind: "text", content: "x" },
        collectionId: "not-a-uuid",
      })
    ).toThrow()
  })
})
