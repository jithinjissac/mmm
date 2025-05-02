"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Building, Home, Bed, CreditCard, Plus, AlertCircle, Loader2, RefreshCw, LogIn } from "lucide-react"
import { useToast } from "@/components/ui/use-toast"
import { getProperties } from "@/app/dashboard/landlord/properties/actions"
import { getRooms } from "@/app/dashboard/landlord/rooms/actions"
import { useAuth } from "@/components/auth-provider"
import { useRouter } from "next/navigation"
import { formatCurrency } from "@/lib/utils/format-helpers"
import { useCallback } from "react"
import { signOut } from "next-auth/react"

export function PropertyOverview() {
  const { user } = useAuth()
  const [properties, setProperties] = useState<any[]>([])
  const [rooms, setRooms] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [isRetrying, setIsRetrying] = useState(false)
  const [authError, setAuthError] = useState(false)
  const { toast } = useToast()
  const router = useRouter()

  // Function to load data with retry logic
  const loadDashboardData = useCallback(
    async (showToast = true) => {
      try {
        setIsLoading(true)
        setError(null)
        setAuthError(false)

        // Check if user is authenticated
        if (!user) {
          console.log("User not authenticated, cannot load dashboard data")
          setError("Authentication required. Please sign in to view your dashboard.")
          setAuthError(true)
          setIsLoading(false)
          return
        }

        console.log("Loading dashboard data for user:", user.id)

        // Try to load properties using server action first
        let propertiesData: any[] = []
        try {
          propertiesData = await getProperties()
          console.log("Properties loaded via server action:", propertiesData.length)
        } catch (err: any) {
          console.error("Error loading properties via server action:", err)

          // Check if it's an authentication error
          if (err.message?.includes("Not authenticated") || err.message?.includes("Authentication error")) {
            setAuthError(true)
            if (showToast) {
              toast({
                title: "Authentication Error",
                description: "Your session may have expired. Please try signing in again.",
                variant: "destructive",
              })
            }
          } else if (showToast) {
            toast({
              title: "Error loading properties",
              description: err.message || "Could not load your properties. Some data may be unavailable.",
              variant: "destructive",
            })
          }
        }

        // Try to load rooms using server action first
        let roomsData: any[] = []
        try {
          roomsData = await getRooms()
          console.log("Rooms loaded via server action:", roomsData.length)
        } catch (err: any) {
          console.error("Error loading rooms via server action:", err)

          // Check if it's an authentication error
          if (err.message?.includes("Not authenticated") || err.message?.includes("Authentication error")) {
            setAuthError(true)
            if (showToast && !err.message?.includes("Not authenticated")) {
              toast({
                title: "Authentication Error",
                description: "Your session may have expired. Please try signing in again.",
                variant: "destructive",
              })
            }
          } else if (showToast) {
            toast({
              title: "Error loading rooms",
              description: err.message || "Could not load your rooms. Some data may be unavailable.",
              variant: "destructive",
            })
          }
        }

        // Even if one of the requests fails, we still set the data we have
        setProperties(propertiesData || [])
        setRooms(roomsData || [])

        // Only show error if both failed
        if ((!propertiesData || propertiesData.length === 0) && (!roomsData || roomsData.length === 0)) {
          if (authError) {
            setError("Authentication error. Your session may have expired. Please try signing in again.")
          } else {
            setError("Could not load dashboard data. Please try again.")
          }
        }
      } catch (error: any) {
        console.error("Error loading dashboard data:", error)
        setError(error.message || "Failed to load dashboard data")
        if (showToast) {
          toast({
            title: "Error loading data",
            description: "Could not load your properties and rooms. Please try again.",
            variant: "destructive",
          })
        }
      } finally {
        setIsLoading(false)
        setIsRetrying(false)
      }
    },
    [user, toast, authError],
  )

  // Initial data load
  useEffect(() => {
    if (user) {
      loadDashboardData()
    }
  }, [user, loadDashboardData])

  // Handle retry
  const handleRetry = async () => {
    setIsRetrying(true)
    await loadDashboardData(false) // Don't show toast on retry
  }

  // Handle sign out and redirect to login
  const handleSignOutAndRedirect = async () => {
    try {
      await signOut()
      router.push("/login")
    } catch (error) {
      console.error("Error signing out:", error)
      // Force redirect to login even if sign out fails
      router.push("/login")
    }
  }

  // Calculate statistics
  const totalProperties = properties.length
  const totalRooms = rooms.length
  const occupiedRooms = rooms.filter((room) => room.status === "occupied").length
  const vacantRooms = rooms.filter((room) => room.status === "vacant").length
  const totalMonthlyIncome = rooms
    .filter((room) => room.status === "occupied")
    .reduce((total, room) => total + (Number.parseFloat(room.rent) || 0), 0)

  if (isLoading) {
    return (
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-2xl font-bold">Property Overview</h2>
        </div>
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <Card key={i}>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Loading...</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">-</div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-2xl font-bold">Property Overview</h2>
        </div>
        <Card className="p-6">
          <div className="flex flex-col items-center text-center gap-2">
            <AlertCircle className="h-10 w-10 text-destructive" />
            <h3 className="text-lg font-semibold">Error Loading Data</h3>
            <p className="text-muted-foreground">{error}</p>
            <div className="flex gap-2 mt-2">
              {authError ? (
                <Button onClick={handleSignOutAndRedirect}>
                  <LogIn className="mr-2 h-4 w-4" />
                  Sign In Again
                </Button>
              ) : (
                <Button onClick={handleRetry} disabled={isRetrying}>
                  {isRetrying ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Retrying...
                    </>
                  ) : (
                    <>
                      <RefreshCw className="mr-2 h-4 w-4" />
                      Retry
                    </>
                  )}
                </Button>
              )}
              <Button variant="outline" onClick={() => window.location.reload()}>
                Refresh Page
              </Button>
            </div>
          </div>
        </Card>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold">Property Overview</h2>
        <div className="flex gap-2">
          <Link href="/dashboard/landlord/properties/add">
            <Button size="sm">
              <Plus className="mr-2 h-4 w-4" /> Add Property
            </Button>
          </Link>
          <Link href="/dashboard/landlord/rooms/add">
            <Button size="sm" variant="outline">
              <Plus className="mr-2 h-4 w-4" /> Add Room
            </Button>
          </Link>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Properties</CardTitle>
            <Building className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalProperties}</div>
            <p className="text-xs text-muted-foreground">
              {totalProperties === 1 ? "1 property" : `${totalProperties} properties`} in your portfolio
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Rooms</CardTitle>
            <Home className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalRooms}</div>
            <p className="text-xs text-muted-foreground">
              {occupiedRooms} occupied, {vacantRooms} vacant
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Occupancy Rate</CardTitle>
            <Bed className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {totalRooms > 0 ? Math.round((occupiedRooms / totalRooms) * 100) : 0}%
            </div>
            <p className="text-xs text-muted-foreground">
              {occupiedRooms}/{totalRooms} rooms occupied
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Monthly Income</CardTitle>
            <CreditCard className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatCurrency(totalMonthlyIncome)}</div>
            <p className="text-xs text-muted-foreground">
              From {occupiedRooms} occupied {occupiedRooms === 1 ? "room" : "rooms"}
            </p>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Recent Properties</CardTitle>
          </CardHeader>
          <CardContent>
            {properties.length === 0 ? (
              <div className="text-center py-4">
                <Building className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                <h3 className="text-lg font-semibold">No properties yet</h3>
                <p className="text-sm text-muted-foreground mt-2">
                  Add your first property to start managing your rental business.
                </p>
                <Link href="/dashboard/landlord/properties/add" className="mt-4 inline-block">
                  <Button>
                    <Plus className="mr-2 h-4 w-4" /> Add Property
                  </Button>
                </Link>
              </div>
            ) : (
              <div className="space-y-4">
                {properties.slice(0, 3).map((property) => (
                  <div
                    key={property.id}
                    className="flex items-center justify-between border-b pb-4 last:border-0 last:pb-0"
                  >
                    <div className="flex items-center">
                      <div className="mr-4 rounded-full bg-primary/10 p-2">
                        <Building className="h-5 w-5 text-primary" />
                      </div>
                      <div>
                        <p className="font-medium">{property.name}</p>
                        <p className="text-sm text-muted-foreground">
                          {property.address}, {property.city}
                        </p>
                      </div>
                    </div>
                    <Link href={`/dashboard/landlord/properties/${property.id}`}>
                      <Button variant="outline" size="sm">
                        View
                      </Button>
                    </Link>
                  </div>
                ))}
                {properties.length > 3 && (
                  <div className="text-center mt-4">
                    <Link href="/dashboard/landlord/properties">
                      <Button variant="link">View all properties</Button>
                    </Link>
                  </div>
                )}
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Recent Rooms</CardTitle>
          </CardHeader>
          <CardContent>
            {rooms.length === 0 ? (
              <div className="text-center py-4">
                <Bed className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                <h3 className="text-lg font-semibold">No rooms yet</h3>
                <p className="text-sm text-muted-foreground mt-2">
                  Add rooms to your properties to start managing your rental spaces.
                </p>
                <Link href="/dashboard/landlord/rooms/add" className="mt-4 inline-block">
                  <Button>
                    <Plus className="mr-2 h-4 w-4" /> Add Room
                  </Button>
                </Link>
              </div>
            ) : (
              <div className="space-y-4">
                {rooms.slice(0, 3).map((room) => (
                  <div
                    key={room.id}
                    className="flex items-center justify-between border-b pb-4 last:border-0 last:pb-0"
                  >
                    <div className="flex items-center">
                      <div className="mr-4 rounded-full bg-primary/10 p-2">
                        <Bed className="h-5 w-5 text-primary" />
                      </div>
                      <div>
                        <p className="font-medium">{room.name}</p>
                        <p className="text-sm text-muted-foreground">
                          {room.properties?.name} • {formatCurrency(Number(room.rent))}/month
                        </p>
                      </div>
                    </div>
                    <Link href={`/dashboard/landlord/rooms/${room.id}`}>
                      <Button variant="outline" size="sm">
                        View
                      </Button>
                    </Link>
                  </div>
                ))}
                {rooms.length > 3 && (
                  <div className="text-center mt-4">
                    <Link href="/dashboard/landlord/rooms">
                      <Button variant="link">View all rooms</Button>
                    </Link>
                  </div>
                )}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
