"use client"
import { usePathname, useRouter, useSearchParams } from "next/navigation"
import { Segmented } from "./segmented"

const kindOptions = [
  { value: "all", label: "All" },
  { value: "text", label: "Text" },
  { value: "file", label: "Files" },
  { value: "link", label: "Links" },
]
const visibilityOptions = [
  { value: "all", label: "Any access" },
  { value: "private", label: "Private" },
  { value: "unlisted", label: "Link" },
  { value: "public", label: "Public" },
]
const passwordOptions = [
  { value: "all", label: "Any" },
  { value: "protected", label: "Password" },
  { value: "open", label: "Open" },
]

export function ShareFilters() {
  const router = useRouter()
  const pathname = usePathname()
  const params = useSearchParams()

  function update(key: string, value: string) {
    const next = new URLSearchParams(params.toString())
    if (value === "all") next.delete(key)
    else next.set(key, value)
    next.delete("page")
    const query = next.toString()
    router.push(query ? `${pathname}?${query}` : pathname)
  }

  return (
    <div className="app-scroll mb-5 flex gap-2 overflow-x-auto pb-1">
      <Segmented
        label="Type"
        options={kindOptions}
        value={params.get("kind") ?? "all"}
        onChange={(value) => update("kind", value)}
      />
      <Segmented
        label="Visibility"
        options={visibilityOptions}
        value={params.get("visibility") ?? "all"}
        onChange={(value) => update("visibility", value)}
      />
      <Segmented
        label="Password"
        options={passwordOptions}
        value={params.get("password") ?? "all"}
        onChange={(value) => update("password", value)}
      />
    </div>
  )
}
