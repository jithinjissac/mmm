"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Loader2, Users, Home, Building, Star, Flag, TrendingUp, PoundSterling } from "lucide-react"
import { useToast } from "@/components/ui/use-toast"

// Mock admin analytics data
const MOCK_ADMIN_ANALYTICS = {
  users: {
    total: 120,
    landlords: 35,
    tenants: 80,
    admins: 5,
    growth_rate: 8.5, // percentage
  },
  properties: {
    total: 45,
    active: 42,
    inactive: 3,
    shared: 28,
    non_shared: 17,
  },
  tenancies: {
    total: 95,
    active: 85,
    ended: 10,
    average_duration: 8.5, // months
  },
  platform: {
    total_revenue: 12500, // platform fees
    monthly_growth: 12.3, // percentage
    average_credibility: 4.2, // out of 5
    flagged_content: 8,
  },
  monthly_stats: [
    { month: "Jan", users: 80, properties: 30, tenancies: 65 },
    { month: "Feb", users: 85, properties: 32, tenancies: 68 },
    { month: "Mar", users: 90, properties: 35, tenancies: 72 },
    { month: "Apr", users: 95, properties: 38, tenancies: 78 },
    { month: "May", users: 100, properties: 40, tenancies: 82 },
    { month: "Jun", users: 105, properties: 42, tenancies: 85 },
    { month: "Jul", users: 110, properties: 43, tenancies: 90 },
    { month: "Aug", users: 120, properties: 45, tenancies: 95 },
  ],
}

