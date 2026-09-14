import Link from "next/link"
import { Logo } from "@/components/brand"
import { Button } from "@/components/ui/button"
export default function NotFound() {
  return (
    <main className="grid min-h-screen place-items-center p-6">
      <div className="text-center">
        <Logo href="/" className="mb-7" />
        <p className="font-heading text-6xl font-semibold text-primary">404</p>
        <h1 className="mt-4 font-heading text-2xl font-semibold">
          Page not found
        </h1>
        <p className="mt-2 text-muted-foreground">
          This page does not exist, has expired, or is no longer available.
        </p>
        <Button className="mt-6" asChild>
          <Link href="/">Go home</Link>
        </Button>
      </div>
    </main>
  )
}
