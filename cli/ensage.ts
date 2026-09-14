#!/usr/bin/env node
import { mkdir, readFile, writeFile } from "node:fs/promises"
import { homedir } from "node:os"
import { dirname, join } from "node:path"

type Config = { url?: string; token?: string }
type Share = {
  id: string
  kind: "text" | "file" | "link"
  state: string
  slug: string
  title: string | null
  content?: string | null
  targetUrl?: string | null
}
type ValidationIssue = { path?: (string | number)[]; message: string }
type ApiBody = { error?: string; issues?: ValidationIssue[] }
type ShareResponse = { share: { slug: string } }
type ListResponse = { shares: Share[] }
type ViewResponse = { share: Share }

const configPath = join(homedir(), ".config", "ensage", "config.json")

async function config(): Promise<Config> {
  try {
    return JSON.parse(await readFile(configPath, "utf8")) as Config
  } catch {
    return {}
  }
}
function arg(name: string): string | undefined {
  const index = process.argv.indexOf(name)
  return index >= 0 ? process.argv[index + 1] : undefined
}
async function readStdin(): Promise<Buffer> {
  const chunks: Buffer[] = []
  for await (const chunk of process.stdin) chunks.push(chunk as Buffer)
  return Buffer.concat(chunks)
}
async function api<T>(path: string, options: RequestInit = {}): Promise<T> {
  const stored = await config()
  if (!stored.url || !stored.token)
    throw new Error(
      "Run: ensage configure --url https://ensage.example --token ens_…"
    )
  const headers = new Headers(options.headers)
  headers.set("authorization", `Bearer ${stored.token}`)
  const response = await fetch(`${stored.url.replace(/\/$/, "")}${path}`, {
    ...options,
    headers,
  })
  const data = (response.status === 204 ? null : await response.json()) as
    | (ApiBody & T)
    | null
  if (!response.ok) {
    const body = data as ApiBody | null
    const issues = body?.issues?.length
      ? `: ${body.issues
          .map(
            (issue) =>
              `${(issue.path ?? []).join(".") || "request"}: ${issue.message}`
          )
          .join("; ")}`
      : ""
    throw new Error(`${body?.error ?? `HTTP ${response.status}`}${issues}`)
  }
  return data as T
}
function requiredId(command: string): string {
  const id = process.argv[3]
  if (!id) throw new Error(`Usage: ensage ${command} <id>`)
  return id
}

const command = process.argv[2]
try {
  if (command === "configure") {
    const value: Config = { url: arg("--url"), token: arg("--token") }
    if (!value.url || !value.token)
      throw new Error("Both --url and --token are required")
    await mkdir(dirname(configPath), { recursive: true, mode: 0o700 })
    await writeFile(configPath, JSON.stringify(value, null, 2), { mode: 0o600 })
    console.log("ensage configured")
  } else if (command === "create") {
    const file = arg("--file")
    const link = arg("--link")
    const collection = arg("--collection")
    const password = arg("--password")
    if (password && password.length < 8)
      throw new Error("--password must be at least 8 characters long")
    if (file) {
      const body = await readFile(file)
      const result = await api<ShareResponse>("/api/v1/uploads", {
        method: "POST",
        headers: {
          "content-type": "application/octet-stream",
          "content-length": String(body.length),
          "x-ensage-filename": encodeURIComponent(file.split("/").pop() ?? ""),
          "x-ensage-visibility": arg("--visibility") ?? "unlisted",
          ...(collection ? { "x-ensage-collection": collection } : {}),
        },
        body,
        duplex: "half",
      } as RequestInit & { duplex: "half" })
      const stored = await config()
      console.log(`${stored.url}/s/${result.share.slug}`)
    } else {
      const content = link ?? (await readStdin()).toString("utf8")
      if (!content) throw new Error("Pipe content to stdin or pass --link URL")
      const share = link
        ? { kind: "link" as const, url: link, title: arg("--title") }
        : {
            kind: "text" as const,
            content,
            title: arg("--title"),
            language: arg("--language") ?? "text",
          }
      const result = await api<ShareResponse>("/api/v1/shares", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({
          share,
          visibility: arg("--visibility") ?? "unlisted",
          collectionId: collection ?? null,
          password,
          expiresInHours: arg("--ttl") ? Number(arg("--ttl")) : null,
        }),
      })
      const stored = await config()
      console.log(`${stored.url}/s/${result.share.slug}`)
    }
  } else if (command === "list") {
    const params = new URLSearchParams()
    if (arg("--search")) params.set("q", arg("--search")!)
    if (process.argv.includes("--trash")) params.set("state", "trashed")
    const query = params.toString()
    const result = await api<ListResponse>(
      `/api/v1/shares${query ? `?${query}` : ""}`
    )
    for (const share of result.shares)
      console.log(
        `${share.id}\t${share.kind}\t${share.state}\t${share.slug}\t${share.title ?? ""}`
      )
  } else if (command === "view") {
    const id = requiredId("view")
    const result = await api<ViewResponse>(`/api/v1/shares/${id}`)
    if (result.share.kind === "file") {
      const stored = await config()
      const response = await fetch(
        `${stored.url!.replace(/\/$/, "")}/api/v1/shares/${id}/content`,
        { headers: { authorization: `Bearer ${stored.token}` } }
      )
      if (!response.ok) throw new Error(`HTTP ${response.status}`)
      process.stdout.write(Buffer.from(await response.arrayBuffer()))
    } else {
      process.stdout.write(
        result.share.kind === "text"
          ? (result.share.content ?? "")
          : `${result.share.targetUrl ?? ""}\n`
      )
    }
  } else if (command === "edit") {
    const id = requiredId("edit")
    const body: { action: string; title?: string; visibility?: string } = {
      action: "update",
    }
    if (arg("--title") !== undefined) body.title = arg("--title")
    if (arg("--visibility")) body.visibility = arg("--visibility")
    await api(`/api/v1/shares/${id}`, {
      method: "PATCH",
      headers: { "content-type": "application/json" },
      body: JSON.stringify(body),
    })
    console.log("updated")
  } else if (command === "rotate") {
    const id = requiredId("rotate")
    await api(`/api/v1/shares/${id}`, {
      method: "PATCH",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ action: "update", rotateLink: true }),
    })
    console.log("link rotated")
  } else if (command === "trash" || command === "restore") {
    const id = requiredId(command)
    await api(`/api/v1/shares/${id}`, {
      method: "PATCH",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ action: command }),
    })
    console.log(`${command} complete`)
  } else if (command === "delete") {
    const id = requiredId("delete")
    await api(`/api/v1/shares/${id}`, { method: "DELETE" })
    console.log("deleted")
  } else {
    console.log(`ensage

  configure --url URL --token TOKEN
  create [--stdin] [--link URL] [--file PATH] [--title TEXT] [--collection ID] [--password VALUE (min 8 chars)] [--ttl HOURS]
  list [--search QUERY] [--trash]
  view <id>
  edit <id> [--title TEXT] [--visibility private|unlisted|public]
  rotate <id>
  trash <id> | restore <id> | delete <id>`)
  }
} catch (error) {
  console.error(`ensage: ${error instanceof Error ? error.message : error}`)
  process.exitCode = 1
}
