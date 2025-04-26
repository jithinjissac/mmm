import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Building, Wrench, CheckCircle, Clock, AlertCircle, Calendar } from "lucide-react"
import Link from "next/link"

export default function MaintenanceDashboard() {
  return (
    <div className="flex flex-col gap-4">
      <h1 className="text-3xl font-bold tracking-tight">Maintenance Dashboard</h1>
      <p className="text-muted-foreground">
        Welcome to your maintenance dashboard. Manage work orders and property maintenance.
      </p>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">New Orders</CardTitle>
            <AlertCircle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">8</div>
            <p className="text-xs text-muted-foreground">+3 from yesterday</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">In Progress</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">12</div>
            <p className="text-xs text-muted-foreground">-2 from yesterday</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Completed Today</CardTitle>
            <CheckCircle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">5</div>
            <p className="text-xs text-muted-foreground">+2 from yesterday</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Scheduled</CardTitle>
            <Calendar className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">15</div>
            <p className="text-xs text-muted-foreground">For next 7 days</p>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="work-orders" className="space-y-4">
        <TabsList>
          <TabsTrigger value="work-orders">Work Orders</TabsTrigger>
          <TabsTrigger value="properties">Properties</TabsTrigger>
          <TabsTrigger value="schedule">Schedule</TabsTrigger>
          <TabsTrigger value="inventory">Inventory</TabsTrigger>
        </TabsList>
        <TabsContent value="work-orders" className="space-y-4">
          <div className="flex justify-between items-center">
            <h3 className="text-lg font-semibold">Active Work Orders</h3>
            <div className="flex gap-2">
              <Link href="/dashboard/maintenance/work-orders/new">
                <Button variant="outline">
                  <Wrench className="mr-2 h-4 w-4" /> Create Order
                </Button>
              </Link>
              <Link href="/dashboard/maintenance/work-orders">
                <Button>View All</Button>
              </Link>
            </div>
          </div>
          <Card>
            <CardContent className="p-6">
              <div className="space-y-6">
                {[
                  {
                    issue: "Leaking faucet in bathroom",
                    property: "Riverside Apartments",
                    room: "Room 2",
                    tenant: "John Smith",
                    status: "In Progress",
                    priority: "Medium",
                    reported: "3 days ago",
                    scheduled: "Tomorrow, 10:00 AM",
                  },
                  {
                    issue: "Heating not working",
                    property: "City View Flat",
                    room: "Room 1",
                    tenant: "Michael Brown",
                    status: "Scheduled",
                    priority: "High",
                    reported: "1 week ago",
                    scheduled: "Today, 2:00 PM",
                  },
                  {
                    issue: "Window lock broken",
                    property: "Park House",
                    room: "Room 4",
                    tenant: "Sarah Johnson",
                    status: "New",
                    priority: "Medium",
                    reported: "2 days ago",
                    scheduled: "Not scheduled yet",
                  },
                  {
                    issue: "Electrical outlet not working",
                    property: "Garden Cottage",
                    room: "Living Room",
                    tenant: "David Wilson",
                    status: "New",
                    priority: "High",
                    reported: "1 day ago",
                    scheduled: "Not scheduled yet",
                  },
                ].map((order, i) => (
                  <div key={i} className="border rounded-lg p-4">
                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                      <div className="space-y-1">
                        <div className="flex items-center gap-2">
                          <Wrench className="h-5 w-5 text-primary" />
                          <h4 className="font-semibold">{order.issue}</h4>
                        </div>
                        <p className="text-sm text-muted-foreground">
                          {order.property} - {order.room}
                        </p>
                        <p className="text-sm text-muted-foreground">Tenant: {order.tenant}</p>
                      </div>
                      <div className="flex items-center gap-2">
                        {order.status === "In Progress" ? (
                          <Clock className="h-5 w-5 text-amber-500" />
                        ) : order.status === "New" ? (
                          <AlertCircle className="h-5 w-5 text-red-500" />
                        ) : order.status === "Scheduled" ? (
                          <Calendar className="h-5 w-5 text-blue-500" />
                        ) : (
                          <CheckCircle className="h-5 w-5 text-green-500" />
                        )}
                        <span
                          className={`text-sm font-medium ${
                            order.status === "In Progress"
                              ? "text-amber-500"
                              : order.status === "New"
                                ? "text-red-500"
                                : order.status === "Scheduled"
                                  ? "text-blue-500"
                                  : "text-green-500"
                          }`}
                        >
                          {order.status}
                        </span>
                      </div>
                    </div>
                    <div className="mt-4 grid gap-2 text-sm">
                      <p>
                        <span className="font-medium">Priority:</span> {order.priority}
                      </p>
                      <p>
                        <span className="font-medium">Reported:</span> {order.reported}
                      </p>
                      <p>
                        <span className="font-medium">Scheduled:</span> {order.scheduled}
                      </p>
                    </div>
                    <div className="mt-4 flex justify-end">
                      <Link href={`/dashboard/maintenance/work-orders/${i + 1}`}>
                        <Button variant="outline" size="sm">
                          Manage
                        </Button>
                      </Link>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
        <TabsContent value="properties" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Managed Properties</CardTitle>
              <CardDescription>Properties under your maintenance responsibility</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {[
                  {
                    name: "Riverside Apartments",
                    address: "123 River Road, London",
                    units: 6,
                    activeIssues: 3,
                    lastVisit: "2 days ago",
                  },
                  {
                    name: "City View Flat",
                    address: "45 High Street, Manchester",
                    units: 3,
                    activeIssues: 1,
                    lastVisit: "1 week ago",
                  },
                  {
                    name: "Garden Cottage",
                    address: "8 Meadow Lane, Bristol",
                    units: 4,
                    activeIssues: 1,
                    lastVisit: "3 days ago",
                  },
                  {
                    name: "Park House",
                    address: "27 Park Avenue, Birmingham",
                    units: 5,
                    activeIssues: 2,
                    lastVisit: "5 days ago",
                  },
                ].map((property, i) => (
                  <div key={i} className="flex items-center justify-between border-b pb-4 last:border-0 last:pb-0">
                    <div className="flex items-center">
                      <div className="mr-4 rounded-full bg-primary/10 p-2">
                        <Building className="h-5 w-5 text-primary" />
                      </div>
                      <div>
                        <p className="font-medium">{property.name}</p>
                        <p className="text-sm text-muted-foreground">{property.address}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-4">
                      <div className="text-right">
                        <p className="text-sm font-medium">{property.units} Units</p>
                        <p className="text-sm text-muted-foreground">{property.activeIssues} active issues</p>
                        <p className="text-sm text-muted-foreground">Last visit: {property.lastVisit}</p>
                      </div>
                      <Link href={`/dashboard/maintenance/properties/${i + 1}`}>
                        <Button variant="outline" size="sm">
                          View
                        </Button>
                      </Link>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
        <TabsContent value="schedule" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Upcoming Schedule</CardTitle>
              <CardDescription>Your maintenance appointments for the next 7 days</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                {[
                  {
                    date: "Today",
                    appointments: [
                      {
                        time: "10:00 AM",
                        issue: "Heating repair",
                        property: "City View Flat",
                        tenant: "Michael Brown",
                      },
                      {
                        time: "2:00 PM",
                        issue: "Electrical inspection",
                        property: "Park House",
                        tenant: "Various tenants",
                      },
                    ],
                  },
                  {
                    date: "Tomorrow",
                    appointments: [
                      {
                        time: "9:30 AM",
                        issue: "Plumbing repair",
                        property: "Riverside Apartments",
                        tenant: "John Smith",
                      },
                    ],
                  },
                  {
                    date: "Wednesday, 7th June",
                    appointments: [
                      {
                        time: "11:00 AM",
                        issue: "Window repair",
                        property: "Garden Cottage",
                        tenant: "David Wilson",
                      },
                      {
                        time: "3:00 PM",
                        issue: "Boiler service",
                        property: "Riverside Apartments",
                        tenant: "Building common area",
                      },
                    ],
                  },
                ].map((day, i) => (
                  <div key={i} className="space-y-3">
                    <h3 className="font-semibold">{day.date}</h3>
                    <div className="space-y-3">
                      {day.appointments.map((appointment, j) => (
                        <div key={j} className="flex items-start border-l-2 border-primary pl-4">
                          <div className="mr-4 font-medium text-sm">{appointment.time}</div>
                          <div className="flex-1">
                            <p className="font-medium">{appointment.issue}</p>
                            <p className="text-sm text-muted-foreground">
                              {appointment.property} - {appointment.tenant}
                            </p>
                          </div>
                          <Button variant="outline" size="sm">
                            Details
                          </Button>
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
        <TabsContent value="inventory" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Maintenance Inventory</CardTitle>
              <CardDescription>Track supplies and equipment for maintenance tasks</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="rounded-lg border p-4">
                  <h3 className="font-semibold">Low Stock Items</h3>
                  <div className="mt-4 space-y-2">
                    {[
                      { name: "Light Bulbs (LED)", quantity: 5, reorderLevel: 10 },
                      { name: "Plumbing Fixtures", quantity: 2, reorderLevel: 5 },
                      { name: "Air Filters", quantity: 3, reorderLevel: 8 },
                    ].map((item, i) => (
                      <div key={i} className="flex items-center justify-between">
                        <div className="flex items-center">
                          <AlertCircle className="mr-2 h-4 w-4 text-red-500" />
                          <span>{item.name}</span>
                        </div>
                        <div className="text-sm">
                          <span className="font-medium">{item.quantity}</span> remaining
                          <span className="text-muted-foreground"> (Reorder at {item.reorderLevel})</span>
                        </div>
                      </div>
                    ))}
                  </div>
                  <div className="mt-4">
                    <Button variant="outline" size="sm">
                      Order Supplies
                    </Button>
                  </div>
                </div>

                <h3 className="font-semibold">Inventory List</h3>
                <div className="space-y-4">
                  {[
                    {
                      category: "Plumbing",
                      items: [
                        { name: "Pipe Fittings", quantity: 25 },
                        { name: "Washers", quantity: 50 },
                        { name: "Plungers", quantity: 8 },
                      ],
                    },
                    {
                      category: "Electrical",
                      items: [
                        { name: "Wire (meters)", quantity: 100 },
                        { name: "Electrical Tape", quantity: 15 },
                        { name: "Outlet Covers", quantity: 12 },
                      ],
                    },
                    {
                      category: "General",
                      items: [
                        { name: "Paint (liters)", quantity: 20 },
                        { name: "Screws (boxes)", quantity: 15 },
                        { name: "Cleaning Supplies", quantity: 30 },
                      ],
                    },
                  ].map((category, i) => (
                    <div key={i} className="rounded-lg border p-4">
                      <h4 className="font-medium">{category.category}</h4>
                      <div className="mt-2 space-y-1">
                        {category.items.map((item, j) => (
                          <div key={j} className="flex justify-between text-sm">
                            <span>{item.name}</span>
                            <span className="font-medium">{item.quantity}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
