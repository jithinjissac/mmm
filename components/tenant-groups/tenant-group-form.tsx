"use client"

import { useState, useEffect } from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import * as z from "zod"
import { Button } from "@/components/ui/button"
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Checkbox } from "@/components/ui/checkbox"
import type { TenantGroupFormData } from "@/types/tenant-groups"
import { getRoommates } from "@/lib/mock-tenant-group-service"

const formSchema = z.object({
  name: z.string().min(2, {
    message: "Group name must be at least 2 characters.",
  }),
  description: z.string().optional(),
  memberIds: z.array(z.string()).min(1, {
    message: "Select at least one tenant for the group.",
  }),
})

interface TenantGroupFormProps {
  initialData?: Partial<TenantGroupFormData>
  onSubmit: (data: TenantGroupFormData) => void
  isLoading?: boolean
}

export function TenantGroupForm({ initialData, onSubmit, isLoading = false }: TenantGroupFormProps) {
  const [roommates, setRoommates] = useState<{ id: string; name: string }[]>([])
  const [isLoadingData, setIsLoadingData] = useState(true)

  useEffect(() => {
    const fetchRoommates = async () => {
      setIsLoadingData(true)
      try {
        const data = await getRoommates()
        setRoommates(data)
      } catch (error) {
        console.error("Failed to fetch roommates:", error)
      } finally {
        setIsLoadingData(false)
      }
    }

    fetchRoommates()
  }, [])

  const form = useForm<TenantGroupFormData>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: initialData?.name || "",
      description: initialData?.description || "",
      memberIds: initialData?.memberIds || [],
    },
  })

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        <FormField
          control={form.control}
          name="name"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Group Name</FormLabel>
              <FormControl>
                <Input placeholder="Enter group name" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="description"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Description</FormLabel>
              <FormControl>
                <Textarea placeholder="Enter group description" className="resize-none" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="memberIds"
          render={() => (
            <FormItem>
              <div className="mb-4">
                <FormLabel className="text-base">Group Members</FormLabel>
                <FormDescription>Select the tenants who will be part of this group</FormDescription>
              </div>
              <div className="space-y-2">
                {roommates.map((roommate) => (
                  <FormField
                    key={roommate.id}
                    control={form.control}
                    name="memberIds"
                    render={({ field }) => {
                      return (
                        <FormItem key={roommate.id} className="flex flex-row items-start space-x-3 space-y-0">
                          <FormControl>
                            <Checkbox
                              checked={field.value?.includes(roommate.id)}
                              onCheckedChange={(checked) => {
                                return checked
                                  ? field.onChange([...(field.value || []), roommate.id])
                                  : field.onChange(field.value?.filter((value) => value !== roommate.id))
                              }}
                            />
                          </FormControl>
                          <FormLabel className="font-normal">{roommate.name}</FormLabel>
                        </FormItem>
                      )
                    }}
                  />
                ))}
              </div>
              <FormMessage />
            </FormItem>
          )}
        />

        <Button type="submit" className="w-full" disabled={isLoading || isLoadingData}>
          {isLoading ? "Saving..." : initialData ? "Update Group" : "Create Group"}
        </Button>
      </form>
    </Form>
  )
}
