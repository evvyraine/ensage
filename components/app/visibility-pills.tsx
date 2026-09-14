"use client"
import { useState } from "react"
import { RiGlobalLine, RiLink, RiLockLine } from "@remixicon/react"
import { Segmented } from "./segmented"

const options = [
  { value: "private", label: "Private", icon: RiLockLine },
  { value: "unlisted", label: "Link", icon: RiLink },
  { value: "public", label: "Public", icon: RiGlobalLine },
]

export function VisibilityPills({
  name = "visibility",
  defaultValue = "unlisted",
}: {
  name?: string
  defaultValue?: string
}) {
  const [value, setValue] = useState(defaultValue)
  return (
    <>
      <Segmented
        label="Visibility"
        options={options}
        value={value}
        onChange={setValue}
        className="w-full"
      />
      <input type="hidden" name={name} value={value} />
    </>
  )
}
