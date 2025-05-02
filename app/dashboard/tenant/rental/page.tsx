"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import {
  Loader2,
  Calendar,
  FileText,
  Download,
  MapPin,
  Phone,
  Mail,
  Clock,
  User,
  CreditCard,
  MessageSquare,
} from "lucide-react"
import { useAuth } from "@/components/mock-auth-provider"
import WithAuthProtection from "@/components/auth/with-auth-protection"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Progress } from "@/components/ui/progress"

// Mock rental data
const mockRental = {
  id: 1,
  property: {
    id: 1,
    name: "Cozy City Apartment",
    address: "123 Main Street, London, SW1A 1AA",
    type: "Apartment",
    bedrooms: 2,
    bathrooms: 1,
    images: ["/cozy-city-apartment.png"],
  },
  landlord: {
    id: "landlord-1",
    name: "John Smith",
    email: "john.smith@example.com",
    phone: "+44 7700 900123",
  },
  lease: {
    id: "lease-1",
    startDate: "2023-01-01",
    endDate: "2024-01-01",
    rentAmount: 750,
    depositAmount: 900,
    paymentDueDay: 1,
    leaseType: "Fixed Term",
    leaseDocument: "lease-agreement.pdf",
  },
  moveInDate: "2023-01-01",
  status: "Active",
}

