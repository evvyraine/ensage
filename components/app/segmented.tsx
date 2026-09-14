"use client"
import type { ComponentType } from "react"
import { useCallback, useLayoutEffect, useRef } from "react"
import { cn } from "@/lib/utils"

export type SegmentedOption = {
  value: string
  label: string
  icon?: ComponentType<{ className?: string }>
}

// Tabs sliding (transitions.dev), generalized. Controlled segmented control.
export function Segmented({
  options,
  value,
  onChange,
  className,
  label,
}: {
  options: SegmentedOption[]
  value: string
  onChange: (value: string) => void
  className?: string
  label?: string
}) {
  const pillRef = useRef<HTMLSpanElement>(null)
  const tabRefs = useRef<Record<string, HTMLButtonElement | null>>({})
  const mounted = useRef(false)

  const move = useCallback(
    (animate: boolean) => {
      const tab = tabRefs.current[value]
      const pill = pillRef.current
      if (!tab || !pill) return
      const transform = `translateX(${tab.offsetLeft}px)`
      const width = `${tab.offsetWidth}px`
      if (animate) {
        pill.style.transform = transform
        pill.style.width = width
        return
      }
      const previous = pill.style.transition
      pill.style.transition = "none"
      pill.style.transform = transform
      pill.style.width = width
      void pill.offsetWidth
      pill.style.transition = previous
    },
    [value]
  )

  useLayoutEffect(() => {
    move(mounted.current)
    mounted.current = true
  }, [move, options.length])

  useLayoutEffect(() => {
    const onResize = () => move(false)
    window.addEventListener("resize", onResize)
    return () => window.removeEventListener("resize", onResize)
  }, [move])

  return (
    <div
      role="tablist"
      aria-label={label}
      className={cn("t-tabs", className)}
    >
      <span ref={pillRef} className="t-tabs-pill" aria-hidden="true" />
      {options.map((option) => (
        <button
          key={option.value}
          type="button"
          role="tab"
          aria-selected={value === option.value}
          ref={(element) => {
            tabRefs.current[option.value] = element
          }}
          onClick={() => onChange(option.value)}
          className="t-tab flex flex-1 items-center justify-center gap-1.5 text-xs font-medium whitespace-nowrap"
        >
          {option.icon && <option.icon className="size-3.5" />}
          {option.label}
        </button>
      ))}
    </div>
  )
}
