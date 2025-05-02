"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Loader2, MoreHorizontal, Search, Building, Filter, MapPin } from "lucide-react"
import { useAuth } from "@/components/mock-auth-provider"
import WithAuthProtection from "@/components/auth/with-auth-protection"
import { getAllProperties, getAllRooms } from "@/lib/local-storage/storage-service"
import Link from "next/link"

export default function AdminPropertiesPage() {
  const { isLoading: authLoading } = useAuth()
  const [properties, setProperties] = useState<any[]>([])
  const [rooms, setRooms] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState("")
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    async function loadData() {
      try {
        const propertiesData = await getAllProperties()
        const roomsData = await getAllRooms()
        setProperties(propertiesData)
        setRooms(roomsData)
        setIsLoading(false)
      } catch (err) {
        console.error("Error loading properties:", err)
        setError("Failed to load properties")
        setIsLoading(false)
      }
    }

    if (!authLoading) {
      loadData()
    }
  }, [authLoading])

  const filteredProperties = properties.filter(
    (property) =>
      property.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      property.address?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      property.city?.toLowerCase().includes(searchTerm.toLowerCase()),
  )

  if (authLoading || isLoading) {
    return (
      <div className="flex justify-center items-center h-[50vh]">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
        <span className="ml-2">Loading properties...</span>
      </div>
    )
  }

  return (
    <WithAuthProtection requiredRole="admin">
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold">Property Management</h1>
            <p className="text-muted-foreground">Manage all properties in the system</p>
          </div>
          <Button>
            <Building className="mr-2 h-4 w-4" /> Add Property
          </Button>
        </div>

        {error ? (
          <Card className="border-destructive">
            <CardHeader>
              <CardTitle className="text-destructive">Error Loading Properties</CardTitle>
              <CardDescription>There was an error loading properties. Please try again later.</CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">{error}</p>
            </CardContent>
          </Card>
        ) : (
          <>
            <div className="grid gap-6 md:grid-cols-3">
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Total Properties</CardTitle>
                  <Building className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{properties.length}</div>
                  <p className="text-xs text-muted-foreground">
                    {properties.length === 1 ? "1 property" : `${properties.length} properties`} in the system
                  </p>
                </CardContent>
              </Card>
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Total Rooms</CardTitle>
                  <MapPin className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{rooms.length}</div>
                  <p className="text-xs text-muted-foreground">
                    {rooms.length === 1 ? "1 room" : `${rooms.length} rooms`} across all properties
                  </p>
                </CardContent>
              </Card>
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Average Monthly Rent</CardTitle>
                  <Building className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">
                    £
                    {rooms.length > 0
                      ? Math.round(rooms.reduce((sum, room) => sum + (room.rent_amount || 0), 0) / rooms.length)
                      : 0}
                  </div>
                  <p className="text-xs text-muted-foreground">Per room across all properties</p>
                </CardContent>
              </Card>
            </div>

            <Card>
              <CardHeader>
                <CardTitle>Properties</CardTitle>
                <CardDescription>Manage all properties in the system</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex items-center justify-between mb-4">
                  <div className="relative w-full max-w-sm">
                    <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                    <Input
                      type="search"
                      placeholder="Search properties..."
                      className="pl-8"
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                    />
                  </div>
                  <Button variant="outline" size="sm">
                    <Filter className="mr-2 h-4 w-4" /> Filter
                  </Button>
                </div>

                <div className="rounded-md border">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Property</TableHead>
                        <TableHead>Address</TableHead>
                        <TableHead>Rooms</TableHead>
                        <TableHead>Landlord</TableHead>
                        <TableHead className="text-right">Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {filteredProperties.length === 0 ? (
                        <TableRow>
                          <TableCell colSpan={5} className="text-center py-8 text-muted-foreground">
                            No properties found
                          </TableCell>
                        </TableRow>
                      ) : (
                        filteredProperties.map((property) => {
                          const propertyRooms = rooms.filter((room) => room.property_id === property.id)
                          return (
                            <TableRow key={property.id}>
                              <TableCell className="font-medium">{property.name}</TableCell>
                              <TableCell>
                                {property.address}, {property.city}
                              </TableCell>
                              <TableCell>{propertyRooms.length}</TableCell>
                              <TableCell>{property.landlord_name || "Unknown"}</TableCell>
                              <TableCell className="text-right">
                                <DropdownMenu>
                                  <DropdownMenuTrigger asChild>
                                    <Button variant="ghost" size="sm">
                                      <MoreHorizontal className="h-4 w-4" />
                                      <span className="sr-only">Open menu</span>
                                    </Button>
                                  </DropdownMenuTrigger>
                                  <DropdownMenuContent align="end">
                                    <DropdownMenuLabel>Actions</DropdownMenuLabel>
                                    <DropdownMenuItem>
                                      <Link href={`/dashboard/admin/properties/${property.id}`}>View details</Link>
                                    </DropdownMenuItem>
                                    <DropdownMenuItem>Edit property</DropdownMenuItem>
                                    <DropdownMenuSeparator />
                                    <DropdownMenuItem>Manage rooms</DropdownMenuItem>
                                    <DropdownMenuItem className="text-destructive">Delete property</DropdownMenuItem>
                                  </DropdownMenuContent>
                                </DropdownMenu>
                              </TableCell>
                            </TableRow>
                          )
                        })
                      )}
                    </TableBody>
                  </Table>
                </div>
              </CardContent>
            </Card>
          </>
        )}
      </div>
    </WithAuthProtection>
  )
}
