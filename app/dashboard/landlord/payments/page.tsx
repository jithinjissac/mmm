"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"
import { Loader2, Search, Filter, DollarSign, CheckCircle, AlertCircle, Calendar } from "lucide-react"
import { useAuth } from "@/components/mock-auth-provider"
import WithAuthProtection from "@/components/auth/with-auth-protection"
import Link from "next/link"

// Mock payments data
const mockPayments = [
  {
    id: 1,
    tenant: "John Smith",
    property: "Riverside Apartments",
    room: "Room 2",
    amount: 850,
    status: "Paid",
    dueDate: "2023-06-01",
    paidDate: "2023-05-28",
    paymentMethod: "Bank Transfer",
    reference: "INV-2023-001",
  },
  {
    id: 2,
    tenant: "Michael Brown",
    property: "City View Flat",
    room: "Room 1",
    amount: 950,
    status: "Overdue",
    dueDate: "2023-05-15",
    paidDate: null,
    paymentMethod: null,
    reference: "INV-2023-002",
  },
  {
    id: 3,
    tenant: "Sarah Johnson",
    property: "Park House",
    room: "Room 4",
    amount: 750,
    status: "Upcoming",
    dueDate: "2023-06-15",
    paidDate: null,
    paymentMethod: null,
    reference: "INV-2023-003",
  },
  {
    id: 4,
    tenant: "David Wilson",
    property: "Garden Cottage",
    room: "Living Room",
    amount: 1200,
    status: "Upcoming",
    dueDate: "2023-06-10",
    paidDate: null,
    paymentMethod: null,
    reference: "INV-2023-004",
  },
  {
    id: 5,
    tenant: "Emma Wilson",
    property: "Riverside Apartments",
    room: "Room 3",
    amount: 850,
    status: "Paid",
    dueDate: "2023-05-01",
    paidDate: "2023-04-29",
    paymentMethod: "Credit Card",
    reference: "INV-2023-005",
  },
]

