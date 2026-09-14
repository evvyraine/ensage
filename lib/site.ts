/**
 * Canonical site metadata shared by the Metadata API, the sitemap, robots.txt
 * and the web app manifest. Set `NEXT_PUBLIC_APP_URL` to the public origin; it
 * is inlined into client bundles, so it must not contain secrets.
 */
const configuredUrl = process.env.NEXT_PUBLIC_APP_URL?.trim()

export const siteUrl = (configuredUrl || "https://ensage.shftln.com").replace(
  /\/+$/,
  ""
)

export const siteConfig = {
  name: "ensage",
  title: "ensage — self-hosted sharing workspace",
  tagline: "Self-hosted sharing for text, files, and links.",
  description:
    "A secure, self-hosted workspace for sharing text, files, and links — with collections, search, expiration, access control, and a CLI that works wherever you do.",
  url: siteUrl,
  keywords: [
    "ensage",
    "file sharing",
    "text sharing",
    "link sharing",
    "self-hosted",
    "private sharing",
    "collections",
    "share expiration",
    "CLI",
  ],
}
