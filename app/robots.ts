import type { MetadataRoute } from "next"
import { siteConfig } from "@/lib/site"

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: "*",
        allow: ["/", "/help"],
        disallow: [
          "/api/",
          "/dashboard",
          "/shares",
          "/collections",
          "/recent",
          "/activity",
          "/trash",
          "/settings",
          "/account",
          "/new",
          "/sign-in",
          "/sign-up",
          "/s/",
          "/c/",
          "/offline",
        ],
      },
    ],
    sitemap: `${siteConfig.url}/sitemap.xml`,
    host: siteConfig.url,
  }
}
