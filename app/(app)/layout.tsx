import type { Metadata } from "next"
import { AppShell } from "@/components/app/app-shell"

// The workspace is per-user and behind auth — keep it out of search indexes.
export const metadata: Metadata = {
  robots: { index: false, follow: false },
}

export default function WorkspaceLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return <AppShell>{children}</AppShell>
}
