"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { useToast } from "@/components/ui/use-toast"
import { UserPlus, Calendar } from "lucide-react"
import type { Database } from "@/lib/database.types"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Plus, UserMinus } from "lucide-react"
import { getTenantsByRoomId, addTenant, updateTenant } from "@/lib/local-storage/storage-service"
import type { LocalRoom, LocalTenant } from "@/lib/local-storage/storage-service"

type Room = Database["public"]["Tables"]["rooms"]["Row"] & {
  properties?: Database["public"]["Tables"]["properties"]["Row"]
}

interface TenantManagementProps {
  room: LocalRoom
}

export function TenantManagement({ room }: TenantManagementProps) {
  const { toast } = useToast()
  const [tenants, setTenants] = useState<LocalTenant[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [isAddingTenant, setIsAddingTenant] = useState(false)
  const [isRemovingTenant, setIsRemovingTenant] = useState(false)
  const [selectedTenant, setSelectedTenant] = useState<LocalTenant | null>(null)
  const [newTenant, setNewTenant] = useState({
    user_id: "",
    start_date: new Date().toISOString().split("T")[0],
    rent_amount: room.rent,
    deposit_amount: room.deposit,
    status: "active",
  })

  useEffect(() => {
    async function loadTenants() {
      try {
        const roomTenants = await getTenantsByRoomId(room.id)
        setTenants(roomTenants)
      } catch (error) {
        console.error("Error loading tenants:", error)
        toast({
          title: "Error loading tenants",
          description: "Failed to load tenant information.",
          variant: "destructive",
        })
      } finally {
        setIsLoading(false)
      }
    }

    loadTenants()
  }, [room.id, toast])

  const handleAddTenant = async () => {
    setIsAddingTenant(true)
    try {
      // Validate form
      if (!newTenant.user_id || !newTenant.start_date) {
        toast({
          title: "Missing required fields",
          description: "Please fill in all required fields.",
          variant: "destructive",
        })
        setIsAddingTenant(false)
        return
      }

      // Add tenant
      const tenant = await addTenant({
        room_id: room.id,
        user_id: newTenant.user_id,
        start_date: newTenant.start_date,
        end_date: null,
        rent_amount: newTenant.rent_amount,
        deposit_amount: newTenant.deposit_amount,
        status: newTenant.status,
      })

      // Update room status to occupied
      // await updateRoom(room.id, { status: "occupied" })

      setTenants([...tenants, tenant])
      toast({
        title: "Tenant added",
        description: "The tenant has been added successfully.",
      })

      // Reset form
      setNewTenant({
        user_id: "",
        start_date: new Date().toISOString().split("T")[0],
        rent_amount: room.rent,
        deposit_amount: room.deposit,
        status: "active",
      })
    } catch (error) {
      console.error("Error adding tenant:", error)
      toast({
        title: "Error adding tenant",
        description: "Failed to add tenant. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsAddingTenant(false)
    }
  }

  const handleRemoveTenant = async () => {
    if (!selectedTenant) return

    setIsRemovingTenant(true)
    try {
      // Update tenant status to inactive and set end date
      await updateTenant(selectedTenant.id, {
        status: "inactive",
        end_date: new Date().toISOString().split("T")[0],
      })

      // Update room status to vacant
      // await updateRoom(room.id, { status: "vacant" })

      // Update tenants list
      setTenants(
        tenants.map((tenant) =>
          tenant.id === selectedTenant.id
            ? {
                ...tenant,
                status: "inactive",
                end_date: new Date().toISOString().split("T")[0],
              }
            : tenant,
        ),
      )

      toast({
        title: "Tenant removed",
        description: "The tenant has been removed successfully.",
      })
    } catch (error) {
      console.error("Error removing tenant:", error)
      toast({
        title: "Error removing tenant",
        description: "Failed to remove tenant. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsRemovingTenant(false)
      setSelectedTenant(null)
    }
  }

  const activeTenants = tenants.filter((tenant) => tenant.status === "active")
  const inactiveTenants = tenants.filter((tenant) => tenant.status === "inactive")

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <div>
          <CardTitle>Tenant Management</CardTitle>
          <CardDescription>Manage tenants for this room</CardDescription>
        </div>
        <Dialog>
          <DialogTrigger asChild>
            <Button disabled={activeTenants.length >= room.max_occupants}>
              <Plus className="mr-2 h-4 w-4" /> Add Tenant
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Add New Tenant</DialogTitle>
              <DialogDescription>Add a new tenant to this room.</DialogDescription>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label htmlFor="user_id">Tenant Email or ID</Label>
                <Input
                  id="user_id"
                  value={newTenant.user_id}
                  onChange={(e) => setNewTenant({ ...newTenant, user_id: e.target.value })}
                  placeholder="Enter tenant email or ID"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="start_date">Start Date</Label>
                <Input
                  id="start_date"
                  type="date"
                  value={newTenant.start_date}
                  onChange={(e) => setNewTenant({ ...newTenant, start_date: e.target.value })}
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="rent_amount">Rent Amount (£)</Label>
                  <Input
                    id="rent_amount"
                    type="number"
                    value={newTenant.rent_amount}
                    onChange={(e) =>
                      setNewTenant({ ...newTenant, rent_amount: Number.parseFloat(e.target.value) || 0 })
                    }
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="deposit_amount">Deposit Amount (£)</Label>
                  <Input
                    id="deposit_amount"
                    type="number"
                    value={newTenant.deposit_amount}
                    onChange={(e) =>
                      setNewTenant({ ...newTenant, deposit_amount: Number.parseFloat(e.target.value) || 0 })
                    }
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="status">Status</Label>
                <Select
                  value={newTenant.status}
                  onValueChange={(value) => setNewTenant({ ...newTenant, status: value })}
                >
                  <SelectTrigger id="status">
                    <SelectValue placeholder="Select status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="active">Active</SelectItem>
                    <SelectItem value="pending">Pending</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => {}}>
                Cancel
              </Button>
              <Button onClick={handleAddTenant} disabled={isAddingTenant}>
                {isAddingTenant ? "Adding..." : "Add Tenant"}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <div className="text-center py-4">Loading tenants...</div>
        ) : tenants.length === 0 ? (
          <div className="text-center py-4">
            <p className="text-muted-foreground">No tenants assigned to this room yet.</p>
            <p className="text-sm text-muted-foreground mt-1">
              Click the "Add Tenant" button to assign a tenant to this room.
            </p>
          </div>
        ) : (
          <div className="space-y-6">
            {activeTenants.length > 0 && (
              <div>
                <h3 className="text-lg font-semibold mb-2">Current Tenants</h3>
                <div className="space-y-4">
                  {activeTenants.map((tenant) => (
                    <div
                      key={tenant.id}
                      className="flex items-center justify-between border-b pb-4 last:border-0 last:pb-0"
                    >
                      <div>
                        <div className="flex items-center">
                          <UserPlus className="h-5 w-5 text-primary mr-2" />
                          <p className="font-medium">{tenant.user_id}</p>
                        </div>
                        <div className="flex items-center mt-1">
                          <Calendar className="h-4 w-4 text-muted-foreground mr-1" />
                          <p className="text-sm text-muted-foreground">
                            From: {new Date(tenant.start_date).toLocaleDateString()}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center">
                        <p className="text-sm font-medium mr-4">£{tenant.rent_amount}/month</p>
                        <Dialog>
                          <DialogTrigger asChild>
                            <Button variant="outline" size="sm" onClick={() => setSelectedTenant(tenant)}>
                              <UserMinus className="h-4 w-4 mr-1" /> Remove
                            </Button>
                          </DialogTrigger>
                          <DialogContent>
                            <DialogHeader>
                              <DialogTitle>Remove Tenant</DialogTitle>
                              <DialogDescription>
                                Are you sure you want to remove this tenant from the room?
                              </DialogDescription>
                            </DialogHeader>
                            <DialogFooter>
                              <Button variant="outline" onClick={() => setSelectedTenant(null)}>
                                Cancel
                              </Button>
                              <Button variant="destructive" onClick={handleRemoveTenant} disabled={isRemovingTenant}>
                                {isRemovingTenant ? "Removing..." : "Remove Tenant"}
                              </Button>
                            </DialogFooter>
                          </DialogContent>
                        </Dialog>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {inactiveTenants.length > 0 && (
              <div>
                <h3 className="text-lg font-semibold mb-2">Previous Tenants</h3>
                <div className="space-y-4">
                  {inactiveTenants.map((tenant) => (
                    <div
                      key={tenant.id}
                      className="flex items-center justify-between border-b pb-4 last:border-0 last:pb-0"
                    >
                      <div>
                        <div className="flex items-center">
                          <UserMinus className="h-5 w-5 text-muted-foreground mr-2" />
                          <p className="font-medium">{tenant.user_id}</p>
                        </div>
                        <div className="flex items-center mt-1">
                          <Calendar className="h-4 w-4 text-muted-foreground mr-1" />
                          <p className="text-sm text-muted-foreground">
                            {new Date(tenant.start_date).toLocaleDateString()} -{" "}
                            {tenant.end_date ? new Date(tenant.end_date).toLocaleDateString() : "Present"}
                          </p>
                        </div>
                      </div>
                      <p className="text-sm font-medium">£{tenant.rent_amount}/month</p>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  )
}