export function AdminAnalytics() {
  const { toast } = useToast()

  const [analytics, setAnalytics] = useState<any>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [timeframe, setTimeframe] = useState("month")

  useEffect(() => {
    const fetchAnalytics = async () => {
      try {
        // In a real app, this would be an API call
        await new Promise((resolve) => setTimeout(resolve, 1500))

        setAnalytics(MOCK_ADMIN_ANALYTICS)
      } catch (error) {
        toast({
          title: "Error",
          description: "Failed to load analytics data. Please try again.",
          variant: "destructive",
        })
      } finally {
        setIsLoading(false)
      }
    }

    fetchAnalytics()
  }, [toast])

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    )
  }

  if (!analytics) return null

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-3xl font-bold">Platform Analytics</h2>
        <Tabs value={timeframe} onValueChange={setTimeframe} className="w-[400px]">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="month">Month</TabsTrigger>
            <TabsTrigger value="quarter">Quarter</TabsTrigger>
            <TabsTrigger value="year">Year</TabsTrigger>
          </TabsList>
        </Tabs>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Users</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{analytics.users.total}</div>
            <p className="text-xs text-muted-foreground">+{analytics.users.growth_rate}% from last month</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Properties</CardTitle>
            <Building className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{analytics.properties.total}</div>
            <p className="text-xs text-muted-foreground">
              {analytics.properties.active} active, {analytics.properties.inactive} inactive
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Tenancies</CardTitle>
            <Home className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{analytics.tenancies.total}</div>
            <p className="text-xs text-muted-foreground">
              {analytics.tenancies.active} active, {analytics.tenancies.ended} ended
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Platform Revenue</CardTitle>
            <PoundSterling className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">£{analytics.platform.total_revenue.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground">+{analytics.platform.monthly_growth}% from last month</p>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Platform Growth</CardTitle>
            <CardDescription>Monthly growth of users, properties, and tenancies</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-[300px]">
              {/* This would be a chart in a real implementation */}
              <div className="h-full flex items-end space-x-2">
                {analytics.monthly_stats.map((month: any, index: number) => (
                  <div key={index} className="flex-1 flex flex-col items-center">
                    <div className="w-full flex flex-col space-y-1">
                      <div
                        className="w-full bg-blue-500 rounded-t-sm"
                        style={{ height: `${(month.users / 150) * 200}px` }}
                      ></div>
                      <div
                        className="w-full bg-green-500 rounded-t-sm"
                        style={{ height: `${(month.properties / 50) * 100}px` }}
                      ></div>
                      <div
                        className="w-full bg-purple-500 rounded-t-sm"
                        style={{ height: `${(month.tenancies / 100) * 150}px` }}
                      ></div>
                    </div>
                    <span className="text-xs mt-2">{month.month}</span>
                  </div>
                ))}
              </div>
              <div className="flex justify-center mt-4 space-x-6">
                <div className="flex items-center">
                  <div className="w-3 h-3 bg-blue-500 rounded-full mr-2"></div>
                  <span className="text-xs">Users</span>
                </div>
                <div className="flex items-center">
                  <div className="w-3 h-3 bg-green-500 rounded-full mr-2"></div>
                  <span className="text-xs">Properties</span>
                </div>
                <div className="flex items-center">
                  <div className="w-3 h-3 bg-purple-500 rounded-full mr-2"></div>
                  <span className="text-xs">Tenancies</span>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>User Distribution</CardTitle>
            <CardDescription>Breakdown of user roles on the platform</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-[300px] flex items-center justify-center">
              {/* This would be a pie chart in a real implementation */}
              <div className="relative w-48 h-48">
                <div
                  className="absolute inset-0 rounded-full border-8 border-blue-500"
                  style={{ clipPath: "polygon(0 0, 100% 0, 100% 100%, 0 100%)" }}
                ></div>
                <div
                  className="absolute inset-0 rounded-full border-8 border-green-500"
                  style={{ clipPath: "polygon(50% 50%, 100% 50%, 100% 100%, 50% 100%)" }}
                ></div>
                <div
                  className="absolute inset-0 rounded-full border-8 border-purple-500"
                  style={{ clipPath: "polygon(50% 50%, 100% 50%, 100% 0, 50% 0)" }}
                ></div>
                <div className="absolute inset-0 flex items-center justify-center">
                  <span className="text-lg font-bold">{analytics.users.total}</span>
                </div>
              </div>
              <div className="ml-8 space-y-4">
                <div className="flex items-center">
                  <div className="w-4 h-4 bg-blue-500 rounded-full mr-2"></div>
                  <div>
                    <p className="text-sm font-medium">Tenants</p>
                    <p className="text-xs text-muted-foreground">
                      {analytics.users.tenants} ({Math.round((analytics.users.tenants / analytics.users.total) * 100)}%)
                    </p>
                  </div>
                </div>
                <div className="flex items-center">
                  <div className="w-4 h-4 bg-green-500 rounded-full mr-2"></div>
                  <div>
                    <p className="text-sm font-medium">Landlords</p>
                    <p className="text-xs text-muted-foreground">
                      {analytics.users.landlords} (
                      {Math.round((analytics.users.landlords / analytics.users.total) * 100)}%)
                    </p>
                  </div>
                </div>
                <div className="flex items-center">
                  <div className="w-4 h-4 bg-purple-500 rounded-full mr-2"></div>
                  <div>
                    <p className="text-sm font-medium">Admins</p>
                    <p className="text-xs text-muted-foreground">
                      {analytics.users.admins} ({Math.round((analytics.users.admins / analytics.users.total) * 100)}%)
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Average Credibility</CardTitle>
            <CardDescription>Average user credibility score</CardDescription>
          </CardHeader>
          <CardContent className="flex items-center justify-center">
            <div className="text-center">
              <div className="flex items-center justify-center">
                <Star className="h-8 w-8 text-yellow-400 fill-yellow-400 mr-2" />
                <span className="text-4xl font-bold">{analytics.platform.average_credibility}</span>
                <span className="text-lg ml-1">/5</span>
              </div>
              <p className="text-sm text-muted-foreground mt-2">average credibility score</p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Flagged Content</CardTitle>
            <CardDescription>Content flagged for moderation</CardDescription>
          </CardHeader>
          <CardContent className="flex items-center justify-center">
            <div className="text-center">
              <div className="flex items-center justify-center">
                <Flag className="h-8 w-8 text-red-500 mr-2" />
                <span className="text-4xl font-bold">{analytics.platform.flagged_content}</span>
              </div>
              <p className="text-sm text-muted-foreground mt-2">items requiring moderation</p>
              <button className="text-sm text-primary mt-2 underline">View flagged content</button>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Growth Rate</CardTitle>
            <CardDescription>Platform monthly growth rate</CardDescription>
          </CardHeader>
          <CardContent className="flex items-center justify-center">
            <div className="text-center">
              <div className="flex items-center justify-center">
                <TrendingUp className="h-8 w-8 text-green-500 mr-2" />
                <span className="text-4xl font-bold">{analytics.platform.monthly_growth}%</span>
              </div>
              <p className="text-sm text-muted-foreground mt-2">month-over-month growth</p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
