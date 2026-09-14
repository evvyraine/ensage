import { describe, expect, it } from "vitest"
import {
  createShareAccessToken,
  shareAccessCookieName,
  verifyShareAccessToken,
} from "@/lib/server/share-access"

const shareId = "11111111-1111-1111-1111-111111111111"
const otherId = "22222222-2222-2222-2222-222222222222"

describe("share access tokens", () => {
  it("accepts a freshly created token", () => {
    expect(verifyShareAccessToken(shareId, createShareAccessToken(shareId, 60))).toBe(true)
  })
  it("rejects a token scoped to a different share", () => {
    expect(
      verifyShareAccessToken(otherId, createShareAccessToken(shareId, 60))
    ).toBe(false)
  })
  it("rejects a tampered signature", () => {
    const token = createShareAccessToken(shareId, 60)
    expect(verifyShareAccessToken(shareId, `${token}x`)).toBe(false)
  })
  it("rejects an expired token", () => {
    expect(verifyShareAccessToken(shareId, createShareAccessToken(shareId, -1))).toBe(false)
  })
  it("rejects a missing token", () => {
    expect(verifyShareAccessToken(shareId, undefined)).toBe(false)
  })
  it("names the cookie after the share", () => {
    expect(shareAccessCookieName(shareId)).toBe(`ensage_share_${shareId}`)
  })
})
