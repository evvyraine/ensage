"use client"
import type { CSSProperties } from "react"
import { cn } from "@/lib/utils"

function CheckGlyph() {
  return (
    <svg
      viewBox="0 0 10.1668 10.1668"
      className="size-3"
      fill="none"
      stroke="currentColor"
      strokeWidth={1.8}
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      style={{ "--check-len": 16 } as CSSProperties}
    >
      <path d="M1 5.52L3.92 9.17L9.17 1" />
    </svg>
  )
}

const base =
  "t-check grid size-5 shrink-0 place-items-center rounded-md border"
const state = (checked: boolean) =>
  checked
    ? "border-primary bg-primary text-primary-foreground"
    : "border-input bg-background text-transparent"

// Interactive checkbox (its own control).
export function Check({
  checked,
  onCheckedChange,
  label,
  className,
}: {
  checked: boolean
  onCheckedChange: (checked: boolean) => void
  label: string
  className?: string
}) {
  return (
    <button
      type="button"
      role="checkbox"
      aria-checked={checked}
      aria-label={label}
      onClick={(event) => {
        event.preventDefault()
        event.stopPropagation()
        onCheckedChange(!checked)
      }}
      className={cn(base, state(checked), className)}
    >
      <CheckGlyph />
    </button>
  )
}

// Non-interactive indicator for rows that are themselves the control — avoids
// nesting a <button> inside a <button>.
export function CheckIndicator({
  checked,
  className,
}: {
  checked: boolean
  className?: string
}) {
  return (
    <span
      aria-hidden="true"
      data-checked={checked}
      className={cn(base, state(checked), className)}
    >
      <CheckGlyph />
    </span>
  )
}