export default function LandlordPaymentsPage() {
  const { user, isLoading } = useAuth()
  const [payments, setPayments] = useState(mockPayments)
  const [searchTerm, setSearchTerm] = useState("")

  const filteredPayments = payments.filter(
    (payment) =>
      payment.tenant.toLowerCase().includes(searchTerm.toLowerCase()) ||
      payment.property.toLowerCase().includes(searchTerm.toLowerCase()) ||
      payment.reference.toLowerCase().includes(searchTerm.toLowerCase()) ||
      payment.status.toLowerCase().includes(searchTerm.toLowerCase()),
  )

  const paidPayments = filteredPayments.filter((payment) => payment.status === "Paid")
  const overduePayments = filteredPayments.filter((payment) => payment.status === "Overdue")
  const upcomingPayments = filteredPayments.filter((payment) => payment.status === "Upcoming")

  // Calculate total amounts
  const totalPaid = paidPayments.reduce((sum, payment) => sum + payment.amount, 0)
  const totalOverdue = overduePayments.reduce((sum, payment) => sum + payment.amount, 0)
  const totalUpcoming = upcomingPayments.reduce((sum, payment) => sum + payment.amount, 0)

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-[50vh]">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
        <span className="ml-2">Loading payment data...</span>
      </div>
    )
  }

  return (
    <WithAuthProtection requiredRole="landlord">
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold">Payments</h1>
            <p className="text-muted-foreground">Manage and track rent payments from your tenants</p>
          </div>
          <Link href="/dashboard/landlord/payments/new">
            <Button>
              <DollarSign className="mr-2 h-4 w-4" /> Create Invoice
            </Button>
          </Link>
        </div>

        <div className="grid gap-4 md:grid-cols-3">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Paid</CardTitle>
              <CheckCircle className="h-4 w-4 text-green-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">£{totalPaid.toLocaleString()}</div>
              <p className="text-xs text-muted-foreground">{paidPayments.length} payments received</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Overdue</CardTitle>
              <AlertCircle className="h-4 w-4 text-red-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">£{totalOverdue.toLocaleString()}</div>
              <p className="text-xs text-muted-foreground">{overduePayments.length} payments overdue</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Upcoming</CardTitle>
              <Calendar className="h-4 w-4 text-blue-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">£{totalUpcoming.toLocaleString()}</div>
              <p className="text-xs text-muted-foreground">{upcomingPayments.length} payments due</p>
            </CardContent>
          </Card>
        </div>

        <Card>
          <CardHeader>
            <div className="flex justify-between items-center">
              <CardTitle>Payment History</CardTitle>
              <div className="flex gap-2">
                <div className="relative w-64">
                  <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                  <Input
                    type="search"
                    placeholder="Search payments..."
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
            <Tabs defaultValue="all" className="space-y-4">
              <TabsList>
                <TabsTrigger value="all">All Payments</TabsTrigger>
                <TabsTrigger value="paid">Paid</TabsTrigger>
                <TabsTrigger value="overdue">Overdue</TabsTrigger>
                <TabsTrigger value="upcoming">Upcoming</TabsTrigger>
              </TabsList>

              <TabsContent value="all" className="space-y-4">
                {filteredPayments.length === 0 ? (
                  <div className="text-center py-8 text-muted-foreground">No payments found</div>
                ) : (
                  <div className="space-y-4">
                    {filteredPayments.map((payment) => (
                      <div key={payment.id} className="border rounded-lg p-4">
                        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                          <div className="space-y-1">
                            <div className="flex items-center gap-2">
                              <DollarSign className="h-5 w-5 text-primary" />
                              <h4 className="font-semibold">
                                {payment.reference} - £{payment.amount.toLocaleString()}
                              </h4>
                            </div>
                            <p className="text-sm text-muted-foreground">
                              {payment.property} - {payment.room}
                            </p>
                            <p className="text-sm text-muted-foreground">Tenant: {payment.tenant}</p>
                          </div>
                          <div className="flex items-center gap-2">
                            {payment.status === "Paid" ? (
                              <CheckCircle className="h-5 w-5 text-green-500" />
                            ) : payment.status === "Overdue" ? (
                              <AlertCircle className="h-5 w-5 text-red-500" />
                            ) : (
                              <Calendar className="h-5 w-5 text-blue-500" />
                            )}
                            <Badge
                              className={
                                payment.status === "Paid"
                                  ? "bg-green-500"
                                  : payment.status === "Overdue"
                                    ? "bg-red-500"
                                    : "bg-blue-500"
                              }
                            >
                              {payment.status}
                            </Badge>
                          </div>
                        </div>
                        <div className="mt-4 grid gap-2 text-sm">
                          <p>
                            <span className="font-medium">Due Date:</span>{" "}
                            {new Date(payment.dueDate).toLocaleDateString()}
                          </p>
                          {payment.paidDate && (
                            <p>
                              <span className="font-medium">Paid Date:</span>{" "}
                              {new Date(payment.paidDate).toLocaleDateString()}
                            </p>
                          )}
                          {payment.paymentMethod && (
                            <p>
                              <span className="font-medium">Payment Method:</span> {payment.paymentMethod}
                            </p>
                          )}
                        </div>
                        <div className="mt-4 flex justify-end">
                          <Link href={`/dashboard/landlord/payments/${payment.id}`}>
                            <Button variant="outline" size="sm">
                              View Details
                            </Button>
                          </Link>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </TabsContent>

              <TabsContent value="paid" className="space-y-4">
                {paidPayments.length === 0 ? (
                  <div className="text-center py-8 text-muted-foreground">No paid payments found</div>
                ) : (
                  <div className="space-y-4">
                    {paidPayments.map((payment) => (
                      <div key={payment.id} className="border rounded-lg p-4">
                        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                          <div className="space-y-1">
                            <div className="flex items-center gap-2">
                              <DollarSign className="h-5 w-5 text-primary" />
                              <h4 className="font-semibold">
                                {payment.reference} - £{payment.amount.toLocaleString()}
                              </h4>
                            </div>
                            <p className="text-sm text-muted-foreground">
                              {payment.property} - {payment.room}
                            </p>
                            <p className="text-sm text-muted-foreground">Tenant: {payment.tenant}</p>
                          </div>
                          <div className="flex items-center gap-2">
                            <CheckCircle className="h-5 w-5 text-green-500" />
                            <Badge className="bg-green-500">Paid</Badge>
                          </div>
                        </div>
                        <div className="mt-4 grid gap-2 text-sm">
                          <p>
                            <span className="font-medium">Due Date:</span>{" "}
                            {new Date(payment.dueDate).toLocaleDateString()}
                          </p>
                          <p>
                            <span className="font-medium">Paid Date:</span>{" "}
                            {new Date(payment.paidDate!).toLocaleDateString()}
                          </p>
                          <p>
                            <span className="font-medium">Payment Method:</span> {payment.paymentMethod}
                          </p>
                        </div>
                        <div className="mt-4 flex justify-end">
                          <Link href={`/dashboard/landlord/payments/${payment.id}`}>
                            <Button variant="outline" size="sm">
                              View Details
                            </Button>
                          </Link>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </TabsContent>

              <TabsContent value="overdue" className="space-y-4">
                {overduePayments.length === 0 ? (
                  <div className="text-center py-8 text-muted-foreground">No overdue payments found</div>
                ) : (
                  <div className="space-y-4">
                    {overduePayments.map((payment) => (
                      <div key={payment.id} className="border rounded-lg p-4">
                        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                          <div className="space-y-1">
                            <div className="flex items-center gap-2">
                              <DollarSign className="h-5 w-5 text-primary" />
                              <h4 className="font-semibold">
                                {payment.reference} - £{payment.amount.toLocaleString()}
                              </h4>
                            </div>
                            <p className="text-sm text-muted-foreground">
                              {payment.property} - {payment.room}
                            </p>
                            <p className="text-sm text-muted-foreground">Tenant: {payment.tenant}</p>
                          </div>
                          <div className="flex items-center gap-2">
                            <AlertCircle className="h-5 w-5 text-red-500" />
                            <Badge className="bg-red-500">Overdue</Badge>
                          </div>
                        </div>
                        <div className="mt-4 grid gap-2 text-sm">
                          <p>
                            <span className="font-medium">Due Date:</span>{" "}
                            {new Date(payment.dueDate).toLocaleDateString()}
                          </p>
                          <p>
                            <span className="font-medium">Days Overdue:</span>{" "}
                            {Math.floor(
                              (new Date().getTime() - new Date(payment.dueDate).getTime()) / (1000 * 60 * 60 * 24),
                            )}
                          </p>
                        </div>
                        <div className="mt-4 flex justify-end gap-2">
                          <Button size="sm">Send Reminder</Button>
                          <Link href={`/dashboard/landlord/payments/${payment.id}`}>
                            <Button variant="outline" size="sm">
                              View Details
                            </Button>
                          </Link>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </TabsContent>

              <TabsContent value="upcoming" className="space-y-4">
                {upcomingPayments.length === 0 ? (
                  <div className="text-center py-8 text-muted-foreground">No upcoming payments found</div>
                ) : (
                  <div className="space-y-4">
                    {upcomingPayments.map((payment) => (
                      <div key={payment.id} className="border rounded-lg p-4">
                        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                          <div className="space-y-1">
                            <div className="flex items-center gap-2">
                              <DollarSign className="h-5 w-5 text-primary" />
                              <h4 className="font-semibold">
                                {payment.reference} - £{payment.amount.toLocaleString()}
                              </h4>
                            </div>
                            <p className="text-sm text-muted-foreground">
                              {payment.property} - {payment.room}
                            </p>
                            <p className="text-sm text-muted-foreground">Tenant: {payment.tenant}</p>
                          </div>
                          <div className="flex items-center gap-2">
                            <Calendar className="h-5 w-5 text-blue-500" />
                            <Badge className="bg-blue-500">Upcoming</Badge>
                          </div>
                        </div>
                        <div className="mt-4 grid gap-2 text-sm">
                          <p>
                            <span className="font-medium">Due Date:</span>{" "}
                            {new Date(payment.dueDate).toLocaleDateString()}
                          </p>
                          <p>
                            <span className="font-medium">Days Until Due:</span>{" "}
                            {Math.floor(
                              (new Date(payment.dueDate).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24),
                            )}
                          </p>
                        </div>
                        <div className="mt-4 flex justify-end gap-2">
                          <Button size="sm">Send Reminder</Button>
                          <Link href={`/dashboard/landlord/payments/${payment.id}`}>
                            <Button variant="outline" size="sm">
                              View Details
                            </Button>
                          </Link>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>
      </div>
    </WithAuthProtection>
  )
}
