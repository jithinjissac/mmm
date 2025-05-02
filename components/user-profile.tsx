"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { RoleManager } from "@/components/admin/role-manager"
import { Skeleton } from "@/components/ui/skeleton"
import { useAuth } from "@/components/mock-auth-provider" // Updated import
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { UserRating } from "@/components/reviews/user-rating"
import { ReviewList } from "@/components/reviews/review-list"

export function UserProfile() {
  const { user, isLoading, userRole, refreshProfile } = useAuth()

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <Skeleton className="h-8 w-[250px]" />
          <Skeleton className="h-4 w-[200px]" />
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <Skeleton className="h-4 w-[300px]" />
            <Skeleton className="h-4 w-[250px]" />
            <Skeleton className="h-4 w-[200px]" />
          </div>
        </CardContent>
      </Card>
    )
  }

  if (!user) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>User Profile</CardTitle>
          <CardDescription>You are not logged in</CardDescription>
        </CardHeader>
      </Card>
    )
  }

  return (
    <Tabs defaultValue="profile" className="w-[400px]">
      <TabsList className="grid w-full grid-cols-3">
        <TabsTrigger value="profile">Profile</TabsTrigger>
        <TabsTrigger value="settings">Settings</TabsTrigger>
        <TabsTrigger value="reviews">Reviews</TabsTrigger>
      </TabsList>
      <TabsContent value="profile" className="space-y-4">
        <Card>
          <CardHeader>
            <CardTitle>User Profile</CardTitle>
            <CardDescription>Your account information</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div>
                <h3 className="text-sm font-medium">Email</h3>
                <p>{user.email}</p>
              </div>

              <div>
                <h3 className="text-sm font-medium">Name</h3>
                <p>{user.name || "Not provided"}</p>
              </div>

              <div>
                <h3 className="text-sm font-medium">Role</h3>
                <p className="capitalize">{userRole}</p>
              </div>

              {/* Allow users to see their role and admins to change it */}
              <RoleManager userId={user.id} currentRole={userRole} onRoleChange={() => refreshProfile()} />
            </div>
          </CardContent>
        </Card>
      </TabsContent>
      <TabsContent value="settings">
        <Card>
          <CardHeader>
            <CardTitle>Settings</CardTitle>
            <CardDescription>Manage your account settings</CardDescription>
          </CardHeader>
          <CardContent>
            <p>Settings content</p>
          </CardContent>
        </Card>
      </TabsContent>
      <TabsContent value="reviews" className="space-y-4">
        <Card>
          <CardHeader>
            <CardTitle>Reviews</CardTitle>
            <CardDescription>See what others are saying about you</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="mb-6">
              <UserRating userId={user.id} size="lg" />
            </div>
            <ReviewList userId={user.id} />
          </CardContent>
        </Card>
      </TabsContent>
    </Tabs>
  )
}
