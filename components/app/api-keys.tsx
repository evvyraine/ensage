"use client"
import { useEffect, useState } from "react"
import { RiCheckLine, RiFileCopyLine, RiKey2Line, RiAddLine, RiDeleteBinLine } from "@remixicon/react"
import { toast } from "sonner"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { formatDate } from "@/lib/format"

type ApiKey = {
  id: string
  name: string
  prefix: string
  lastUsedAt: string | null
  expiresAt: string | null
  revokedAt: string | null
  createdAt: string
}

export function ApiKeys() {
  const [keys, setKeys] = useState<ApiKey[]>([])
  const [busy, setBusy] = useState(false)
  const [secret, setSecret] = useState<string | null>(null)
  const [copied, setCopied] = useState(false)

  async function load() {
    const response = await fetch("/api/v1/api-keys")
    if (response.ok) setKeys((await response.json()).keys ?? [])
  }
  useEffect(() => {
    let active = true
    fetch("/api/v1/api-keys")
      .then((response) => (response.ok ? response.json() : { keys: [] }))
      .then((data) => {
        if (active) setKeys(data.keys ?? [])
      })
      .catch(() => {})
    return () => {
      active = false
    }
  }, [])

  async function create(formData: FormData) {
    setBusy(true)
    const response = await fetch("/api/v1/api-keys", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ name: formData.get("name") }),
    })
    setBusy(false)
    const data = await response.json().catch(() => ({}))
    if (!response.ok) {
      toast.error(data.error ?? "Could not create API key")
      return
    }
    setSecret(data.secret)
    setCopied(false)
    await load()
  }

  async function revoke(id: string) {
    const response = await fetch(`/api/v1/api-keys/${id}`, {
      method: "DELETE",
    })
    if (!response.ok) {
      toast.error("Could not revoke API key")
      return
    }
    toast.success("API key revoked")
    await load()
  }

  async function copy() {
    if (!secret) return
    await navigator.clipboard.writeText(secret)
    setCopied(true)
    toast.success("API key copied")
  }

  return (
    <Card className="max-w-3xl">
      <CardHeader>
        <CardTitle>API keys</CardTitle>
      </CardHeader>
      <CardContent className="space-y-5">
        <p className="text-sm text-muted-foreground">
          API keys let the ensage CLI and integrations act on your workspace.
          Keys are shown once and stored only as a hash.
        </p>
        {secret && (
          <div className="rounded-xl border border-primary/40 bg-primary/5 p-4">
            <p className="text-sm font-medium">Copy your new key now</p>
            <p className="mt-1 text-xs text-muted-foreground">
              This is the only time it will be shown.
            </p>
            <div className="mt-3 flex gap-2">
              <code className="min-w-0 flex-1 truncate rounded-lg border bg-background px-3 py-2 font-mono text-xs">
                {secret}
              </code>
              <Button type="button" variant="outline" onClick={copy}>
                {copied ? <RiCheckLine /> : <RiFileCopyLine />}
                Copy
              </Button>
            </div>
            <Button
              type="button"
              variant="ghost"
              className="mt-2"
              onClick={() => setSecret(null)}
            >
              Done
            </Button>
          </div>
        )}
        <form action={create} className="flex items-end gap-3">
          <div className="flex-1">
            <Label htmlFor="key-name">Name</Label>
            <Input
              id="key-name"
              name="name"
              required
              maxLength={80}
              placeholder="Laptop CLI"
              className="mt-2"
            />
          </div>
          <Button type="submit" disabled={busy}>
            <RiAddLine />
            Create key
          </Button>
        </form>
        <div className="space-y-2">
          {keys.map((key) => (
            <div
              key={key.id}
              className="flex items-center gap-3 rounded-xl border px-4 py-3"
            >
              <RiKey2Line className="size-4 shrink-0 text-muted-foreground" />
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-2">
                  <span className="truncate text-sm font-medium">
                    {key.name}
                  </span>
                  {key.revokedAt && (
                    <Badge variant="secondary">Revoked</Badge>
                  )}
                </div>
                <p className="mt-1 text-xs text-muted-foreground">
                  <code>{key.prefix}…</code> · created{" "}
                  {formatDate(key.createdAt)}
                  {key.lastUsedAt
                    ? ` · last used ${formatDate(key.lastUsedAt)}`
                    : " · never used"}
                </p>
              </div>
              {!key.revokedAt && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => revoke(key.id)}
                >
                  <RiDeleteBinLine />
                  Revoke
                </Button>
              )}
            </div>
          ))}
          {!keys.length && (
            <p className="rounded-xl border border-dashed py-6 text-center text-sm text-muted-foreground">
              No API keys yet.
            </p>
          )}
        </div>
      </CardContent>
    </Card>
  )
}
