"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
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
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Loader2, MoreHorizontal, Search, Filter, UserPlus, User } from "lucide-react"
import { useAuth } from "@/components/mock-auth-provider"
import WithAuthProtection from "@/components/auth/with-auth-protection"
import Link from "next/link"

// Mock tenants data
const mockTenants = [
  {
    id: 1,
    name: "John Smith",
    email: "john.smith@example.com",
    phone: "+44 7123 456789",
    property: "Riverside Apartments",
    room: "Room 2",
    moveInDate: "2023-01-15",
    leaseEnd: "2024-01-14",
    rentAmount: 750,
    status: "Active",
    avatar: "/diverse-group-city.png",
  },
  {
    id: 2,
    name: "Sarah Johnson",
    email: "sarah.johnson@example.com",
    phone: "+44 7234 567890",
    property: "Park House",
    room: "Room 4",
    moveInDate: "2023-03-01",
    leaseEnd: "2024-02-29",
    rentAmount: 850,
    status: "Active",
    avatar: "/contemplative-artist.png",
  },
  {
    id: 3,
    name: "Michael Brown",
    email: "michael.brown@example.com",
    phone: "+44 7345 678901",
    property: "City View Flat",
    room: "Room 1",
    moveInDate: "2022-09-15",
    leaseEnd: "2023-09-14",
    rentAmount: 950,
    status: "Active",
    avatar: "/contemplative-man.png",
  },
  {
    id: 4,
    name: "Emma Wilson",
    email: "emma.wilson@example.com",
    phone: "+44 7456 789012",
    property: "Riverside Apartments",
    room: "Room 1",
    moveInDate: "2023-02-01",
    leaseEnd: "2024-01-31",
    rentAmount: 750,
    status: "Active",
    avatar: "/contemplative-artist.png",
  },
  {
    id: 5,
    name: "David Wilson",
    email: "david.wilson@example.com",
    phone: "+44 7567 890123",
    property: "Garden Cottage",
    room: "Living Room",
    moveInDate: "2022-11-01",
    leaseEnd: "2023-10-31",
    rentAmount: 1200,
    status: "Notice Given",
    avatar: "/contemplative-man.png",
  },
]

export default function LandlordTenantsPage() {
  const { user, isLoading } = useAuth()
  const [tenants, setTenants] = useState(mockTenants)
  const [searchTerm, setSearchTerm] = useState("")

  const filteredTenants = tenants.filter(
    (tenant) =>
      tenant.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      tenant.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      tenant.property.toLowerCase().includes(searchTerm.toLowerCase()) ||
      tenant.room.toLowerCase().includes(searchTerm.toLowerCase()) ||
      tenant.status.toLowerCase().includes(searchTerm.toLowerCase()),
  )

  const activeTenants = filteredTenants.filter((tenant) => tenant.status === "Active")
  const noticeGivenTenants = filteredTenants.filter((tenant) => tenant.status === "Notice Given")

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-[50vh]">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
        <span className="ml-2">Loading tenants...</span>
      </div>
    )
  }

  return (
    <WithAuthProtection requiredRole="landlord">
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold">Tenants</h1>
            <p className="text-muted-foreground">Manage your tenants and their information</p>
          </div>
          <Button>
            <UserPlus className="mr-2 h-4 w-4" /> Add Tenant
          </Button>
        </div>

        <div className="grid gap-4 md:grid-cols-3">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Tenants</CardTitle>
              <User className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{tenants.length}</div>
              <p className="text-xs text-muted-foreground">
                {tenants.length === 1 ? "1 tenant" : `${tenants.length} tenants`} across all properties
              </p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Active Tenants</CardTitle>
              <User className="h-4 w-4 text-green-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{activeTenants.length}</div>
              <p className="text-xs text-muted-foreground">
                {activeTenants.length === 1 ? "1 active tenant" : `${activeTenants.length} active tenants`}
              </p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Notice Given</CardTitle>
              <User className="h-4 w-4 text-amber-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{noticeGivenTenants.length}</div>
              <p className="text-xs text-muted-foreground">
                {noticeGivenTenants.length === 1
                  ? "1 tenant with notice"
                  : `${noticeGivenTenants.length} tenants with notice`}
              </p>
            </CardContent>
          </Card>
        </div>

        <Card>
          <CardHeader>
            <div className="flex justify-between items-center">
              <CardTitle>Tenants</CardTitle>
              <div className="flex gap-2">
                <div className="relative w-64">
                  <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                  <Input
                    type="search"
                    placeholder="Search tenants..."
                    className="pl-8"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                  />
                </div>
                <Button variant="outline" size="sm">
                  <Filter className="mr-2 h-4 w-4" /> Filter
                </Button>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Tenant</TableHead>
                    <TableHead>Property</TableHead>
                    <TableHead>Move In Date</TableHead>
                    <TableHead>Lease End</TableHead>
                    <TableHead>Rent</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredTenants.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={7} className="text-center py-8 text-muted-foreground">
                        No tenants found
                      </TableCell>
                    </TableRow>
                  ) : (
                    filteredTenants.map((tenant) => (
                      <TableRow key={tenant.id}>
                        <TableCell>
                          <div className="flex items-center gap-3">
                            <Avatar className="h-9 w-9">
                              <AvatarImage src={tenant.avatar || "/placeholder.svg"} alt={tenant.name} />
                              <AvatarFallback>
                                {tenant.name
                                  .split(" ")
                                  .map((n) => n[0])
                                  .join("")}
                              </AvatarFallback>
                            </Avatar>
                            <div>
                              <div className="font-medium">{tenant.name}</div>
                              <div className="text-sm text-muted-foreground">{tenant.email}</div>
                            </div>
                          </div>
                        </TableCell>
                        <TableCell>
                          {tenant.property} - {tenant.room}
                        </TableCell>
                        <TableCell>{new Date(tenant.moveInDate).toLocaleDateString()}</TableCell>
                        <TableCell>{new Date(tenant.leaseEnd).toLocaleDateString()}</TableCell>
                        <TableCell>£{tenant.rentAmount}/month</TableCell>
                        <TableCell>
                          <Badge
                            className={
                              tenant.status === "Active"
                                ? "bg-green-500"
                                : tenant.status === "Notice Given"
                                  ? "bg-amber-500"
                                  : "bg-red-500"
                            }
                          >
                            {tenant.status}
                          </Badge>
                        </TableCell>
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
                                <Link href={`/dashboard/landlord/tenants/${tenant.id}`}>View details</Link>
                              </DropdownMenuItem>
                              <DropdownMenuItem>Edit tenant</DropdownMenuItem>
                              <DropdownMenuSeparator />
                              <DropdownMenuItem>Send message</DropdownMenuItem>
                              <DropdownMenuItem>View payments</DropdownMenuItem>
                              <DropdownMenuSeparator />
                              <DropdownMenuItem className="text-destructive">End tenancy</DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>
      </div>
    </WithAuthProtection>
  )
}
