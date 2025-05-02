"use client"

import { useState, useEffect } from "react"
import { useRouter, useParams } from "next/navigation"
import { TenantGroupForm } from "@/components/tenant-groups/tenant-group-form"
import { Button } from "@/components/ui/button"
import { ArrowLeft } from "lucide-react"
import { Skeleton } from "@/components/ui/skeleton"
import type { TenantGroupFormData } from "@/types/tenant-groups"
import { getTenantGroupById, updateTenantGroup } from "@/lib/mock-tenant-group-service"
import { useToast } from "@/components/ui/use-toast"

export default function EditTenantGroupPage() {
  const router = useRouter()
  const params = useParams()
  const { toast } = useToast()
  const [isLoading, setIsLoading] = useState(false)
  const [isFetching, setIsFetching] = useState(true)
  const [groupData, setGroupData] = useState<TenantGroupFormData | null>(null)

  const groupId = params.id as string

  useEffect(() => {
    const fetchGroup = async () => {
      setIsFetching(true)
      try {
        const group = await getTenantGroupById(groupId)
        if (group) {
          setGroupData({
            name: group.name,
            description: group.description,
            memberIds: group.memberIds,
          })
        } else {
          toast({
            title: "Error",
            description: "Tenant group not found.",
            variant: "destructive",
          })
          router.push("/dashboard/tenant/groups")
        }
      } catch (error) {
        console.error("Failed to fetch tenant group:", error)
        toast({
          title: "Error",
          description: "Failed to load tenant group. Please try again.",
          variant: "destructive",
        })
      } finally {
        setIsFetching(false)
      }
    }

    if (groupId) {
      fetchGroup()
    }
  }, [groupId, router, toast])

  const handleSubmit = async (data: TenantGroupFormData) => {
    setIsLoading(true)
    try {
      await updateTenantGroup(groupId, data)
      toast({
        title: "Success",
        description: "Tenant group updated successfully.",
      })
      router.push("/dashboard/tenant/groups")
    } catch (error) {
      console.error("Failed to update tenant group:", error)
      toast({
        title: "Error",
        description: "Failed to update tenant group. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  if (isFetching) {
    return (
      <div className="space-y-6">
        <div className="flex items-center">
          <Button variant="ghost" size="sm" disabled className="mr-2">
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <Skeleton className="h-8 w-64" />
        </div>
        <div className="max-w-2xl mx-auto space-y-4">
          <Skeleton className="h-10 w-full" />
          <Skeleton className="h-24 w-full" />
          <Skeleton className="h-40 w-full" />
          <Skeleton className="h-10 w-full" />
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center">
        <Button variant="ghost" size="sm" onClick={() => router.back()} className="mr-2">
          <ArrowLeft className="h-4 w-4" />
        </Button>
        <h1 className="text-2xl font-bold">Edit Tenant Group</h1>
      </div>
      <div className="max-w-2xl mx-auto">
        {groupData && <TenantGroupForm initialData={groupData} onSubmit={handleSubmit} isLoading={isLoading} />}
      </div>
    </div>
  )
}
