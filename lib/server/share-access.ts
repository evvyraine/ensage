import "server-only"
import { createHash, createHmac, timingSafeEqual } from "node:crypto"

// Grants access to a single password-protected share without storing any
// viewer state on the server. The token is an HMAC over the share id and an
// expiry timestamp, signed with a key derived from infrastructure secrets that
// are already required to run ensage.
const signingKey = createHash("sha256")
  .update(
    `ensage:share-access:${process.env.CLERK_SECRET_KEY ?? process.env.DATABASE_URL ?? "development"}`
  )
  .digest()

export const SHARE_ACCESS_MAX_AGE_SECONDS = 12 * 60 * 60

export function shareAccessCookieName(shareId: string) {
  return `ensage_share_${shareId}`
}

export function createShareAccessToken(shareId: string, ttlSeconds: number) {
  const expiresAt = Date.now() + ttlSeconds * 1000
  const signature = createHmac("sha256", signingKey)
    .update(`${shareId}:${expiresAt}`)
    .digest("base64url")
  return `${expiresAt}.${signature}`
}

export function verifyShareAccessToken(shareId: string, token?: string) {
  if (!token) return false
  const [rawExpiresAt, signature] = token.split(".")
  const expiresAt = Number(rawExpiresAt)
  if (!signature || !Number.isFinite(expiresAt) || expiresAt < Date.now())
    return false
  const expected = createHmac("sha256", signingKey)
    .update(`${shareId}:${expiresAt}`)
    .digest("base64url")
  const provided = Buffer.from(signature)
  const wanted = Buffer.from(expected)
  return (
    provided.length === wanted.length && timingSafeEqual(provided, wanted)
  )
}
