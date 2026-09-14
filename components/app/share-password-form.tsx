"use client"
import { useState } from "react"
import { useRouter } from "next/navigation"
import { RiLockLine } from "@remixicon/react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
export function SharePasswordForm({
  shareId,
  title = "Protected share",
}: {
  shareId: string
  title?: string
}) {
  const router = useRouter()
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState<string | null>(null)
  async function submit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setBusy(true)
    setError(null)
    const password = String(new FormData(event.currentTarget).get("password"))
    const response = await fetch(`/api/v1/shares/${shareId}/access`, {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ password }),
    })
    setBusy(false)
    if (!response.ok) {
      setError(
        response.status === 429
          ? "Too many attempts. Try again in a minute."
          : "Incorrect password"
      )
      return
    }
    router.refresh()
  }
  return (
    <main className="grid min-h-screen place-items-center p-6">
      <form
        onSubmit={submit}
        className="w-full max-w-sm rounded-2xl border bg-card p-7"
      >
        <RiLockLine className="size-5 text-primary" />
        <h1 className="mt-5 font-heading text-2xl font-semibold">{title}</h1>
        <p className="mt-2 text-sm text-muted-foreground">
          Enter the password to view this share.
        </p>
        <Label htmlFor="password" className="mt-6">
          Password
        </Label>
        <Input
          id="password"
          name="password"
          type="password"
          autoFocus
          required
          className="mt-2"
        />
        {error && <p className="mt-3 text-sm text-destructive">{error}</p>}
        <Button type="submit" className="mt-6 w-full" disabled={busy}>
          {busy ? "Unlocking…" : "Unlock share"}
        </Button>
      </form>
    </main>
  )
}
