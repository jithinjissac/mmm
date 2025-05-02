"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import * as z from "zod"
import { format } from "date-fns"
import { CalendarIcon, Plus, Minus } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Calendar } from "@/components/ui/calendar"
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Checkbox } from "@/components/ui/checkbox"
import { Card, CardContent } from "@/components/ui/card"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import type { Tenant } from "@/types/bills"
import { cn } from "@/lib/utils"
import { MockBillService } from "@/lib/mock-bill-service"

const formSchema = z.object({
  title: z.string().min(2, {
    message: "Title must be at least 2 characters.",
  }),
  description: z.string().optional(),
  totalAmount: z.coerce.number().positive({
    message: "Amount must be greater than 0.",
  }),
  dueDate: z.date({
    required_error: "Due date is required.",
  }),
  category: z.enum(["utilities", "internet", "groceries", "rent", "other"], {
    required_error: "Please select a category.",
  }),
  splitMethod: z.enum(["equal", "custom"], {
    required_error: "Please select a split method.",
  }),
  isRecurring: z.boolean().default(false),
  recurringFrequency: z.enum(["weekly", "monthly", "quarterly", "yearly"]).optional(),
})

type FormValues = z.infer<typeof formSchema>

interface BillFormProps {
  tenants: Tenant[]
}

