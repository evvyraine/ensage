import { clerkMiddleware } from "@clerk/nextjs/server"

// Clerk populates request authentication here and redirects signed-out users
// away from the workspace. Authorization is still enforced at each page, route
// handler, and data-access boundary so browser sessions and ensage API keys can
// coexist without path-matcher gaps.
//
// API routes are intentionally not protected here: they authenticate
// themselves and must answer with a 401 JSON response instead of an HTML
// redirect to the sign-in page.
const workspaceRoutes = [
  "/dashboard",
  "/shares",
  "/collections",
  "/recent",
  "/trash",
  "/settings",
  "/account",
  "/activity",
]

function isWorkspaceRoute(pathname: string) {
  return workspaceRoutes.some(
    (route) => pathname === route || pathname.startsWith(`${route}/`)
  )
}

export default clerkMiddleware(async (auth, request) => {
  if (isWorkspaceRoute(request.nextUrl.pathname)) await auth.protect()
})

export const config = {
  matcher: [
    "/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)",
    "/(api|trpc)(.*)",
    "/__clerk/:path*",
  ],
}