export default function TenantRentalPage() {
  const { user, isLoading } = useAuth()
  const [rental, setRental] = useState(mockRental)

  // Calculate lease progress
  const startDate = new Date(rental.lease.startDate)
  const endDate = new Date(rental.lease.endDate)
  const today = new Date()
  const totalDays = (endDate.getTime() - startDate.getTime()) / (1000 * 3600 * 24)
  const daysElapsed = (today.getTime() - startDate.getTime()) / (1000 * 3600 * 24)
  const leaseProgress = Math.min(Math.max(Math.round((daysElapsed / totalDays) * 100), 0), 100)

  // Calculate days remaining
  const daysRemaining = Math.max(Math.ceil((endDate.getTime() - today.getTime()) / (1000 * 3600 * 24)), 0)

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-[50vh]">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
        <span className="ml-2">Loading rental details...</span>
      </div>
    )
  }

  return (
    <WithAuthProtection requiredRole="tenant">
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold">Rental Details</h1>
          <p className="text-muted-foreground">View information about your current rental property</p>
        </div>

        <div className="grid gap-6 md:grid-cols-3">
          <Card className="md:col-span-2">
            <CardHeader>
              <CardTitle>{rental.property.name}</CardTitle>
              <CardDescription>
                <div className="flex items-center">
                  <MapPin className="h-4 w-4 mr-1" />
                  {rental.property.address}
                </div>
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="aspect-video overflow-hidden rounded-lg mb-4">
                <img
                  src={rental.property.images[0] || "/placeholder.svg"}
                  alt={rental.property.name}
                  className="w-full h-full object-cover"
                />
              </div>

              <div className="grid gap-4 md:grid-cols-3">
                <div className="space-y-1">
                  <p className="text-sm text-muted-foreground">Property Type</p>
                  <p className="font-medium">{rental.property.type}</p>
                </div>
                <div className="space-y-1">
                  <p className="text-sm text-muted-foreground">Bedrooms</p>
                  <p className="font-medium">{rental.property.bedrooms}</p>
                </div>
                <div className="space-y-1">
                  <p className="text-sm text-muted-foreground">Bathrooms</p>
                  <p className="font-medium">{rental.property.bathrooms}</p>
                </div>
              </div>

              <Separator className="my-6" />

              <div className="space-y-4">
                <h3 className="text-lg font-medium">Lease Information</h3>

                <div className="space-y-2">
                  <div className="flex justify-between items-center">
                    <p className="text-sm text-muted-foreground">Lease Progress</p>
                    <p className="text-sm font-medium">{leaseProgress}%</p>
                  </div>
                  <Progress value={leaseProgress} className="h-2" />
                  <p className="text-xs text-muted-foreground text-right">
                    {daysRemaining} days remaining until lease end
                  </p>
                </div>

                <div className="grid gap-4 md:grid-cols-2">
                  <div className="space-y-1">
                    <p className="text-sm text-muted-foreground">Lease Type</p>
                    <p className="font-medium">{rental.lease.leaseType}</p>
                  </div>
                  <div className="space-y-1">
                    <p className="text-sm text-muted-foreground">Status</p>
                    <Badge className="bg-green-500">{rental.status}</Badge>
                  </div>
                  <div className="space-y-1">
                    <p className="text-sm text-muted-foreground">Start Date</p>
                    <p className="font-medium">{new Date(rental.lease.startDate).toLocaleDateString()}</p>
                  </div>
                  <div className="space-y-1">
                    <p className="text-sm text-muted-foreground">End Date</p>
                    <p className="font-medium">{new Date(rental.lease.endDate).toLocaleDateString()}</p>
                  </div>
                  <div className="space-y-1">
                    <p className="text-sm text-muted-foreground">Monthly Rent</p>
                    <p className="font-medium">£{rental.lease.rentAmount}</p>
                  </div>
                  <div className="space-y-1">
                    <p className="text-sm text-muted-foreground">Security Deposit</p>
                    <p className="font-medium">£{rental.lease.depositAmount}</p>
                  </div>
                </div>

                <div className="flex justify-end">
                  <Dialog>
                    <DialogTrigger asChild>
                      <Button variant="outline">
                        <FileText className="mr-2 h-4 w-4" />
                        View Lease Agreement
                      </Button>
                    </DialogTrigger>
                    <DialogContent className="sm:max-w-[600px]">
                      <DialogHeader>
                        <DialogTitle>Lease Agreement</DialogTitle>
                        <DialogDescription>Lease agreement for {rental.property.name}</DialogDescription>
                      </DialogHeader>
                      <div className="space-y-4">
                        <div className="border rounded-lg p-4 bg-muted/50">
                          <div className="flex items-center justify-between">
                            <div className="flex items-center">
                              <FileText className="h-8 w-8 mr-2 text-primary" />
                              <div>
                                <p className="font-medium">{rental.lease.leaseDocument}</p>
                                <p className="text-xs text-muted-foreground">
                                  Signed on {new Date(rental.lease.startDate).toLocaleDateString()}
                                </p>
                              </div>
                            </div>
                            <Button variant="outline" size="sm">
                              <Download className="h-4 w-4 mr-2" />
                              Download
                            </Button>
                          </div>
                        </div>
                        <div className="space-y-2">
                          <h3 className="text-lg font-medium">Lease Summary</h3>
                          <div className="grid grid-cols-2 gap-4">
                            <div>
                              <p className="text-sm font-medium">Property Address:</p>
                              <p className="text-sm">{rental.property.address}</p>
                            </div>
                            <div>
                              <p className="text-sm font-medium">Lease Period:</p>
                              <p className="text-sm">
                                {new Date(rental.lease.startDate).toLocaleDateString()} to{" "}
                                {new Date(rental.lease.endDate).toLocaleDateString()}
                              </p>
                            </div>
                            <div>
                              <p className="text-sm font-medium">Monthly Rent:</p>
                              <p className="text-sm">£{rental.lease.rentAmount}</p>
                            </div>
                            <div>
                              <p className="text-sm font-medium">Security Deposit:</p>
                              <p className="text-sm">£{rental.lease.depositAmount}</p>
                            </div>
                          </div>
                        </div>
                      </div>
                    </DialogContent>
                  </Dialog>
                </div>
              </div>
            </CardContent>
          </Card>

          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Landlord Information</CardTitle>
                <CardDescription>Contact details for your landlord</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-center space-x-4">
                    <div className="rounded-full bg-primary/10 p-2">
                      <User className="h-5 w-5 text-primary" />
                    </div>
                    <div>
                      <p className="font-medium">{rental.landlord.name}</p>
                      <p className="text-sm text-muted-foreground">Property Owner</p>
                    </div>
                  </div>

                  <Separator />

                  <div className="space-y-2">
                    <div className="flex items-center">
                      <Phone className="h-4 w-4 mr-2 text-muted-foreground" />
                      <p>{rental.landlord.phone}</p>
                    </div>
                    <div className="flex items-center">
                      <Mail className="h-4 w-4 mr-2 text-muted-foreground" />
                      <p>{rental.landlord.email}</p>
                    </div>
                  </div>

                  <Button className="w-full">Contact Landlord</Button>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Important Dates</CardTitle>
                <CardDescription>Key dates for your tenancy</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center">
                      <Calendar className="h-4 w-4 mr-2 text-muted-foreground" />
                      <div>
                        <p className="text-sm font-medium">Move-in Date</p>
                        <p className="text-xs text-muted-foreground">
                          {new Date(rental.moveInDate).toLocaleDateString()}
                        </p>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center justify-between">
                    <div className="flex items-center">
                      <Calendar className="h-4 w-4 mr-2 text-muted-foreground" />
                      <div>
                        <p className="text-sm font-medium">Lease End Date</p>
                        <p className="text-xs text-muted-foreground">
                          {new Date(rental.lease.endDate).toLocaleDateString()}
                        </p>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center justify-between">
                    <div className="flex items-center">
                      <Clock className="h-4 w-4 mr-2 text-muted-foreground" />
                      <div>
                        <p className="text-sm font-medium">Rent Due Date</p>
                        <p className="text-xs text-muted-foreground">1st of each month</p>
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Quick Actions</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <Button variant="outline" className="w-full justify-start">
                    <FileText className="mr-2 h-4 w-4" />
                    Submit Maintenance Request
                  </Button>
                  <Button variant="outline" className="w-full justify-start">
                    <CreditCard className="mr-2 h-4 w-4" />
                    Make a Payment
                  </Button>
                  <Button variant="outline" className="w-full justify-start">
                    <MessageSquare className="mr-2 h-4 w-4" />
                    Message Landlord
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </WithAuthProtection>
  )
}
