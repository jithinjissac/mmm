import type { Metadata } from "next"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { AdminAnalytics } from "@/components/analytics/admin-analytics"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Flag, Star, AlertTriangle } from "lucide-react"

export const metadata: Metadata = {
  title: "Admin Dashboard",
  description: "Manage users, properties, and platform settings",
}

export default function AdminDashboardPage() {
  return (
    <div className="flex-1 space-y-4 p-8 pt-6">
      <div className="flex items-center justify-between space-y-2">
        <h2 className="text-3xl font-bold tracking-tight">Admin Dashboard</h2>
      </div>
      <Tabs defaultValue="overview" className="space-y-4">
        <TabsList>
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="analytics">Analytics</TabsTrigger>
          <TabsTrigger value="moderation">Moderation</TabsTrigger>
        </TabsList>
        <TabsContent value="overview" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total Users</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">1,234</div>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Active Properties</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">567</div>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Flagged Content</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">12</div>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Pending Reviews</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">8</div>
              </CardContent>
            </Card>
          </div>
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
            <Card className="col-span-4">
              <CardHeader>
                <CardTitle>Platform Analytics</CardTitle>
              </CardHeader>
              <CardContent className="pl-2">
                <AdminAnalytics />
              </CardContent>
            </Card>
            <Card className="col-span-3">
              <CardHeader>
                <CardTitle>Moderation Queue</CardTitle>
                <CardDescription>Content requiring moderation</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center">
                      <Flag className="h-5 w-5 text-red-500 mr-2" />
                      <span>Flagged Content</span>
                    </div>
                    <span className="font-medium">12 items</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center">
                      <Star className="h-5 w-5 text-amber-500 mr-2" />
                      <span>Pending Reviews</span>
                    </div>
                    <span className="font-medium">8 items</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center">
                      <AlertTriangle className="h-5 w-5 text-orange-500 mr-2" />
                      <span>Disputes</span>
                    </div>
                    <span className="font-medium">3 items</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
        <TabsContent value="analytics" className="space-y-4">
          <AdminAnalytics />
        </TabsContent>
        <TabsContent value="moderation" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-3">
            <Card>
              <CardHeader>
                <CardTitle>Flagged Content</CardTitle>
                <CardDescription>Review and moderate flagged content</CardDescription>
              </CardHeader>
              <CardContent className="flex flex-col items-center justify-between h-40">
                <Flag className="h-16 w-16 text-muted-foreground" />
                <Button asChild>
                  <Link href="/dashboard/admin/flag-content">View Flagged Content</Link>
                </Button>
              </CardContent>
            </Card>
            <Card>
              <CardHeader>
                <CardTitle>Review Moderation</CardTitle>
                <CardDescription>Moderate reviews flagged by users</CardDescription>
              </CardHeader>
              <CardContent className="flex flex-col items-center justify-between h-40">
                <Star className="h-16 w-16 text-muted-foreground" />
                <Button asChild>
                  <Link href="/dashboard/admin/reviews/moderation">Moderate Reviews</Link>
                </Button>
              </CardContent>
            </Card>
            <Card>
              <CardHeader>
                <CardTitle>Disputes</CardTitle>
                <CardDescription>Handle disputes between users</CardDescription>
              </CardHeader>
              <CardContent className="flex flex-col items-center justify-between h-40">
                <AlertTriangle className="h-16 w-16 text-muted-foreground" />
                <Button asChild>
                  <Link href="/dashboard/admin/disputes">Manage Disputes</Link>
                </Button>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  )
}
