import Link from "next/link"
import type { ComponentPropsWithoutRef } from "react"
import { cn } from "@/lib/utils"

const MARK_PATH =
  "M176.971 7.02945C181.471 2.52858 187.576 0 193.941 0H452C478.51 0 500 21.4904 500 48V120.262C500 129.777 494.379 138.393 485.672 142.227L232.678 253.624C216.866 257.861 216.866 280.296 232.678 284.533L485.672 395.93C494.379 399.764 500 408.381 500 417.895V490C500 516.51 478.51 538 452 538H48C21.4903 538 0 516.51 0 490L0 193.941C0 187.576 2.52856 181.471 7.02944 176.971L176.971 7.02945Z"

/** The ensage mark. The mark is a single orange gradient, so it needs a backing
 * (see `Logo`) whenever it sits directly on a page background. */
export function LogoMark({
  className,
  ...props
}: ComponentPropsWithoutRef<"svg">) {
  return (
    <svg
      viewBox="0 0 500 538"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden="true"
      className={className}
      {...props}
    >
      <defs>
        <linearGradient
          id="ensage-brand"
          x1="250"
          y1="0"
          x2="250"
          y2="538"
          gradientUnits="userSpaceOnUse"
        >
          <stop stopColor="#F98028" />
          <stop offset="1" stopColor="#FFC398" />
        </linearGradient>
      </defs>
      <path d={MARK_PATH} fill="url(#ensage-brand)" />
    </svg>
  )
}

export function Wordmark({ className }: { className?: string }) {
  return (
    <span
      className={cn(
        "font-heading text-xl leading-none font-semibold tracking-tight",
        className
      )}
    >
      en<span className="text-primary">sage</span>
    </span>
  )
}

type Tone = "auto" | "light" | "dark"

// The mark is orange on transparent, so it lives on a white tile in light
// contexts and a near-black tile in dark ones.
const tileTones: Record<Tone, string> = {
  auto: "bg-white ring-black/5 dark:bg-[#211d17] dark:ring-white/10",
  light: "bg-white ring-black/5",
  dark: "bg-[#17140f] ring-white/10",
}

export function Logo({
  href,
  showWordmark = true,
  tone = "auto",
  className,
  tileClassName,
  markClassName,
  wordmarkClassName,
}: {
  href?: string
  showWordmark?: boolean
  tone?: Tone
  className?: string
  tileClassName?: string
  markClassName?: string
  wordmarkClassName?: string
}) {
  const content = (
    <>
      <span
        className={cn(
          "grid size-8 shrink-0 place-items-center rounded-[0.6rem] shadow-sm ring-1",
          tileTones[tone],
          tileClassName
        )}
      >
        <LogoMark className={cn("size-[58%]", markClassName)} />
      </span>
      {showWordmark ? <Wordmark className={wordmarkClassName} /> : null}
    </>
  )

  const classes = cn("inline-flex items-center gap-2.5", className)

  if (href) {
    return (
      <Link href={href} className={cn(classes, "pressable")}>
        {content}
      </Link>
    )
  }

  return <span className={classes}>{content}</span>
}
