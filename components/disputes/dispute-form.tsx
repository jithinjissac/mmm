"use client"

import { useState } from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import * as z from "zod"
import { Button } from "@/components/ui/button"
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { useToast } from "@/components/ui/use-toast"
import { Loader2 } from "lucide-react"
import { FileUpload } from "@/components/file-upload"

const disputeFormSchema = z.object({
  tenancyId: z.string().min(1, "Please select a tenancy"),
  disputeType: z.string().min(1, "Please select a dispute type"),
  title: z.string().min(3, "Title must be at least 3 characters").max(100, "Title must be less than 100 characters"),
  description: z
    .string()
    .min(10, "Description must be at least 10 characters")
    .max(1000, "Description must be less than 1000 characters"),
  desiredOutcome: z
    .string()
    .min(10, "Desired outcome must be at least 10 characters")
    .max(500, "Desired outcome must be less than 500 characters"),
  evidenceFiles: z.array(z.string()).optional(),
})

type DisputeFormValues = z.infer<typeof disputeFormSchema>

// Mock tenancy data
const MOCK_TENANCIES = [
  { id: "tenancy1", name: "Modern City Apartment - Master Bedroom" },
  { id: "tenancy2", name: "Suburban House - Single Room" },
  { id: "tenancy3", name: "Downtown Loft - Studio" },
]

const DISPUTE_TYPES = [
  { id: "deposit", name: "Deposit Dispute" },
  { id: "maintenance", name: "Maintenance Issue" },
  { id: "rent", name: "Rent Payment" },
  { id: "damage", name: "Property Damage" },
  { id: "noise", name: "Noise Complaint" },
  { id: "other", name: "Other" },
]

export function DisputeForm() {
  const { toast } = useToast()
  const [isSubmitting, setIsSubmitting] = useState(false)

  const form = useForm<DisputeFormValues>({
    resolver: zodResolver(disputeFormSchema),
    defaultValues: {
      tenancyId: "",
      disputeType: "",
      title: "",
      description: "",
      desiredOutcome: "",
      evidenceFiles: [],
    },
  })

  async function onSubmit(values: DisputeFormValues) {
    setIsSubmitting(true)

    try {
      // In a real app, this would be an API call
      await new Promise((resolve) => setTimeout(resolve, 1500))

      console.log(values)

      toast({
        title: "Dispute submitted",
        description: "Your dispute has been submitted successfully and will be reviewed.",
      })

      form.reset()
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to submit dispute. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <FormField
            control={form.control}
            name="tenancyId"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Tenancy</FormLabel>
                <Select onValueChange={field.onChange} defaultValue={field.value} disabled={isSubmitting}>
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Select a tenancy" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    {MOCK_TENANCIES.map((tenancy) => (
                      <SelectItem key={tenancy.id} value={tenancy.id}>
                        {tenancy.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <FormDescription>Select the tenancy this dispute relates to</FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="disputeType"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Dispute Type</FormLabel>
                <Select onValueChange={field.onChange} defaultValue={field.value} disabled={isSubmitting}>
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Select dispute type" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    {DISPUTE_TYPES.map((type) => (
                      <SelectItem key={type.id} value={type.id}>
                        {type.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <FormDescription>Select the type of dispute you're raising</FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <FormField
          control={form.control}
          name="title"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Title</FormLabel>
              <FormControl>
                <Input placeholder="Brief title of your dispute" {...field} disabled={isSubmitting} />
              </FormControl>
              <FormDescription>A clear, concise title for your dispute</FormDescription>
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
                <Textarea
                  placeholder="Detailed description of the issue"
                  className="min-h-[150px]"
                  {...field}
                  disabled={isSubmitting}
                />
              </FormControl>
              <FormDescription>
                Provide a detailed description of the dispute, including dates, times, and specific details
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="desiredOutcome"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Desired Outcome</FormLabel>
              <FormControl>
                <Textarea
                  placeholder="What resolution are you seeking?"
                  className="min-h-[100px]"
                  {...field}
                  disabled={isSubmitting}
                />
              </FormControl>
              <FormDescription>Describe what you would consider a fair resolution to this dispute</FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="evidenceFiles"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Evidence Files</FormLabel>
              <FormControl>
                <FileUpload
                  value={field.value || []}
                  onChange={(urls) => field.onChange(urls)}
                  disabled={isSubmitting}
                  maxFiles={5}
                  acceptedFileTypes={{
                    "image/*": [".png", ".jpg", ".jpeg"],
                    "application/pdf": [".pdf"],
                  }}
                />
              </FormControl>
              <FormDescription>
                Upload photos, documents, or other evidence to support your dispute (max 5 files)
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />

        <Button type="submit" disabled={isSubmitting} className="w-full">
          {isSubmitting ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Submitting...
            </>
          ) : (
            "Submit Dispute"
          )}
        </Button>
      </form>
    </Form>
  )
}
