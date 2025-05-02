"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Loader2, Search, UserCog } from "lucide-react"
import { useToast } from "@/components/ui/use-toast"
import { getAvailableRoles, updateUserRole } from "@/lib/services/role-management"
import { createClientSupabaseClient } from "@/lib/supabase/client"

export function RoleManager() {
  const [users, setUsers] = useState<any[]>([])
  const [filteredUsers, setFilteredUsers] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState("")
  const [selectedUser, setSelectedUser] = useState<any | null>(null)
  const [selectedRole, setSelectedRole] = useState<string>("")
  const [isUpdating, setIsUpdating] = useState(false)
  const { toast } = useToast()
  const availableRoles = getAvailableRoles()

  // Initialize Supabase client
  const supabase = createClientSupabaseClient()

  // Load users
  useEffect(() => {
    const loadUsers = async () => {
      try {
        setIsLoading(true)
        const { data, error } = await supabase.from("profiles").select("*").order("full_name")

        if (error) {
          console.error("Error loading users:", error)
          toast({
            title: "Error",
            description: "Failed to load users. Please try again.",
            variant: "destructive",
          })
          return
        }

        setUsers(data || [])
        setFilteredUsers(data || [])
      } catch (error) {
        console.error("Error in loadUsers:", error)
        toast({
          title: "Error",
          description: "An unexpected error occurred. Please try again.",
          variant: "destructive",
        })
      } finally {
        setIsLoading(false)
      }
    }

    loadUsers()
  }, [])

  // Filter users based on search query
  useEffect(() => {
    if (!searchQuery.trim()) {
      setFilteredUsers(users)
      return
    }

    const query = searchQuery.toLowerCase()
    const filtered = users.filter(
      (user) =>
        user.full_name?.toLowerCase().includes(query) ||
        user.email?.toLowerCase().includes(query) ||
        user.role?.toLowerCase().includes(query),
    )

    setFilteredUsers(filtered)
  }, [searchQuery, users])

  // Handle user selection
  const handleUserSelect = (user: any) => {
    setSelectedUser(user)
    setSelectedRole(user.role || "")
  }

  // Handle role update
  const handleRoleUpdate = async () => {
    if (!selectedUser || !selectedRole) return

    try {
      setIsUpdating(true)

      // Update the user's role
      const { success, error } = await updateUserRole(selectedUser.id, selectedRole)

      if (!success || error) {
        console.error("Error updating role:", error)
        toast({
          title: "Error",
          description: "Failed to update role. Please try again.",
          variant: "destructive",
        })
        return
      }

      // Update the local state
      const updatedUsers = users.map((user) => (user.id === selectedUser.id ? { ...user, role: selectedRole } : user))
      setUsers(updatedUsers)
      setFilteredUsers(
        filteredUsers.map((user) => (user.id === selectedUser.id ? { ...user, role: selectedRole } : user)),
      )

      // Reset the selected user
      setSelectedUser(null)
      setSelectedRole("")

      toast({
        title: "Success",
        description: "User role updated successfully.",
      })
    } catch (error) {
      console.error("Error in handleRoleUpdate:", error)
      toast({
        title: "Error",
        description: "An unexpected error occurred. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsUpdating(false)
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>User Role Management</CardTitle>
        <CardDescription>Manage user roles and permissions</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div className="relative">
            <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search users..."
              className="pl-8"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>

          {isLoading ? (
            <div className="flex h-40 items-center justify-center">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
          ) : (
            <div className="rounded-md border">
              <div className="grid grid-cols-12 gap-2 border-b bg-muted/50 p-2 font-medium">
                <div className="col-span-5">Name</div>
                <div className="col-span-5">Email</div>
                <div className="col-span-2">Role</div>
              </div>
              <div className="max-h-96 overflow-auto">
                {filteredUsers.length === 0 ? (
                  <div className="flex h-20 items-center justify-center text-muted-foreground">No users found</div>
                ) : (
                  filteredUsers.map((user) => (
                    <div
                      key={user.id}
                      className={`grid cursor-pointer grid-cols-12 gap-2 border-b p-2 hover:bg-muted/50 ${
                        selectedUser?.id === user.id ? "bg-muted" : ""
                      }`}
                      onClick={() => handleUserSelect(user)}
                    >
                      <div className="col-span-5 truncate">{user.full_name || "N/A"}</div>
                      <div className="col-span-5 truncate">{user.email || "N/A"}</div>
                      <div className="col-span-2">
                        <span
                          className={`inline-flex rounded-full px-2 py-0.5 text-xs font-medium ${
                            user.role === "admin"
                              ? "bg-red-100 text-red-800"
                              : user.role === "landlord"
                                ? "bg-blue-100 text-blue-800"
                                : user.role === "maintenance"
                                  ? "bg-yellow-100 text-yellow-800"
                                  : "bg-green-100 text-green-800"
                          }`}
                        >
                          {user.role || "tenant"}
                        </span>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          )}

          {selectedUser && (
            <div className="mt-4 rounded-md border p-4">
              <h3 className="mb-2 flex items-center gap-2 text-lg font-medium">
                <UserCog className="h-5 w-5" />
                Edit User Role
              </h3>
              <div className="grid gap-4 md:grid-cols-2">
                <div>
                  <Label htmlFor="user-name">User</Label>
                  <Input id="user-name" value={selectedUser.full_name || ""} disabled className="bg-muted/50" />
                </div>
                <div>
                  <Label htmlFor="user-role">Role</Label>
                  <Select value={selectedRole} onValueChange={setSelectedRole}>
                    <SelectTrigger id="user-role">
                      <SelectValue placeholder="Select a role" />
                    </SelectTrigger>
                    <SelectContent>
                      {availableRoles.map((role) => (
                        <SelectItem key={role} value={role}>
                          {role.charAt(0).toUpperCase() + role.slice(1)}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div className="mt-4 flex justify-end gap-2">
                <Button variant="outline" onClick={() => setSelectedUser(null)}>
                  Cancel
                </Button>
                <Button onClick={handleRoleUpdate} disabled={isUpdating || selectedRole === selectedUser.role}>
                  {isUpdating ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Updating...
                    </>
                  ) : (
                    "Update Role"
                  )}
                </Button>
              </div>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  )
}
