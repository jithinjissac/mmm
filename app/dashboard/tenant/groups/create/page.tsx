"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { TenantGroupForm } from "@/components/tenant-groups/tenant-group-form"
import { Button } from "@/components/ui/button"
import { ArrowLeft } from "lucide-react"
import type { TenantGroupFormData } from "@/types/tenant-groups"
import { createTenantGroup } from "@/lib/mock-tenant-group-service"
import { useToast } from "@/components/ui/use-toast"

export default function CreateTenantGroupPage() {
  const router = useRouter()
  const { toast } = useToast()
  const [isLoading, setIsLoading] = useState(false)

  const handleSubmit = async (data: TenantGroupFormData) => {
    setIsLoading(true)
    try {
      await createTenantGroup(data)
      toast({
        title: "Success",
        description: "Tenant group created successfully.",
      })
      router.push("/dashboard/tenant/groups")
    } catch (error) {
      console.error("Failed to create tenant group:", error)
      toast({
        title: "Error",
        description: "Failed to create tenant group. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center">
        <Button variant="ghost" size="sm" onClick={() => router.back()} className="mr-2">
          <ArrowLeft className="h-4 w-4" />
        </Button>
        <h1 className="text-2xl font-bold">Create Tenant Group</h1>
      </div>
      <div className="max-w-2xl mx-auto">
        <TenantGroupForm onSubmit={handleSubmit} isLoading={isLoading} />
      </div>
    </div>
  )
}
