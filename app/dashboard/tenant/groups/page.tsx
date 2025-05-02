import { TenantGroupList } from "@/components/tenant-groups/tenant-group-list"

export default function TenantGroupsPage() {
  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">Tenant Groups</h1>
      <p className="text-muted-foreground">Create and manage tenant groups for easier chore assignments</p>
      <TenantGroupList />
    </div>
  )
}
