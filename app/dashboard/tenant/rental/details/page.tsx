"use client"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"
import { Loader2, Building, Calendar, CreditCard, FileText, MessageSquare } from "lucide-react"
import { useAuth } from "@/components/mock-auth-provider"
import WithAuthProtection from "@/components/auth/with-auth-protection"

export default function TenantRentalDetailsPage() {
  const { user, isLoading } = useAuth()

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
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold">Rental Details</h1>
            <p className="text-muted-foreground">Complete information about your current rental</p>
          </div>
          <div className="flex gap-2">
            <Button variant="outline">
              <FileText className="mr-2 h-4 w-4" /> View Lease
            </Button>
            <Button>
              <MessageSquare className="mr-2 h-4 w-4" /> Contact Landlord
            </Button>
          </div>
        </div>

        <div className="grid gap-6 md:grid-cols-3">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Monthly Rent</CardTitle>
              <CreditCard className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">£750.00</div>
              <p className="text-xs text-muted-foreground">Due on the 1st of each month</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Lease End Date</CardTitle>
              <Calendar className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">January 14, 2024</div>
              <p className="text-xs text-muted-foreground">120 days remaining</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Security Deposit</CardTitle>
              <Building className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">£900.00</div>
              <p className="text-xs text-muted-foreground">Protected with DPS</p>
            </CardContent>
          </Card>
        </div>

        <Tabs defaultValue="property" className="space-y-4">
          <TabsList>
            <TabsTrigger value="property">Property Details</TabsTrigger>
            <TabsTrigger value="lease">Lease Information</TabsTrigger>
            <TabsTrigger value="utilities">Utilities & Bills</TabsTrigger>
            <TabsTrigger value="rules">House Rules</TabsTrigger>
          </TabsList>

          <TabsContent value="property" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Property Information</CardTitle>
                <CardDescription>Details about your current accommodation</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="flex flex-col md:flex-row gap-6">
                  <div className="md:w-1/3">
                    <img
                      src="/minimalist-city-apartment.png"
                      alt="Riverside Apartments"
                      className="rounded-lg w-full h-auto object-cover"
                    />
                  </div>
                  <div className="md:w-2/3 space-y-4">
                    <div>
                      <h3 className="text-lg font-semibold">Riverside Apartments - Room 3</h3>
                      <p className="text-muted-foreground">123 River Road, London, SW1 2AB</p>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <p className="text-sm font-medium">Property Type</p>
                        <p className="text-sm text-muted-foreground">Shared House</p>
                      </div>
                      <div>
                        <p className="text-sm font-medium">Room Type</p>
                        <p className="text-sm text-muted-foreground">Double Room (Shared)</p>
                      </div>
                      <div>
                        <p className="text-sm font-medium">Floor</p>
                        <p className="text-sm text-muted-foreground">2nd Floor</p>
                      </div>
                      <div>
                        <p className="text-sm font-medium">Room Size</p>
                        <p className="text-sm text-muted-foreground">14 sq m</p>
                      </div>
                    </div>

                    <div>
                      <p className="text-sm font-medium">Amenities</p>
                      <div className="flex flex-wrap gap-2 mt-1">
                        <Badge variant="outline">WiFi</Badge>
                        <Badge variant="outline">Heating</Badge>
                        <Badge variant="outline">Washing Machine</Badge>
                        <Badge variant="outline">Shared Kitchen</Badge>
                        <Badge variant="outline">Shared Bathroom</Badge>
                        <Badge variant="outline">Furnished</Badge>
                        <Badge variant="outline">TV</Badge>
                        <Badge variant="outline">Fridge</Badge>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="space-y-4">
                  <h3 className="text-lg font-semibold">Property Description</h3>
                  <p className="text-sm text-muted-foreground">
                    Riverside Apartments is a modern shared accommodation located in the heart of London, just a
                    5-minute walk from the Thames River. The property features 6 bedrooms spread across 3 floors, with
                    shared kitchen and bathroom facilities on each floor.
                  </p>
                  <p className="text-sm text-muted-foreground">
                    Your room (Room 3) is a spacious double room on the second floor, featuring a comfortable double
                    bed, wardrobe, desk, chair, and bedside table. The room has large windows providing plenty of
                    natural light and a pleasant view of the street.
                  </p>
                </div>

                <div className="space-y-4">
                  <h3 className="text-lg font-semibold">Location & Transport</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <p className="text-sm font-medium">Nearest Tube Station</p>
                      <p className="text-sm text-muted-foreground">Waterloo Station (0.5 miles)</p>
                    </div>
                    <div>
                      <p className="text-sm font-medium">Bus Routes</p>
                      <p className="text-sm text-muted-foreground">76, 341, 521 (2 minute walk)</p>
                    </div>
                    <div>
                      <p className="text-sm font-medium">Nearby Amenities</p>
                      <p className="text-sm text-muted-foreground">Supermarket, Pharmacy, Restaurants, Gym, Park</p>
                    </div>
                    <div>
                      <p className="text-sm font-medium">Distance to City Center</p>
                      <p className="text-sm text-muted-foreground">1.2 miles</p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="lease" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Lease Information</CardTitle>
                <CardDescription>Details about your tenancy agreement</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-4">
                    <div>
                      <h3 className="text-lg font-semibold">Lease Terms</h3>
                      <div className="grid grid-cols-2 gap-4 mt-2">
                        <div>
                          <p className="text-sm font-medium">Lease Type</p>
                          <p className="text-sm text-muted-foreground">Assured Shorthold Tenancy</p>
                        </div>
                        <div>
                          <p className="text-sm font-medium">Lease Duration</p>
                          <p className="text-sm text-muted-foreground">12 months</p>
                        </div>
                        <div>
                          <p className="text-sm font-medium">Start Date</p>
                          <p className="text-sm text-muted-foreground">January 15, 2023</p>
                        </div>
                        <div>
                          <p className="text-sm font-medium">End Date</p>
                          <p className="text-sm text-muted-foreground">January 14, 2024</p>
                        </div>
                        <div>
                          <p className="text-sm font-medium">Notice Period</p>
                          <p className="text-sm text-muted-foreground">2 months</p>
                        </div>
                        <div>
                          <p className="text-sm font-medium">Break Clause</p>
                          <p className="text-sm text-muted-foreground">After 6 months</p>
                        </div>
                      </div>
                    </div>

                    <div>
                      <h3 className="text-lg font-semibold">Financial Information</h3>
                      <div className="grid grid-cols-2 gap-4 mt-2">
                        <div>
                          <p className="text-sm font-medium">Monthly Rent</p>
                          <p className="text-sm text-muted-foreground">£750.00</p>
                        </div>
                        <div>
                          <p className="text-sm font-medium">Payment Due Date</p>
                          <p className="text-sm text-muted-foreground">1st of each month</p>
                        </div>
                        <div>
                          <p className="text-sm font-medium">Security Deposit</p>
                          <p className="text-sm text-muted-foreground">£900.00</p>
                        </div>
                        <div>
                          <p className="text-sm font-medium">Deposit Scheme</p>
                          <p className="text-sm text-muted-foreground">Deposit Protection Service (DPS)</p>
                        </div>
                        <div>
                          <p className="text-sm font-medium">Late Payment Fee</p>
                          <p className="text-sm text-muted-foreground">£25 after 5 days</p>
                        </div>
                        <div>
                          <p className="text-sm font-medium">Payment Method</p>
                          <p className="text-sm text-muted-foreground">Direct Debit</p>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="space-y-4">
                    <div>
                      <h3 className="text-lg font-semibold">Landlord Information</h3>
                      <div className="grid grid-cols-1 gap-4 mt-2">
                        <div>
                          <p className="text-sm font-medium">Landlord Name</p>
                          <p className="text-sm text-muted-foreground">John Williams</p>
                        </div>
                        <div>
                          <p className="text-sm font-medium">Contact Email</p>
                          <p className="text-sm text-muted-foreground">john.williams@example.com</p>
                        </div>
                        <div>
                          <p className="text-sm font-medium">Contact Phone</p>
                          <p className="text-sm text-muted-foreground">+44 7123 456789</p>
                        </div>
                        <div>
                          <p className="text-sm font-medium">Emergency Contact</p>
                          <p className="text-sm text-muted-foreground">+44 7123 456790</p>
                        </div>
                      </div>
                    </div>

                    <div>
                      <h3 className="text-lg font-semibold">Renewal Information</h3>
                      <div className="grid grid-cols-1 gap-4 mt-2">
                        <div>
                          <p className="text-sm font-medium">Renewal Notice</p>
                          <p className="text-sm text-muted-foreground">2 months before end date</p>
                        </div>
                        <div>
                          <p className="text-sm font-medium">Renewal Deadline</p>
                          <p className="text-sm text-muted-foreground">November 14, 2023</p>
                        </div>
                        <div>
                          <p className="text-sm font-medium">Expected Rent Increase</p>
                          <p className="text-sm text-muted-foreground">Up to 3% (to be confirmed)</p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="flex justify-end">
                  <Button variant="outline">
                    <FileText className="mr-2 h-4 w-4" /> Download Lease Agreement
                  </Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="utilities" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Utilities & Bills</CardTitle>
                <CardDescription>Information about utilities and bills for your rental</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-4">
                    <div>
                      <h3 className="text-lg font-semibold">Included in Rent</h3>
                      <div className="grid grid-cols-2 gap-4 mt-2">
                        <div>
                          <p className="text-sm font-medium">Water</p>
                          <p className="text-sm text-green-500">Included</p>
                        </div>
                        <div>
                          <p className="text-sm font-medium">Council Tax</p>
                          <p className="text-sm text-green-500">Included</p>
                        </div>
                        <div>
                          <p className="text-sm font-medium">Internet</p>
                          <p className="text-sm text-green-500">Included</p>
                        </div>
                        <div>
                          <p className="text-sm font-medium">TV License</p>
                          <p className="text-sm text-green-500">Included</p>
                        </div>
                      </div>
                    </div>

                    <div>
                      <h3 className="text-lg font-semibold">Not Included in Rent</h3>
                      <div className="grid grid-cols-2 gap-4 mt-2">
                        <div>
                          <p className="text-sm font-medium">Electricity</p>
                          <p className="text-sm text-red-500">Not Included</p>
                        </div>
                        <div>
                          <p className="text-sm font-medium">Gas</p>
                          <p className="text-sm text-red-500">Not Included</p>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="space-y-4">
                    <div>
                      <h3 className="text-lg font-semibold">Utility Providers</h3>
                      <div className="grid grid-cols-1 gap-4 mt-2">
                        <div>
                          <p className="text-sm font-medium">Electricity Provider</p>
                          <p className="text-sm text-muted-foreground">British Gas</p>
                        </div>
                        <div>
                          <p className="text-sm font-medium">Gas Provider</p>
                          <p className="text-sm text-muted-foreground">British Gas</p>
                        </div>
                        <div>
                          <p className="text-sm font-medium">Internet Provider</p>
                          <p className="text-sm text-muted-foreground">Virgin Media (200 Mbps)</p>
                        </div>
                      </div>
                    </div>

                    <div>
                      <h3 className="text-lg font-semibold">Estimated Monthly Costs</h3>
                      <div className="grid grid-cols-1 gap-4 mt-2">
                        <div>
                          <p className="text-sm font-medium">Electricity (per person)</p>
                          <p className="text-sm text-muted-foreground">£40-60 per month</p>
                        </div>
                        <div>
                          <p className="text-sm font-medium">Gas (per person)</p>
                          <p className="text-sm text-muted-foreground">£30-50 per month</p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                <div>
                  <h3 className="text-lg font-semibold">Payment Information</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-2">
                    <div>
                      <p className="text-sm font-medium">Billing Cycle</p>
                      <p className="text-sm text-muted-foreground">Monthly</p>
                    </div>
                    <div>
                      <p className="text-sm font-medium">Payment Method</p>
                      <p className="text-sm text-muted-foreground">Split equally between tenants</p>
                    </div>
                    <div>
                      <p className="text-sm font-medium">Payment Due Date</p>
                      <p className="text-sm text-muted-foreground">15th of each month</p>
                    </div>
                    <div>
                      <p className="text-sm font-medium">Bill Management</p>
                      <p className="text-sm text-muted-foreground">Managed by tenants</p>
                    </div>
                  </div>
                </div>

                <div className="bg-muted p-4 rounded-lg">
                  <h3 className="text-sm font-semibold">Important Note</h3>
                  <p className="text-sm text-muted-foreground mt-1">
                    All utility bills are to be split equally between the tenants. It is your responsibility to ensure
                    that bills are paid on time. Any late payment fees incurred will be shared among all tenants.
                  </p>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="rules" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>House Rules</CardTitle>
                <CardDescription>Guidelines and rules for living in the property</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-4">
                  <div>
                    <h3 className="text-lg font-semibold">General Rules</h3>
                    <ul className="list-disc pl-5 mt-2 space-y-2 text-sm text-muted-foreground">
                      <li>Quiet hours are from 11:00 PM to 7:00 AM on weekdays and until 9:00 AM on weekends.</li>
                      <li>
                        No smoking is allowed inside the property. Smoking is only permitted in designated outdoor
                        areas.
                      </li>
                      <li>
                        Guests are welcome but should not stay for more than 3 consecutive nights without prior
                        approval.
                      </li>
                      <li>All common areas must be kept clean and tidy at all times.</li>
                      <li>Respect the privacy and personal space of other tenants.</li>
                    </ul>
                  </div>

                  <div>
                    <h3 className="text-lg font-semibold">Kitchen Rules</h3>
                    <ul className="list-disc pl-5 mt-2 space-y-2 text-sm text-muted-foreground">
                      <li>Clean up immediately after using the kitchen.</li>
                      <li>Label your food items in the refrigerator and respect others' belongings.</li>
                      <li>Do not leave dirty dishes in the sink overnight.</li>
                      <li>Take turns emptying the trash when it's full.</li>
                      <li>Report any appliance issues to the landlord immediately.</li>
                    </ul>
                  </div>

                  <div>
                    <h3 className="text-lg font-semibold">Bathroom Rules</h3>
                    <ul className="list-disc pl-5 mt-2 space-y-2 text-sm text-muted-foreground">
                      <li>Keep the bathroom clean after use.</li>
                      <li>Do not leave personal items in the shared bathroom.</li>
                      <li>Report any plumbing issues immediately.</li>
                      <li>Be mindful of water usage, especially during peak hours.</li>
                    </ul>
                  </div>

                  <div>
                    <h3 className="text-lg font-semibold">Maintenance & Repairs</h3>
                    <ul className="list-disc pl-5 mt-2 space-y-2 text-sm text-muted-foreground">
                      <li>Report any maintenance issues promptly through the tenant portal.</li>
                      <li>Do not attempt major repairs yourself without landlord approval.</li>
                      <li>Allow access for scheduled maintenance with reasonable notice.</li>
                      <li>Keep all areas accessible for emergency repairs.</li>
                    </ul>
                  </div>

                  <div>
                    <h3 className="text-lg font-semibold">Safety & Security</h3>
                    <ul className="list-disc pl-5 mt-2 space-y-2 text-sm text-muted-foreground">
                      <li>Always lock the doors and windows when leaving the property.</li>
                      <li>Do not share entry codes or keys with non-tenants.</li>
                      <li>Ensure fire safety equipment remains accessible and undamaged.</li>
                      <li>Report any suspicious activity to the landlord and authorities if necessary.</li>
                    </ul>
                  </div>
                </div>

                <div className="bg-muted p-4 rounded-lg">
                  <h3 className="text-sm font-semibold">Important Note</h3>
                  <p className="text-sm text-muted-foreground mt-1">
                    Repeated violations of house rules may result in warnings and could affect your tenancy renewal. If
                    you have any questions or concerns about these rules, please contact your landlord.
                  </p>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </WithAuthProtection>
  )
}
