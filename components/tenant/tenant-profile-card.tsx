import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"

interface TenantProfileCardProps {
  profile: {
    id: string
    full_name: string
    email: string
    phone?: string
    avatar_url?: string
  }
}

export function TenantProfileCard({ profile }: TenantProfileCardProps) {
  return (
    <Card className="overflow-hidden hover:shadow-md transition-shadow">
      <CardHeader className="pb-0">
        <CardTitle>{profile.full_name}</CardTitle>
        <CardDescription>{profile.email}</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="mt-2">
          <p className="text-sm text-muted-foreground">
            <span className="font-medium">Phone:</span> {profile.phone || "Not provided"}
          </p>
          {profile.avatar_url && (
            <div className="mt-4 flex justify-center">
              <img
                src={profile.avatar_url || "/placeholder.svg"}
                alt={`${profile.full_name}'s avatar`}
                className="h-20 w-20 rounded-full object-cover"
              />
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  )
}
