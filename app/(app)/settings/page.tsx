import { PageHeading } from "@/components/app/page-heading"
import { ApiKeys } from "@/components/app/api-keys"
import { SettingsForm } from "@/components/app/settings-form"
import { ownerSettings } from "@/lib/server/queries"
export const dynamic = "force-dynamic"
export default async function Settings() {
  const settings = await ownerSettings()
  return (
    <>
      <PageHeading
        title="Workspace settings"
        description="Safe defaults for every new share. Stored in PostgreSQL."
      />
      <div className="space-y-6">
        <SettingsForm settings={settings} />
        <ApiKeys />
      </div>
    </>
  )
}
