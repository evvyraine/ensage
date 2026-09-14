"use client"
import { useState } from "react"
import { RiCheckLine, RiFileCopyLine } from "@remixicon/react"
import { toast } from "sonner"
import { Button } from "@/components/ui/button"

export function CopyButton({
  value,
  label = "Copy",
}: {
  value: string
  label?: string
}) {
  const [copied, setCopied] = useState(false)
  return (
    <Button
      type="button"
      variant="ghost"
      size="sm"
      onClick={() =>
        navigator.clipboard.writeText(value).then(() => {
          setCopied(true)
          toast.success("Copied")
        })
      }
    >
      {copied ? <RiCheckLine /> : <RiFileCopyLine />}
      {label}
    </Button>
  )
}
