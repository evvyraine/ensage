import type { Metadata, Viewport } from "next"
import { ClerkProvider } from "@clerk/nextjs"
import { shadcn } from "@clerk/ui/themes"
import { Geist_Mono, Instrument_Sans, Lora } from "next/font/google"

import "./globals.css"
import "@clerk/ui/themes/shadcn.css"
import { siteConfig } from "@/lib/site"
import { ThemeProvider } from "@/components/theme-provider"
import { ServiceWorkerRegistrar } from "@/components/service-worker"
import { cn } from "@/lib/utils"
import { Toaster } from "@/components/ui/sonner"

const loraHeading = Lora({ subsets: ["latin"], variable: "--font-heading" })

const instrumentSans = Instrument_Sans({
  subsets: ["latin"],
  variable: "--font-sans",
})

const fontMono = Geist_Mono({
  subsets: ["latin"],
  variable: "--font-mono",
})

export const metadata: Metadata = {
  metadataBase: new URL(siteConfig.url),
  title: { default: siteConfig.title, template: "%s · ensage" },
  description: siteConfig.description,
  applicationName: siteConfig.name,
  generator: "Next.js",
  keywords: siteConfig.keywords,
  authors: [{ name: siteConfig.name, url: siteConfig.url }],
  creator: siteConfig.name,
  publisher: siteConfig.name,
  alternates: { canonical: "/" },
  openGraph: {
    type: "website",
    siteName: siteConfig.name,
    title: siteConfig.title,
    description: siteConfig.description,
    url: "/",
    locale: "en_US",
    images: [
      {
        url: "/og.png",
        width: 1200,
        height: 630,
        alt: `${siteConfig.name} — ${siteConfig.tagline}`,
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: siteConfig.title,
    description: siteConfig.description,
    images: ["/og.png"],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-image-preview": "large",
      "max-snippet": -1,
      "max-video-preview": -1,
    },
  },
  appleWebApp: {
    capable: true,
    title: siteConfig.name,
    // "default" auto-picks a contrast-safe status bar (iOS 13+) and keeps the
    // web content below it, so it stays readable in both light and dark themes.
    statusBarStyle: "default",
  },
  other: {
    // Older iOS only honours the apple-prefixed hint; Next emits the modern
    // `mobile-web-app-capable`, so add the legacy one too.
    "apple-mobile-web-app-capable": "yes",
  },
  formatDetection: { telephone: false, email: false, address: false },
}

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover",
  colorScheme: "light dark",
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#ffffff" },
    { media: "(prefers-color-scheme: dark)", color: "#17140f" },
  ],
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html
      lang="en"
      suppressHydrationWarning
      className={cn(
        "antialiased",
        fontMono.variable,
        "font-sans",
        instrumentSans.variable,
        loraHeading.variable
      )}
    >
      <body>
        <ClerkProvider appearance={{ theme: shadcn }}>
          <ThemeProvider>
            {children}
            <Toaster richColors />
            <ServiceWorkerRegistrar />
          </ThemeProvider>
        </ClerkProvider>
      </body>
    </html>
  )
}
