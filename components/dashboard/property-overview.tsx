"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Building, Home, Bed, CreditCard, Plus, AlertCircle } from "lucide-react"
import { useToast } from "@/components/ui/use-toast"
import { getProperties } from "@/app/dashboard/landlord/properties/actions"
import { getRooms } from "@/app/dashboard/landlord/rooms/actions"

export function PropertyOverview() {
  const [properties, setProperties] = useState<any[]>([])
  const [rooms, setRooms] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const { toast } = useToast()

  useEffect(() => {
    async function loadData() {
      try {
        setIsLoading(true)
        setError(null)

        // Load properties
        let propertiesData: any[] = []
        try {
          propertiesData = await getProperties()
        } catch (err) {
          console.error("Error loading properties:", err)
          toast({
            title: "Error loading properties",
            description: "Could not load your properties. Please try again.",
            variant: "destructive",
          })
        }

        // Load rooms
        let roomsData: any[] = []
        try {
          roomsData = await getRooms()
        } catch (err) {
          console.error("Error loading rooms:", err)
          toast({
            title: "Error loading rooms",
            description: "Could not load your rooms. Please try again.",
            variant: "destructive",
          })
        }

        setProperties(propertiesData || [])
        setRooms(roomsData || [])
      } catch (error: any) {
        console.error("Error loading dashboard data:", error)
        setError(error.message || "Failed to load dashboard data")
        toast({
          title: "Error loading data",
          description: "Could not load your properties and rooms. Please try again.",
          variant: "destructive",
        })
      } finally {
        setIsLoading(false)
      }
    }

    loadData()
  }, [toast])

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
            <Button onClick={() => window.location.reload()} className="mt-2">
              Retry
            </Button>
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
            <div className="text-2xl font-bold">£{totalMonthlyIncome.toFixed(2)}</div>
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
                          {room.properties?.name} • £{room.rent}/month
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
