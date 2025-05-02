import { FlagContent } from "@/components/admin/flag-content"

export default function FlagContentPage() {
  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold tracking-tight">Content Moderation</h1>
      <p className="text-muted-foreground">Review and moderate flagged content</p>
      <FlagContent />
    </div>
  )
}
