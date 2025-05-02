"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Skeleton } from "@/components/ui/skeleton"
import { Plus, Edit, Trash2, Users } from "lucide-react"
import type { TenantGroup } from "@/types/tenant-groups"
import { getTenantGroups, deleteTenantGroup, mockRoommates } from "@/lib/mock-tenant-group-service"
import { useToast } from "@/components/ui/use-toast"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog"

export function TenantGroupList() {
  const router = useRouter()
  const { toast } = useToast()
  const [groups, setGroups] = useState<TenantGroup[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchGroups = async () => {
      setLoading(true)
      try {
        const data = await getTenantGroups()
        setGroups(data)
      } catch (error) {
        console.error("Failed to fetch tenant groups:", error)
        toast({
          title: "Error",
          description: "Failed to load tenant groups. Please try again.",
          variant: "destructive",
        })
      } finally {
        setLoading(false)
      }
    }

    fetchGroups()
  }, [toast])

  const handleDelete = async (id: string) => {
    try {
      await deleteTenantGroup(id)
      setGroups(groups.filter((group) => group.id !== id))
      toast({
        title: "Success",
        description: "Tenant group deleted successfully.",
      })
    } catch (error) {
      console.error("Failed to delete tenant group:", error)
      toast({
        title: "Error",
        description: "Failed to delete tenant group. Please try again.",
        variant: "destructive",
      })
    }
  }

  const getMemberNames = (memberIds: string[]) => {
    return memberIds.map((id) => {
      const member = mockRoommates.find((r) => r.id === id)
      return member ? member.name : "Unknown"
    })
  }

  if (loading) {
    return (
      <div className="space-y-4">
        {[...Array(3)].map((_, i) => (
          <Card key={i}>
            <CardHeader>
              <Skeleton className="h-6 w-1/3" />
              <Skeleton className="h-4 w-1/2" />
            </CardHeader>
            <CardContent>
              <Skeleton className="h-4 w-full mb-2" />
              <Skeleton className="h-4 w-2/3" />
            </CardContent>
            <CardFooter>
              <Skeleton className="h-10 w-full" />
            </CardFooter>
          </Card>
        ))}
      </div>
    )
  }

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-bold">Tenant Groups</h2>
        <Button onClick={() => router.push("/dashboard/tenant/groups/create")}>
          <Plus className="h-4 w-4 mr-1" />
          New Group
        </Button>
      </div>

      {groups.length === 0 ? (
        <div className="text-center py-12">
          <Users className="h-12 w-12 mx-auto text-muted-foreground" />
          <h3 className="text-lg font-medium mt-4">No tenant groups found</h3>
          <p className="text-muted-foreground mt-1">Create a new tenant group to assign chores more efficiently</p>
          <Button onClick={() => router.push("/dashboard/tenant/groups/create")} className="mt-4">
            <Plus className="h-4 w-4 mr-1" />
            Create Group
          </Button>
        </div>
      ) : (
        groups.map((group) => (
          <Card key={group.id}>
            <CardHeader>
              <CardTitle>{group.name}</CardTitle>
              <CardDescription>{group.description}</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <div className="text-sm font-medium">Members:</div>
                <div className="flex flex-wrap gap-2">
                  {getMemberNames(group.memberIds).map((name, index) => (
                    <Badge key={index} variant="secondary">
                      {name}
                    </Badge>
                  ))}
                </div>
              </div>
            </CardContent>
            <CardFooter className="flex justify-end gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => router.push(`/dashboard/tenant/groups/${group.id}/edit`)}
              >
                <Edit className="h-4 w-4 mr-1" />
                Edit
              </Button>
              <AlertDialog>
                <AlertDialogTrigger asChild>
                  <Button variant="destructive" size="sm">
                    <Trash2 className="h-4 w-4 mr-1" />
                    Delete
                  </Button>
                </AlertDialogTrigger>
                <AlertDialogContent>
                  <AlertDialogHeader>
                    <AlertDialogTitle>Are you sure?</AlertDialogTitle>
                    <AlertDialogDescription>
                      This will permanently delete the tenant group "{group.name}". This action cannot be undone.
                    </AlertDialogDescription>
                  </AlertDialogHeader>
                  <AlertDialogFooter>
                    <AlertDialogCancel>Cancel</AlertDialogCancel>
                    <AlertDialogAction onClick={() => handleDelete(group.id)}>Delete</AlertDialogAction>
                  </AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialog>
            </CardFooter>
          </Card>
        ))
      )}
    </div>
  )
}
