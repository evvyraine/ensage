"use client"

import { RiRefreshLine, RiWifiOffLine } from "@remixicon/react"
import { Logo } from "@/components/brand"
import { Button } from "@/components/ui/button"

export default function Offline() {
  return (
    <main className="grid min-h-screen place-items-center p-6">
      <div className="max-w-sm text-center">
        <Logo href="/" className="mb-7" />
        <div className="mx-auto grid size-12 place-items-center rounded-full bg-muted">
          <RiWifiOffLine className="size-6 text-muted-foreground" />
        </div>
        <h1 className="mt-5 font-heading text-2xl font-semibold">
          You&rsquo;re offline
        </h1>
        <p className="mt-2 text-sm text-muted-foreground">
          ensage needs a connection to reach your workspace. Reconnect and try
          again.
        </p>
        <Button className="mt-6" onClick={() => window.location.reload()}>
          <RiRefreshLine />
          Try again
        </Button>
      </div>
    </main>
  )
}
