"use client"

import type React from "react"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { useToast } from "@/components/ui/use-toast"
import { User, UserPlus, Mail, Phone, Calendar, CreditCard } from "lucide-react"
import type { Database } from "@/lib/database.types"

type Room = Database["public"]["Tables"]["rooms"]["Row"] & {
  properties?: Database["public"]["Tables"]["properties"]["Row"]
}

interface TenantManagementProps {
  room: Room
}

export function TenantManagement({ room }: TenantManagementProps) {
  const { toast } = useToast()
  const [isAssigning, setIsAssigning] = useState(false)
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    moveInDate: "",
    leaseLength: "12",
    rentAmount: room.rent.toString(),
    depositAmount: room.deposit.toString(),
  })

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))
  }

  const handleSelectChange = (name: string, value: string) => {
    setFormData((prev) => ({ ...prev, [name]: value }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsAssigning(true)

    try {
      // This would be implemented with a server action to assign a tenant
      await new Promise((resolve) => setTimeout(resolve, 1000))

      toast({
        title: "Tenant assigned",
        description: `${formData.name} has been assigned to ${room.name}.`,
      })

      // Reset form
      setFormData({
        name: "",
        email: "",
        phone: "",
        moveInDate: "",
        leaseLength: "12",
        rentAmount: room.rent.toString(),
        depositAmount: room.deposit.toString(),
      })
    } catch (error) {
      console.error("Error assigning tenant:", error)
      toast({
        title: "Error assigning tenant",
        description: "There was an error assigning the tenant. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsAssigning(false)
    }
  }

  if (room.status === "occupied") {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Current Tenant</CardTitle>
          <CardDescription>Information about the current tenant</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center gap-4 p-4 border rounded-lg">
            <div className="rounded-full bg-primary/10 p-3">
              <User className="h-6 w-6 text-primary" />
            </div>
            <div>
              <p className="font-medium">No tenant assigned</p>
              <p className="text-sm text-muted-foreground">
                This room is marked as occupied but no tenant is assigned.
              </p>
              <Button size="sm" className="mt-2" onClick={() => setIsAssigning(true)}>
                Assign Tenant
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    )
  }

  if (isAssigning) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Assign Tenant</CardTitle>
          <CardDescription>Assign a tenant to {room.name}</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="name">Tenant Name</Label>
              <div className="flex">
                <div className="relative flex-1">
                  <User className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="name"
                    name="name"
                    value={formData.name}
                    onChange={handleChange}
                    className="pl-9"
                    placeholder="John Smith"
                    required
                  />
                </div>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="email">Email Address</Label>
              <div className="flex">
                <div className="relative flex-1">
                  <Mail className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="email"
                    name="email"
                    type="email"
                    value={formData.email}
                    onChange={handleChange}
                    className="pl-9"
                    placeholder="john@example.com"
                    required
                  />
                </div>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="phone">Phone Number</Label>
              <div className="flex">
                <div className="relative flex-1">
                  <Phone className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="phone"
                    name="phone"
                    value={formData.phone}
                    onChange={handleChange}
                    className="pl-9"
                    placeholder="07123 456789"
                  />
                </div>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="moveInDate">Move-in Date</Label>
                <div className="relative">
                  <Calendar className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="moveInDate"
                    name="moveInDate"
                    type="date"
                    value={formData.moveInDate}
                    onChange={handleChange}
                    className="pl-9"
                    required
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="leaseLength">Lease Length (months)</Label>
                <Select
                  value={formData.leaseLength}
                  onValueChange={(value) => handleSelectChange("leaseLength", value)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select lease length" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="6">6 months</SelectItem>
                    <SelectItem value="12">12 months</SelectItem>
                    <SelectItem value="18">18 months</SelectItem>
                    <SelectItem value="24">24 months</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="rentAmount">Monthly Rent (£)</Label>
                <div className="relative">
                  <CreditCard className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="rentAmount"
                    name="rentAmount"
                    type="number"
                    min="0"
                    step="0.01"
                    value={formData.rentAmount}
                    onChange={handleChange}
                    className="pl-9"
                    required
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="depositAmount">Deposit Amount (£)</Label>
                <div className="relative">
                  <CreditCard className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="depositAmount"
                    name="depositAmount"
                    type="number"
                    min="0"
                    step="0.01"
                    value={formData.depositAmount}
                    onChange={handleChange}
                    className="pl-9"
                    required
                  />
                </div>
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-4">
              <Button type="button" variant="outline" onClick={() => setIsAssigning(false)}>
                Cancel
              </Button>
              <Button type="submit" disabled={isAssigning}>
                {isAssigning ? "Assigning..." : "Assign Tenant"}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Assign Tenant</CardTitle>
        <CardDescription>This room is currently vacant</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="flex items-center gap-4 p-4 border rounded-lg">
          <div className="rounded-full bg-primary/10 p-3">
            <UserPlus className="h-6 w-6 text-primary" />
          </div>
          <div>
            <p className="font-medium">No tenant assigned</p>
            <p className="text-sm text-muted-foreground">Assign a tenant to this room to start collecting rent.</p>
            <Button size="sm" className="mt-2" onClick={() => setIsAssigning(true)}>
              Assign Tenant
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
