"use client"

import { useState, useEffect } from "react"
import { useParams, useRouter } from "next/navigation"
import { useAuth } from "@/lib/auth/auth-context"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { DollarSign, Download, Search } from "lucide-react"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { format } from "date-fns"

// Mock payment data - in a real app, this would come from an API
const MOCK_PAYMENTS = [
  {
    id: "pay_1",
    amount: 850,
    status: "paid",
    date: "2023-05-01T12:00:00Z",
    tenant: "John Smith",
    method: "Credit Card",
    reference: "INV-2023-001",
  },
  {
    id: "pay_2",
    amount: 850,
    status: "paid",
    date: "2023-06-01T12:00:00Z",
    tenant: "John Smith",
    method: "Bank Transfer",
    reference: "INV-2023-002",
  },
  {
    id: "pay_3",
    amount: 850,
    status: "pending",
    date: "2023-07-01T12:00:00Z",
    tenant: "John Smith",
    method: "Credit Card",
    reference: "INV-2023-003",
  },
  {
    id: "pay_4",
    amount: 850,
    status: "overdue",
    date: "2023-08-01T12:00:00Z",
    tenant: "John Smith",
    method: "Pending",
    reference: "INV-2023-004",
  },
]

// Mock room data
const MOCK_ROOM = {
  id: "room_1",
  name: "Master Bedroom",
  property: "Seaside Villa",
  rent: 850,
  tenant: "John Smith",
  leaseStart: "2023-01-01T00:00:00Z",
  leaseEnd: "2023-12-31T23:59:59Z",
}

export default function RoomPaymentsPage() {
  const { id } = useParams() as { id: string }
  const router = useRouter()
  const { user, isLoading } = useAuth()

  const [room, setRoom] = useState<any>(null)
  const [payments, setPayments] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState("")
  const [statusFilter, setStatusFilter] = useState("all")

  useEffect(() => {
    // In a real app, fetch room and payment data from API
    const fetchData = async () => {
      try {
        // Simulate API call
        await new Promise((resolve) => setTimeout(resolve, 500))

        // Set mock data
        setRoom(MOCK_ROOM)
        setPayments(MOCK_PAYMENTS)
      } catch (error) {
        console.error("Error fetching payment data:", error)
      } finally {
        setLoading(false)
      }
    }

    fetchData()
  }, [id])

  // Filter payments based on search term and status filter
  const filteredPayments = payments.filter((payment) => {
    const matchesSearch =
      payment.reference.toLowerCase().includes(searchTerm.toLowerCase()) ||
      payment.tenant.toLowerCase().includes(searchTerm.toLowerCase()) ||
      payment.method.toLowerCase().includes(searchTerm.toLowerCase())

    const matchesStatus = statusFilter === "all" || payment.status === statusFilter

    return matchesSearch && matchesStatus
  })

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "paid":
        return <Badge className="bg-green-500">Paid</Badge>
      case "pending":
        return <Badge className="bg-yellow-500">Pending</Badge>
      case "overdue":
        return <Badge className="bg-red-500">Overdue</Badge>
      default:
        return <Badge>{status}</Badge>
    }
  }

  if (isLoading || loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
      </div>
    )
  }

  if (!user) {
    router.push("/signin")
    return null
  }

  return (
    <div className="container mx-auto py-8 px-4">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-3xl font-bold">Room Payments</h1>
          <p className="text-muted-foreground">
            {room?.name} at {room?.property}
          </p>
        </div>
        <Button onClick={() => router.back()} variant="outline">
          Back to Room
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Monthly Rent</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">£{room?.rent}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Current Tenant</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{room?.tenant}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Lease Period</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-lg font-medium">
              {format(new Date(room?.leaseStart || ""), "MMM d, yyyy")} -
              {format(new Date(room?.leaseEnd || ""), "MMM d, yyyy")}
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Payment History</CardTitle>
          <CardDescription>View and manage all payments for this room</CardDescription>

          <div className="flex flex-col sm:flex-row gap-4 mt-4">
            <div className="relative flex-1">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search payments..."
                className="pl-8"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>

            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-full sm:w-[180px]">
                <SelectValue placeholder="Filter by status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Statuses</SelectItem>
                <SelectItem value="paid">Paid</SelectItem>
                <SelectItem value="pending">Pending</SelectItem>
                <SelectItem value="overdue">Overdue</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardHeader>

        <CardContent>
          <div className="rounded-md border">
            <div className="grid grid-cols-6 p-4 font-medium border-b">
              <div>Date</div>
              <div>Reference</div>
              <div>Tenant</div>
              <div>Amount</div>
              <div>Method</div>
              <div>Status</div>
            </div>

            {filteredPayments.length === 0 ? (
              <div className="p-4 text-center text-muted-foreground">No payments found matching your filters</div>
            ) : (
              filteredPayments.map((payment) => (
                <div key={payment.id} className="grid grid-cols-6 p-4 border-b last:border-0 hover:bg-muted/50">
                  <div>{format(new Date(payment.date), "MMM d, yyyy")}</div>
                  <div>{payment.reference}</div>
                  <div>{payment.tenant}</div>
                  <div>£{payment.amount}</div>
                  <div>{payment.method}</div>
                  <div>{getStatusBadge(payment.status)}</div>
                </div>
              ))
            )}
          </div>
        </CardContent>

        <CardFooter className="flex justify-between">
          <Button variant="outline" size="sm">
            <Download className="mr-2 h-4 w-4" />
            Export
          </Button>

          <Button size="sm">
            <DollarSign className="mr-2 h-4 w-4" />
            Record Payment
          </Button>
        </CardFooter>
      </Card>
    </div>
  )
}
