import type { Metadata } from "next"
import { SignUp } from "@clerk/nextjs"
import { Logo } from "@/components/brand"

export const metadata: Metadata = {
  title: "Create your workspace",
  robots: { index: false, follow: false },
}

export default function SignUpPage() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center gap-7 p-6">
      <Logo
        href="/"
        tileClassName="size-10"
        wordmarkClassName="text-2xl"
      />
      <SignUp />
    </div>
  )
}
