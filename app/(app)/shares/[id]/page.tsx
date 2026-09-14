import { redirect } from "next/navigation"
export default async function ManageShare({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params
  // The standalone manage page is superseded by the master–detail panel.
  redirect(`/shares?share=${id}`)
}
