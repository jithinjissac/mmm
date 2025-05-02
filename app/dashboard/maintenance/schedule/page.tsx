"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Calendar } from "@/components/ui/calendar"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import { Clock, MapPin, Plus, User, Wrench, Building } from "lucide-react"
import { useToast } from "@/components/ui/use-toast"
import { useAuth } from "@/components/mock-auth-provider"

// Mock schedule data
const MOCK_SCHEDULE = [
  {
    id: "1",
    date: new Date(),
    appointments: [
      {
        id: "app1",
        time: "09:00 AM",
        property: "Riverside Apartment",
        address: "123 River St, London",
        task: "Plumbing repair",
        tenant: "Alice Johnson",
        status: "Scheduled",
      },
      {
        id: "app2",
        time: "11:30 AM",
        property: "Garden Cottage",
        address: "45 Garden Lane, London",
        task: "Electrical inspection",
        tenant: "Bob Smith",
        status: "Scheduled",
      },
    ],
  },
  {
    id: "2",
    date: new Date(Date.now() + 86400000), // Tomorrow
    appointments: [
      {
        id: "app3",
        time: "10:00 AM",
        property: "City View Flat",
        address: "78 High St, London",
        task: "Heating system check",
        tenant: "Charlie Brown",
        status: "Scheduled",
      },
    ],
  },
  {
    id: "3",
    date: new Date(Date.now() + 172800000), // Day after tomorrow
    appointments: [
      {
        id: "app4",
        time: "02:00 PM",
        property: "Suburban House",
        address: "15 Maple Rd, London",
        task: "Window repair",
        tenant: "Diana Prince",
        status: "Scheduled",
      },
    ],
  },
]

export default function MaintenanceSchedulePage() {
  const [date, setDate] = useState<Date | undefined>(new Date())
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const { toast } = useToast()
  const { user } = useAuth()

  // Find appointments for the selected date
  const selectedDateAppointments =
    MOCK_SCHEDULE.find((day) => day.date.toDateString() === (date?.toDateString() || ""))?.appointments || []

  const handleAddAppointment = () => {
    toast({
      title: "Appointment added",
      description: "The maintenance appointment has been scheduled.",
    })
    setIsDialogOpen(false)
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Maintenance Schedule</h1>
        <p className="text-muted-foreground">View and manage your maintenance appointments calendar.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="md:col-span-1">
          <CardHeader>
            <CardTitle>Calendar</CardTitle>
            <CardDescription>Select a date to view appointments</CardDescription>
          </CardHeader>
          <CardContent>
            <Calendar mode="single" selected={date} onSelect={setDate} className="rounded-md border" />
            <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
              <DialogTrigger asChild>
                <Button className="w-full mt-4">
                  <Plus className="h-4 w-4 mr-2" />
                  Add Appointment
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Schedule Maintenance Appointment</DialogTitle>
                  <DialogDescription>Create a new maintenance appointment for the selected date.</DialogDescription>
                </DialogHeader>
                <div className="grid gap-4 py-4">
                  <div className="grid grid-cols-4 items-center gap-4">
                    <Label htmlFor="date" className="text-right">
                      Date
                    </Label>
                    <div className="col-span-3">
                      <Input id="date" value={date ? date.toLocaleDateString() : ""} readOnly />
                    </div>
                  </div>
                  <div className="grid grid-cols-4 items-center gap-4">
                    <Label htmlFor="time" className="text-right">
                      Time
                    </Label>
                    <div className="col-span-3">
                      <Select>
                        <SelectTrigger id="time">
                          <SelectValue placeholder="Select time" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="09:00">09:00 AM</SelectItem>
                          <SelectItem value="10:00">10:00 AM</SelectItem>
                          <SelectItem value="11:00">11:00 AM</SelectItem>
                          <SelectItem value="13:00">01:00 PM</SelectItem>
                          <SelectItem value="14:00">02:00 PM</SelectItem>
                          <SelectItem value="15:00">03:00 PM</SelectItem>
                          <SelectItem value="16:00">04:00 PM</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                  <div className="grid grid-cols-4 items-center gap-4">
                    <Label htmlFor="property" className="text-right">
                      Property
                    </Label>
                    <div className="col-span-3">
                      <Select>
                        <SelectTrigger id="property">
                          <SelectValue placeholder="Select property" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="prop1">Riverside Apartment</SelectItem>
                          <SelectItem value="prop2">Garden Cottage</SelectItem>
                          <SelectItem value="prop3">City View Flat</SelectItem>
                          <SelectItem value="prop4">Suburban House</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                  <div className="grid grid-cols-4 items-center gap-4">
                    <Label htmlFor="task" className="text-right">
                      Task
                    </Label>
                    <div className="col-span-3">
                      <Input id="task" placeholder="Maintenance task description" />
                    </div>
                  </div>
                  <div className="grid grid-cols-4 items-center gap-4">
                    <Label htmlFor="notes" className="text-right">
                      Notes
                    </Label>
                    <Textarea id="notes" placeholder="Additional notes" className="col-span-3" />
                  </div>
                </div>
                <DialogFooter>
                  <Button onClick={handleAddAppointment}>Schedule Appointment</Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          </CardContent>
        </Card>

        <Card className="md:col-span-2">
          <CardHeader>
            <CardTitle>
              {date
                ? date.toLocaleDateString("en-US", { weekday: "long", month: "long", day: "numeric", year: "numeric" })
                : "No Date Selected"}
            </CardTitle>
            <CardDescription>{selectedDateAppointments.length} appointments scheduled</CardDescription>
          </CardHeader>
          <CardContent>
            {selectedDateAppointments.length === 0 ? (
              <div className="text-center py-8">
                <Clock className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <p className="text-lg font-medium">No appointments scheduled</p>
                <p className="text-muted-foreground">There are no maintenance appointments scheduled for this date.</p>
              </div>
            ) : (
              <div className="space-y-4">
                {selectedDateAppointments.map((appointment) => (
                  <Card key={appointment.id}>
                    <CardContent className="p-4">
                      <div className="flex justify-between items-start">
                        <div>
                          <h3 className="font-semibold">{appointment.task}</h3>
                          <div className="flex items-center mt-1 text-sm text-muted-foreground">
                            <Clock className="h-3.5 w-3.5 mr-1" />
                            {appointment.time}
                          </div>
                          <div className="flex items-center mt-1 text-sm">
                            <Building className="h-3.5 w-3.5 mr-1 text-muted-foreground" />
                            {appointment.property}
                          </div>
                          <div className="flex items-center mt-1 text-sm">
                            <MapPin className="h-3.5 w-3.5 mr-1 text-muted-foreground" />
                            {appointment.address}
                          </div>
                          <div className="flex items-center mt-1 text-sm">
                            <User className="h-3.5 w-3.5 mr-1 text-muted-foreground" />
                            {appointment.tenant}
                          </div>
                        </div>
                        <Badge variant="outline">{appointment.status}</Badge>
                      </div>
                      <div className="flex justify-end mt-4 space-x-2">
                        <Button variant="outline" size="sm">
                          Reschedule
                        </Button>
                        <Button size="sm">
                          <Wrench className="h-3.5 w-3.5 mr-1" />
                          Start Work
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
