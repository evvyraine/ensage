"use client"
import { useEffect } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
export default function Error({
  error,
  unstable_retry,
}: {
  error: Error & { digest?: string }
  unstable_retry: () => void
}) {
  useEffect(() => {
    console.error(error)
  }, [error])
  return (
    <main className="grid min-h-screen place-items-center p-6">
      <div className="max-w-md text-center">
        <h1 className="font-heading text-2xl font-semibold">
          Something went wrong
        </h1>
        <p className="mt-2 text-sm text-muted-foreground">
          {error.digest
            ? `The server reported error ${error.digest}.`
            : "An unexpected error occurred while rendering this page."}
        </p>
        <div className="mt-6 flex justify-center gap-2">
          <Button onClick={() => unstable_retry()}>Try again</Button>
          <Button variant="outline" asChild>
            <Link href="/">Go home</Link>
          </Button>
        </div>
      </div>
    </main>
  )
}