export function BillForm({ tenants }: BillFormProps) {
  const router = useRouter()
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [customShares, setCustomShares] = useState<{ [key: string]: number }>(
    tenants.reduce(
      (acc, tenant) => {
        acc[tenant.id] = Math.floor(100 / tenants.length)
        return acc
      },
      {} as { [key: string]: number },
    ),
  )

  // Calculate remaining percentage
  const totalPercentage = Object.values(customShares).reduce((sum, value) => sum + value, 0)
  const remainingPercentage = 100 - totalPercentage

  // Initialize form
  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      title: "",
      description: "",
      totalAmount: 0,
      category: "utilities",
      splitMethod: "equal",
      isRecurring: false,
    },
  })

  // Watch for form value changes
  const splitMethod = form.watch("splitMethod")
  const isRecurring = form.watch("isRecurring")
  const totalAmount = form.watch("totalAmount") || 0

  // Handle custom share adjustments
  const adjustShare = (tenantId: string, increment: boolean) => {
    setCustomShares((prev) => {
      const newShares = { ...prev }
      if (increment && remainingPercentage > 0) {
        newShares[tenantId] += 1
      } else if (!increment && newShares[tenantId] > 0) {
        newShares[tenantId] -= 1
      }
      return newShares
    })
  }

  // Calculate amount for each tenant based on percentage
  const calculateAmount = (percentage: number) => {
    return (percentage / 100) * totalAmount
  }

  async function onSubmit(values: FormValues) {
    setIsSubmitting(true)
    try {
      // Prepare shares based on split method
      const shares = tenants.map((tenant) => {
        const amount =
          values.splitMethod === "equal" ? totalAmount / tenants.length : calculateAmount(customShares[tenant.id] || 0)

        return {
          tenantId: tenant.id,
          amount: Number.parseFloat(amount.toFixed(2)),
          isPaid: false,
        }
      })

      // Create bill object
      const billData = {
        title: values.title,
        description: values.description || "",
        totalAmount: values.totalAmount,
        dueDate: values.dueDate.toISOString(),
        category: values.category,
        createdBy: "tenant-1", // Assuming current user is tenant-1
        isRecurring: values.isRecurring,
        recurringFrequency: values.isRecurring ? values.recurringFrequency : undefined,
        shares,
      }

      // Submit to API
      await MockBillService.createBill(billData)

      // Redirect to bills page
      router.push("/dashboard/tenant/bills")
      router.refresh()
    } catch (error) {
      console.error("Error creating bill:", error)
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        <div className="grid gap-6 md:grid-cols-2">
          <FormField
            control={form.control}
            name="title"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Bill Title</FormLabel>
                <FormControl>
                  <Input placeholder="e.g., Electricity Bill - April" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="category"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Category</FormLabel>
                <Select onValueChange={field.onChange} defaultValue={field.value}>
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Select a category" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    <SelectItem value="utilities">Utilities</SelectItem>
                    <SelectItem value="internet">Internet</SelectItem>
                    <SelectItem value="groceries">Groceries</SelectItem>
                    <SelectItem value="rent">Rent</SelectItem>
                    <SelectItem value="other">Other</SelectItem>
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <FormField
          control={form.control}
          name="description"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Description (Optional)</FormLabel>
              <FormControl>
                <Textarea placeholder="Add details about this bill" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <div className="grid gap-6 md:grid-cols-2">
          <FormField
            control={form.control}
            name="totalAmount"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Total Amount (£)</FormLabel>
                <FormControl>
                  <Input type="number" step="0.01" min="0" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="dueDate"
            render={({ field }) => (
              <FormItem className="flex flex-col">
                <FormLabel>Due Date</FormLabel>
                <Popover>
                  <PopoverTrigger asChild>
                    <FormControl>
                      <Button
                        variant={"outline"}
                        className={cn("w-full pl-3 text-left font-normal", !field.value && "text-muted-foreground")}
                      >
                        {field.value ? format(field.value, "PPP") : <span>Pick a date</span>}
                        <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                      </Button>
                    </FormControl>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0" align="start">
                    <Calendar mode="single" selected={field.value} onSelect={field.onChange} initialFocus />
                  </PopoverContent>
                </Popover>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <FormField
          control={form.control}
          name="splitMethod"
          render={({ field }) => (
            <FormItem className="space-y-3">
              <FormLabel>Split Method</FormLabel>
              <FormControl>
                <RadioGroup
                  onValueChange={field.onChange}
                  defaultValue={field.value}
                  className="flex flex-col space-y-1"
                >
                  <FormItem className="flex items-center space-x-3 space-y-0">
                    <FormControl>
                      <RadioGroupItem value="equal" />
                    </FormControl>
                    <FormLabel className="font-normal">Split equally among all tenants</FormLabel>
                  </FormItem>
                  <FormItem className="flex items-center space-x-3 space-y-0">
                    <FormControl>
                      <RadioGroupItem value="custom" />
                    </FormControl>
                    <FormLabel className="font-normal">Custom split (by percentage)</FormLabel>
                  </FormItem>
                </RadioGroup>
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        {splitMethod === "custom" && (
          <Card>
            <CardContent className="pt-6">
              <div className="space-y-4">
                <div className="flex justify-between text-sm">
                  <span>Tenant</span>
                  <div className="flex gap-4">
                    <span>Percentage</span>
                    <span>Amount</span>
                  </div>
                </div>

                {tenants.map((tenant) => (
                  <div key={tenant.id} className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Avatar className="h-8 w-8">
                        <AvatarImage src={tenant.avatarUrl || "/placeholder.svg"} alt={tenant.name} />
                        <AvatarFallback>{tenant.name.substring(0, 2)}</AvatarFallback>
                      </Avatar>
                      <span>{tenant.name}</span>
                    </div>

                    <div className="flex items-center gap-4">
                      <div className="flex items-center">
                        <Button
                          type="button"
                          variant="outline"
                          size="icon"
                          className="h-7 w-7 rounded-full"
                          onClick={() => adjustShare(tenant.id, false)}
                        >
                          <Minus className="h-3 w-3" />
                        </Button>
                        <span className="w-10 text-center">{customShares[tenant.id] || 0}%</span>
                        <Button
                          type="button"
                          variant="outline"
                          size="icon"
                          className="h-7 w-7 rounded-full"
                          onClick={() => adjustShare(tenant.id, true)}
                          disabled={remainingPercentage <= 0}
                        >
                          <Plus className="h-3 w-3" />
                        </Button>
                      </div>
                      <div className="w-20 text-right">£{calculateAmount(customShares[tenant.id] || 0).toFixed(2)}</div>
                    </div>
                  </div>
                ))}

                <div className="flex justify-between text-sm font-medium">
                  <span>Remaining</span>
                  <span className={remainingPercentage === 0 ? "text-green-600" : "text-red-600"}>
                    {remainingPercentage}%
                  </span>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        <FormField
          control={form.control}
          name="isRecurring"
          render={({ field }) => (
            <FormItem className="flex flex-row items-start space-x-3 space-y-0">
              <FormControl>
                <Checkbox checked={field.value} onCheckedChange={field.onChange} />
              </FormControl>
              <div className="space-y-1 leading-none">
                <FormLabel>This is a recurring bill</FormLabel>
                <FormDescription>Enable this if the bill repeats regularly</FormDescription>
              </div>
            </FormItem>
          )}
        />

        {isRecurring && (
          <FormField
            control={form.control}
            name="recurringFrequency"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Recurring Frequency</FormLabel>
                <Select onValueChange={field.onChange} defaultValue={field.value}>
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Select frequency" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    <SelectItem value="weekly">Weekly</SelectItem>
                    <SelectItem value="monthly">Monthly</SelectItem>
                    <SelectItem value="quarterly">Quarterly</SelectItem>
                    <SelectItem value="yearly">Yearly</SelectItem>
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />
        )}

        <div className="flex justify-end gap-3">
          <Button variant="outline" type="button" onClick={() => router.back()}>
            Cancel
          </Button>
          <Button type="submit" disabled={isSubmitting || (splitMethod === "custom" && remainingPercentage !== 0)}>
            {isSubmitting ? "Creating..." : "Create Bill"}
          </Button>
        </div>
      </form>
    </Form>
  )
}
