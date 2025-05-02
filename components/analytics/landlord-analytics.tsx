"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Loader2, Home, Users, AlertTriangle, PoundSterling, TrendingUp, Calendar } from "lucide-react"
import { useToast } from "@/components/ui/use-toast"
import { useAuth } from "@/components/mock-auth-provider"

// Mock analytics data
const MOCK_ANALYTICS = {
  properties: {
    total: 5,
    occupied: 4,
    vacant: 1,
    occupancy_rate: 80,
  },
  tenancies: {
    active: 6,
    ended: 2,
    average_duration: 9, // months
  },
  revenue: {
    current_month: 4800,
    previous_month: 4500,
    year_to_date: 38400,
    projected_annual: 57600,
  },
  issues: {
    open: 2,
    resolved: 8,
    average_resolution_time: 3, // days
  },
  monthly_revenue: [
    { month: "Jan", amount: 4200 },
    { month: "Feb", amount: 4200 },
    { month: "Mar", amount: 4500 },
    { month: "Apr", amount: 4500 },
    { month: "May", amount: 4800 },
    { month: "Jun", amount: 4800 },
    { month: "Jul", amount: 4800 },
    { month: "Aug", amount: 4800 },
    { month: "Sep", amount: 0 },
    { month: "Oct", amount: 0 },
    { month: "Nov", amount: 0 },
    { month: "Dec", amount: 0 },
  ],
}

export function LandlordAnalytics() {
  const { toast } = useToast()
  const { user } = useAuth()

  const [analytics, setAnalytics] = useState<any>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [timeframe, setTimeframe] = useState("month")

  useEffect(() => {
    const fetchAnalytics = async () => {
      try {
        // In a real app, this would be an API call
        await new Promise((resolve) => setTimeout(resolve, 1500))

        setAnalytics(MOCK_ANALYTICS)
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
        <h2 className="text-3xl font-bold">Landlord Analytics</h2>
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
            <CardTitle className="text-sm font-medium">Total Revenue</CardTitle>
            <PoundSterling className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              £
              {timeframe === "month"
                ? analytics.revenue.current_month.toLocaleString()
                : timeframe === "quarter"
                  ? (analytics.revenue.current_month * 3).toLocaleString()
                  : analytics.revenue.projected_annual.toLocaleString()}
            </div>
            <p className="text-xs text-muted-foreground">
              {timeframe === "month"
                ? `+${(((analytics.revenue.current_month - analytics.revenue.previous_month) / analytics.revenue.previous_month) * 100).toFixed(1)}% from last month`
                : timeframe === "quarter"
                  ? "Projected quarterly revenue"
                  : "Projected annual revenue"}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Properties</CardTitle>
            <Home className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{analytics.properties.total}</div>
            <p className="text-xs text-muted-foreground">
              {analytics.properties.occupied} occupied, {analytics.properties.vacant} vacant
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Tenancies</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{analytics.tenancies.active}</div>
            <p className="text-xs text-muted-foreground">{analytics.properties.occupancy_rate}% occupancy rate</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Open Issues</CardTitle>
            <AlertTriangle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{analytics.issues.open}</div>
            <p className="text-xs text-muted-foreground">
              {analytics.issues.resolved} resolved this {timeframe}
            </p>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Revenue Overview</CardTitle>
            <CardDescription>
              {timeframe === "month"
                ? "Monthly revenue for the current year"
                : timeframe === "quarter"
                  ? "Quarterly revenue breakdown"
                  : "Annual revenue projection"}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-[300px] flex items-end space-x-2">
              {analytics.monthly_revenue.map((month: any, index: number) => (
                <div key={index} className="flex-1 flex flex-col items-center">
                  <div
                    className="w-full bg-primary rounded-t-md"
                    style={{
                      height: `${(month.amount / 5000) * 200}px`,
                      opacity: month.amount > 0 ? 1 : 0.2,
                    }}
                  ></div>
                  <span className="text-xs mt-2">{month.month}</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Property Performance</CardTitle>
            <CardDescription>Occupancy and revenue by property</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">Modern City Apartment</span>
                <span className="text-sm">£1,400/month</span>
              </div>
              <div className="w-full h-2 bg-muted rounded-full overflow-hidden">
                <div className="bg-primary h-full" style={{ width: "100%" }}></div>
              </div>

              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">Spacious Family House</span>
                <span className="text-sm">£1,500/month</span>
              </div>
              <div className="w-full h-2 bg-muted rounded-full overflow-hidden">
                <div className="bg-primary h-full" style={{ width: "100%" }}></div>
              </div>

              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">Cozy Studio Apartment</span>
                <span className="text-sm">£950/month</span>
              </div>
              <div className="w-full h-2 bg-muted rounded-full overflow-hidden">
                <div className="bg-primary h-full" style={{ width: "100%" }}></div>
              </div>

              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">Suburban Townhouse</span>
                <span className="text-sm">£1,200/month</span>
              </div>
              <div className="w-full h-2 bg-muted rounded-full overflow-hidden">
                <div className="bg-primary h-full" style={{ width: "0%" }}></div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Tenancy Duration</CardTitle>
            <CardDescription>Average tenancy length</CardDescription>
          </CardHeader>
          <CardContent className="flex items-center justify-center">
            <div className="text-center">
              <div className="flex items-center justify-center">
                <Calendar className="h-8 w-8 text-primary mr-2" />
                <span className="text-4xl font-bold">{analytics.tenancies.average_duration}</span>
              </div>
              <p className="text-sm text-muted-foreground mt-2">months average duration</p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Issue Resolution</CardTitle>
            <CardDescription>Average time to resolve maintenance issues</CardDescription>
          </CardHeader>
          <CardContent className="flex items-center justify-center">
            <div className="text-center">
              <div className="flex items-center justify-center">
                <AlertTriangle className="h-8 w-8 text-primary mr-2" />
                <span className="text-4xl font-bold">{analytics.issues.average_resolution_time}</span>
              </div>
              <p className="text-sm text-muted-foreground mt-2">days average resolution time</p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Revenue Growth</CardTitle>
            <CardDescription>Month-over-month revenue growth</CardDescription>
          </CardHeader>
          <CardContent className="flex items-center justify-center">
            <div className="text-center">
              <div className="flex items-center justify-center">
                <TrendingUp className="h-8 w-8 text-primary mr-2" />
                <span className="text-4xl font-bold">
                  {(
                    ((analytics.revenue.current_month - analytics.revenue.previous_month) /
                      analytics.revenue.previous_month) *
                    100
                  ).toFixed(1)}
                  %
                </span>
              </div>
              <p className="text-sm text-muted-foreground mt-2">month-over-month growth</p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
