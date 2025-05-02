"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { useToast } from "@/components/ui/use-toast"
import { useAuth } from "@/components/mock-auth-provider"
import { Loader2, Eye } from "lucide-react"

// Mock tenancy data
const MOCK_TENANCIES = [
  {
    id: "tenancy1",
    listing: {
      id: "listing1",
      title: "Spacious 3-bedroom house in North London",
    },
    room: {
      id: "room1",
      name: "Master Bedroom",
    },
    tenant: {
      id: "tenant1",
      name: "John Doe",
    },
    landlord: {
      id: "landlord1",
      name: "Jane Smith",
    },
    rent: 800,
    deposit: 1200,
    start_date: "2023-01-01",
    end_date: "2024-01-01",
    status: "active",
  },
  {
    id: "tenancy2",
    listing: {
      id: "listing2",
      title: "Modern 2-bedroom flat in East London",
    },
    room: {
      id: "room2",
      name: "Double Room",
    },
    tenant: {
      id: "tenant2",
      name: "Alice Johnson",
    },
    landlord: {
      id: "landlord1",
      name: "Jane Smith",
    },
    rent: 700,
    deposit: 1050,
    start_date: "2023-02-15",
    end_date: "2023-08-15",
    status: "ended",
  },
]

export function TenancyDashboard() {
  const [tenancies, setTenancies] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)

  const { toast } = useToast()
  const { user, userRole } = useAuth()

  useEffect(() => {
    const fetchTenancies = async () => {
      try {
        // In a real app, this would be an API call
        await new Promise((resolve) => setTimeout(resolve, 1000))

        // Filter tenancies based on user role
        let filteredTenancies = [...MOCK_TENANCIES]

        if (userRole === "tenant") {
          filteredTenancies = filteredTenancies.filter((t) => t.tenant.id === user?.id)
        } else if (userRole === "landlord") {
          filteredTenancies = filteredTenancies.filter((t) => t.landlord.id === user?.id)
        }

        setTenancies(filteredTenancies)
      } catch (error) {
        toast({
          title: "Error",
          description: "Failed to load tenancies. Please try again.",
          variant: "destructive",
        })
      } finally {
        setIsLoading(false)
      }
    }

    fetchTenancies()
  }, [toast, user, userRole])

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    )
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Your Tenancies</CardTitle>
        <CardDescription>
          {userRole === "tenant" ? "View your current and past tenancies" : "Manage tenancies for your properties"}
        </CardDescription>
      </CardHeader>
      <CardContent>
        {tenancies.length === 0 ? (
          <div className="text-center py-6">
            <p className="text-muted-foreground mb-4">You don't have any tenancies yet.</p>
            {userRole === "tenant" && (
              <Button asChild>
                <Link href="/listings">Browse Listings</Link>
              </Button>
            )}
          </div>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Property</TableHead>
                <TableHead>Room</TableHead>
                {userRole === "landlord" && <TableHead>Tenant</TableHead>}
                {userRole === "tenant" && <TableHead>Landlord</TableHead>}
                <TableHead>Rent</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Period</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {tenancies.map((tenancy) => (
                <TableRow key={tenancy.id}>
                  <TableCell>{tenancy.listing.title}</TableCell>
                  <TableCell>{tenancy.room.name}</TableCell>
                  {userRole === "landlord" && <TableCell>{tenancy.tenant.name}</TableCell>}
                  {userRole === "tenant" && <TableCell>{tenancy.landlord.name}</TableCell>}
                  <TableCell>£{tenancy.rent}/month</TableCell>
                  <TableCell>
                    <Badge variant={tenancy.status === "active" ? "default" : "secondary"}>
                      {tenancy.status === "active" ? "Active" : "Ended"}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    {new Date(tenancy.start_date).toLocaleDateString()} -{" "}
                    {new Date(tenancy.end_date).toLocaleDateString()}
                  </TableCell>
                  <TableCell>
                    <Button asChild variant="ghost" size="sm">
                      <Link href={`/tenancy/${tenancy.id}`}>
                        <Eye className="h-4 w-4 mr-2" /> View
                      </Link>
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
      </CardContent>
    </Card>
  )
}
