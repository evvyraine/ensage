import Link from "next/link"
import { RiBookOpenLine, RiCommandLine, RiLifebuoyLine, RiShieldCheckLine } from "@remixicon/react"
import { Show, SignUpButton } from "@clerk/nextjs"
import { Logo } from "@/components/brand"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
const cards = [
  [
    RiCommandLine,
    "CLI quickstart",
    "Run `npm link`, create an API key under Settings → API keys, then pipe anything into `ensage create --stdin`.",
  ],
  [
    RiShieldCheckLine,
    "Security model",
    "Viewer passwords and creator management credentials are separate. API keys are shown once and stored hashed.",
  ],
  [
    RiBookOpenLine,
    "Self-hosting",
    "Run PostgreSQL, migrate the schema, configure Clerk, then start the standalone Next.js server with PM2.",
  ],
  [
    RiLifebuoyLine,
    "Support",
    "Review the activity log and health checks before opening an issue. Never include credentials in reports.",
  ],
]
export default function Help() {
  return (
    <main className="mx-auto min-h-screen max-w-4xl px-6 py-12">
      <header className="mb-10 flex items-center">
        <Logo href="/" />
        <Show when="signed-in">
          <Button className="ml-auto" asChild>
            <Link href="/dashboard">Open workspace</Link>
          </Button>
        </Show>
        <Show when="signed-out">
          <SignUpButton mode="modal">
            <Button className="ml-auto">Start sharing</Button>
          </SignUpButton>
        </Show>
      </header>
      <h1 className="font-heading text-4xl font-semibold">Help &amp; support</h1>
      <p className="mt-3 max-w-2xl text-muted-foreground">
        Everything you need to share confidently.
      </p>
      <div className="mt-10 grid gap-4 md:grid-cols-2">
        {cards.map(([Icon, title, body]) => (
          <Card key={String(title)}>
            <CardContent className="p-6">
              <Icon className="mb-5 size-5 text-primary" />
              <h2 className="font-heading text-xl font-semibold">
                {String(title)}
              </h2>
              <p className="mt-2 text-sm leading-6 text-muted-foreground">
                {String(body)}
              </p>
            </CardContent>
          </Card>
        ))}
      </div>
    </main>
  )
}
