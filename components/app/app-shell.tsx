"use client"
import type { ComponentType } from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { UserButton } from "@clerk/nextjs"
import {
  RiApps2Line,
  RiArchiveLine,
  RiBookOpenLine,
  RiDashboardLine,
  RiDeleteBinLine,
  RiHistoryLine,
  RiHomeLine,
  RiSearchLine,
  RiSettings3Line,
  RiTimeLine,
  RiUserLine,
} from "@remixicon/react"
import { cn } from "@/lib/utils"
import { Logo } from "@/components/brand"
import { Input } from "@/components/ui/input"
import { NewShareOverlay } from "./new-share-overlay"

type NavItem = readonly [label: string, href: string, icon: ComponentType<{ className?: string }>]

const nav: NavItem[] = [
  ["Dashboard", "/dashboard", RiDashboardLine],
  ["Shares", "/shares", RiArchiveLine],
  ["Collections", "/collections", RiApps2Line],
  ["Recently viewed", "/recent", RiTimeLine],
  ["Activity", "/activity", RiHistoryLine],
  ["Trash", "/trash", RiDeleteBinLine],
]
const secondary: NavItem[] = [
  ["Settings", "/settings", RiSettings3Line],
  ["Account", "/account", RiUserLine],
  ["Help & support", "/help", RiBookOpenLine],
]

export function AppShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()
  return (
    <div className="app-shell min-h-dvh lg:grid lg:h-dvh lg:grid-cols-[250px_1fr] lg:overflow-hidden">
      <aside className="hidden border-r bg-card/70 p-4 backdrop-blur lg:flex lg:h-dvh lg:flex-col lg:overflow-y-auto">
        <Logo href="/dashboard" className="px-3 py-2" />
        <div className="mt-5">
          <NewShareOverlay />
        </div>
        <nav className="mt-5 space-y-1">
          {nav.map(([label, href, Icon]) => (
            <NavLink key={href} href={href} label={label} Icon={Icon} active={pathname === href} />
          ))}
        </nav>
        <div className="mt-auto space-y-1 pt-6">
          {secondary.map(([label, href, Icon]) => (
            <NavLink key={href} href={href} label={label} Icon={Icon} active={pathname === href} muted />
          ))}
        </div>
      </aside>

      <div className="flex min-w-0 flex-col lg:h-dvh lg:overflow-hidden">
        <header className="app-header sticky top-0 z-30 flex h-16 shrink-0 items-center gap-3 border-b bg-background/85 px-4 backdrop-blur sm:px-5">
          <form action="/shares" className="relative w-full max-w-xl lg:mx-auto">
            <RiSearchLine className="absolute top-2.5 left-3 size-4 text-muted-foreground" />
            <Input
              name="q"
              placeholder="Search shares and collections…"
              className="pl-9"
            />
          </form>
          <UserButton />
        </header>
        <div className="app-scroll mx-auto w-full max-w-7xl flex-1 p-4 pb-28 sm:p-8 lg:overflow-y-auto lg:pb-8">
          <div className="animate-fade-in">{children}</div>
        </div>
      </div>

      <nav
        aria-label="Mobile navigation"
        className="mobile-tab-bar z-40 items-center rounded-2xl border bg-background/95 px-2 py-2 shadow-xl backdrop-blur"
        style={{
          position: "fixed",
          left: "12px",
          right: "12px",
          bottom: "calc(12px + env(safe-area-inset-bottom, 0px))",
          display: "grid",
          gridTemplateColumns: "repeat(5, minmax(0, 1fr))",
          width: "auto",
        }}
      >
        <MobileLink
          href="/dashboard"
          label="Home"
          icon={RiHomeLine}
          active={pathname === "/dashboard"}
        />
        <MobileLink
          href="/shares"
          label="Shares"
          icon={RiArchiveLine}
          active={pathname.startsWith("/shares")}
        />
        <NewShareOverlay compact />
        <MobileLink
          href="/collections"
          label="Collections"
          icon={RiApps2Line}
          active={pathname.startsWith("/collections")}
        />
        <MobileLink
          href="/settings"
          label="Settings"
          icon={RiSettings3Line}
          active={pathname === "/settings"}
        />
      </nav>
    </div>
  )
}

function NavLink({
  href,
  label,
  Icon,
  active,
  muted = false,
}: {
  href: string
  label: string
  Icon: ComponentType<{ className?: string }>
  active: boolean
  muted?: boolean
}) {
  return (
    <Link
      href={href}
      aria-current={active ? "page" : undefined}
      className={cn(
        "pressable flex items-center gap-3 rounded-lg px-3 py-2 text-sm text-muted-foreground hover:bg-accent hover:text-foreground",
        active && "bg-accent font-medium text-foreground",
        muted && active && "text-foreground"
      )}
    >
      <Icon className="size-4" />
      {label}
    </Link>
  )
}

function MobileLink({
  href,
  label,
  icon: Icon,
  active,
}: {
  href: string
  label: string
  icon: ComponentType<{ className?: string }>
  active: boolean
}) {
  return (
    <Link
      href={href}
      aria-current={active ? "page" : undefined}
      className={cn(
        "flex min-w-0 flex-col items-center gap-1 overflow-hidden py-1 text-[10px] font-medium text-muted-foreground",
        active && "text-primary"
      )}
    >
      <Icon className="size-5" />
      {label}
    </Link>
  )
}
