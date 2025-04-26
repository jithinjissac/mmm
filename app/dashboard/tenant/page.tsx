import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Wrench, CreditCard, Calendar, MessageSquare, AlertCircle, CheckCircle } from "lucide-react"
import Link from "next/link"

export default function TenantDashboard() {
  return (
    <div className="flex flex-col gap-4">
      <h1 className="text-3xl font-bold tracking-tight">Tenant Dashboard</h1>
      <p className="text-muted-foreground">
        Welcome to your tenant dashboard. Manage your rental, payments, and maintenance requests.
      </p>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Rent Due</CardTitle>
            <CreditCard className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">£750</div>
            <p className="text-xs text-muted-foreground">Due on 1st July 2023</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Maintenance Requests</CardTitle>
            <Wrench className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">2</div>
            <p className="text-xs text-muted-foreground">1 open, 1 in progress</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Messages</CardTitle>
            <MessageSquare className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">3</div>
            <p className="text-xs text-muted-foreground">2 unread messages</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Lease Ends</CardTitle>
            <Calendar className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">120 days</div>
            <p className="text-xs text-muted-foreground">Renewal due by 1st Oct 2023</p>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="rental" className="space-y-4">
        <TabsList>
          <TabsTrigger value="rental">My Rental</TabsTrigger>
          <TabsTrigger value="maintenance">Maintenance</TabsTrigger>
          <TabsTrigger value="payments">Payments</TabsTrigger>
          <TabsTrigger value="messages">Messages</TabsTrigger>
        </TabsList>
        <TabsContent value="rental" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Your Current Rental</CardTitle>
              <CardDescription>Details about your current accommodation</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-8">
                <div className="flex flex-col md:flex-row gap-6">
                  <div className="md:w-1/3">
                    <img
                      src="/minimalist-city-apartment.png"
                      alt="Your room"
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
                        <p className="text-sm font-medium">Room Type</p>
                        <p className="text-sm text-muted-foreground">Double Room (Shared)</p>
                      </div>
                      <div>
                        <p className="text-sm font-medium">Monthly Rent</p>
                        <p className="text-sm text-muted-foreground">£750</p>
                      </div>
                      <div>
                        <p className="text-sm font-medium">Deposit</p>
                        <p className="text-sm text-muted-foreground">£900 (Protected)</p>
                      </div>
                      <div>
                        <p className="text-sm font-medium">Move-in Date</p>
                        <p className="text-sm text-muted-foreground">15 January 2023</p>
                      </div>
                    </div>

                    <div>
                      <p className="text-sm font-medium">Amenities</p>
                      <div className="flex flex-wrap gap-2 mt-1">
                        <span className="bg-muted text-xs px-2 py-1 rounded-md">WiFi</span>
                        <span className="bg-muted text-xs px-2 py-1 rounded-md">Heating</span>
                        <span className="bg-muted text-xs px-2 py-1 rounded-md">Washing Machine</span>
                        <span className="bg-muted text-xs px-2 py-1 rounded-md">Shared Kitchen</span>
                        <span className="bg-muted text-xs px-2 py-1 rounded-md">Shared Bathroom</span>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="space-y-4">
                  <h3 className="text-lg font-semibold">Roommates</h3>
                  <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                    {[
                      {
                        name: "Emma Wilson",
                        age: 28,
                        occupation: "Software Developer",
                        nationality: "British",
                        languages: "English, Spanish",
                        room: "Room 1",
                      },
                      {
                        name: "Michael Chen",
                        age: 24,
                        occupation: "Student",
                        nationality: "Chinese",
                        languages: "Mandarin, English",
                        room: "Room 2",
                      },
                      {
                        name: "Sophie Martin",
                        age: 31,
                        occupation: "Nurse",
                        nationality: "French",
                        languages: "French, English",
                        room: "Room 4",
                      },
                    ].map((roommate, i) => (
                      <Card key={i} className="overflow-hidden">
                        <CardContent className="p-4">
                          <div className="flex flex-col gap-2">
                            <p className="font-semibold">{roommate.name}</p>
                            <p className="text-sm text-muted-foreground">{roommate.room}</p>
                            <div className="text-sm">
                              <p>
                                <span className="font-medium">Age:</span> {roommate.age}
                              </p>
                              <p>
                                <span className="font-medium">Occupation:</span> {roommate.occupation}
                              </p>
                              <p>
                                <span className="font-medium">Nationality:</span> {roommate.nationality}
                              </p>
                              <p>
                                <span className="font-medium">Languages:</span> {roommate.languages}
                              </p>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                </div>

                <div className="flex justify-end">
                  <Link href="/dashboard/tenant/rental/details">
                    <Button>View Full Details</Button>
                  </Link>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
        <TabsContent value="maintenance" className="space-y-4">
          <div className="flex justify-between items-center">
            <h3 className="text-lg font-semibold">Maintenance Requests</h3>
            <Link href="/dashboard/tenant/maintenance/new">
              <Button>
                <Wrench className="mr-2 h-4 w-4" /> New Request
              </Button>
            </Link>
          </div>
          <Card>
            <CardContent className="p-6">
              <div className="space-y-6">
                {[
                  {
                    issue: "Leaking faucet in bathroom",
                    status: "In Progress",
                    priority: "Medium",
                    reported: "3 days ago",
                    scheduled: "Tomorrow, 10:00 AM",
                    notes: "Plumber has been scheduled to fix the issue.",
                  },
                  {
                    issue: "Light fixture not working in bedroom",
                    status: "Open",
                    priority: "Low",
                    reported: "1 day ago",
                    scheduled: "Not scheduled yet",
                    notes: "Awaiting landlord response.",
                  },
                ].map((request, i) => (
                  <div key={i} className="border rounded-lg p-4">
                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                      <div className="space-y-1">
                        <div className="flex items-center gap-2">
                          <Wrench className="h-5 w-5 text-primary" />
                          <h4 className="font-semibold">{request.issue}</h4>
                        </div>
                        <p className="text-sm text-muted-foreground">Reported: {request.reported}</p>
                      </div>
                      <div className="flex items-center gap-2">
                        {request.status === "In Progress" ? (
                          <AlertCircle className="h-5 w-5 text-amber-500" />
                        ) : request.status === "Open" ? (
                          <AlertCircle className="h-5 w-5 text-red-500" />
                        ) : (
                          <CheckCircle className="h-5 w-5 text-green-500" />
                        )}
                        <span
                          className={`text-sm font-medium ${
                            request.status === "In Progress"
                              ? "text-amber-500"
                              : request.status === "Open"
                                ? "text-red-500"
                                : "text-green-500"
                          }`}
                        >
                          {request.status}
                        </span>
                      </div>
                    </div>
                    <div className="mt-4 grid gap-2 text-sm">
                      <p>
                        <span className="font-medium">Priority:</span> {request.priority}
                      </p>
                      <p>
                        <span className="font-medium">Scheduled:</span> {request.scheduled}
                      </p>
                      <p>
                        <span className="font-medium">Notes:</span> {request.notes}
                      </p>
                    </div>
                    <div className="mt-4 flex justify-end">
                      <Link href={`/dashboard/tenant/maintenance/${i + 1}`}>
                        <Button variant="outline" size="sm">
                          View Details
                        </Button>
                      </Link>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
        <TabsContent value="payments" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Payment History</CardTitle>
              <CardDescription>Track your rent payments and transaction history</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                <div className="rounded-lg border p-4">
                  <h3 className="font-semibold">Upcoming Payment</h3>
                  <div className="mt-2 grid gap-2">
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Amount:</span>
                      <span className="font-medium">£750.00</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Due Date:</span>
                      <span className="font-medium">1st July 2023</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Payment Method:</span>
                      <span className="font-medium">Direct Debit</span>
                    </div>
                  </div>
                  <div className="mt-4">
                    <Button className="w-full">Make Payment</Button>
                  </div>
                </div>

                <h3 className="font-semibold">Recent Transactions</h3>
                <div className="space-y-4">
                  {[
                    {
                      type: "Rent Payment",
                      amount: "£750.00",
                      date: "1 Jun 2023",
                      status: "Completed",
                      method: "Direct Debit",
                      reference: "REF-2023-06-01",
                    },
                    {
                      type: "Rent Payment",
                      amount: "£750.00",
                      date: "1 May 2023",
                      status: "Completed",
                      method: "Direct Debit",
                      reference: "REF-2023-05-01",
                    },
                    {
                      type: "Rent Payment",
                      amount: "£750.00",
                      date: "1 Apr 2023",
                      status: "Completed",
                      method: "Direct Debit",
                      reference: "REF-2023-04-01",
                    },
                    {
                      type: "Deposit Payment",
                      amount: "£900.00",
                      date: "15 Jan 2023",
                      status: "Completed",
                      method: "Bank Transfer",
                      reference: "DEP-2023-01-15",
                    },
                  ].map((payment, i) => (
                    <div key={i} className="flex items-center justify-between border-b pb-4 last:border-0 last:pb-0">
                      <div className="flex items-center">
                        <div className="mr-4 rounded-full bg-primary/10 p-2">
                          <CreditCard className="h-5 w-5 text-primary" />
                        </div>
                        <div>
                          <p className="font-medium">{payment.type}</p>
                          <p className="text-sm text-muted-foreground">{payment.date}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-4">
                        <div className="text-right">
                          <p className="text-sm font-medium">{payment.amount}</p>
                          <p className="text-sm text-green-500">{payment.status}</p>
                        </div>
                        <Link href={`/dashboard/tenant/payments/${i + 1}`}>
                          <Button variant="outline" size="sm">
                            Receipt
                          </Button>
                        </Link>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
        <TabsContent value="messages" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Messages</CardTitle>
              <CardDescription>Communication with your landlord and maintenance team</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {[
                  {
                    from: "John Williams (Landlord)",
                    subject: "Upcoming Property Inspection",
                    preview: "I wanted to inform you that there will be a routine property inspection on...",
                    date: "Yesterday",
                    unread: true,
                  },
                  {
                    from: "Maintenance Team",
                    subject: "Re: Leaking Faucet",
                    preview: "We've scheduled a plumber to fix the issue with your bathroom faucet...",
                    date: "2 days ago",
                    unread: true,
                  },
                  {
                    from: "John Williams (Landlord)",
                    subject: "Rent Increase Notice",
                    preview: "This is to inform you that there will be a small rent increase of 2% starting...",
                    date: "1 week ago",
                    unread: false,
                  },
                ].map((message, i) => (
                  <div key={i} className="flex items-center justify-between border-b pb-4 last:border-0 last:pb-0">
                    <div className="flex items-center">
                      <div className="mr-4 rounded-full bg-primary/10 p-2">
                        <MessageSquare className="h-5 w-5 text-primary" />
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <p className="font-medium">{message.from}</p>
                          {message.unread && <span className="h-2 w-2 rounded-full bg-primary"></span>}
                        </div>
                        <p className="font-medium text-sm">{message.subject}</p>
                        <p className="text-sm text-muted-foreground truncate max-w-[300px]">{message.preview}</p>
                        <p className="text-xs text-muted-foreground mt-1">{message.date}</p>
                      </div>
                    </div>
                    <Link href={`/dashboard/tenant/messages/${i + 1}`}>
                      <Button variant="outline" size="sm">
                        Read
                      </Button>
                    </Link>
                  </div>
                ))}
              </div>
              <div className="mt-6">
                <Link href="/dashboard/tenant/messages/new">
                  <Button className="w-full">
                    <MessageSquare className="mr-2 h-4 w-4" /> New Message
                  </Button>
                </Link>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
