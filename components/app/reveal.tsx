"use client"
import { useEffect, useState } from "react"
import { cn } from "@/lib/utils"

// Panel reveal (transitions.dev): flips `data-open` on after mount so the
// detail panel slides, fades and un-blurs into place.
export function Reveal({
  children,
  className,
}: {
  children: React.ReactNode
  className?: string
}) {
  const [open, setOpen] = useState(false)
  useEffect(() => {
    const frame = requestAnimationFrame(() => setOpen(true))
    return () => cancelAnimationFrame(frame)
  }, [])
  return (
    <div data-open={open} className={cn("t-panel-slide", className)}>
      {children}
    </div>
  )
}
