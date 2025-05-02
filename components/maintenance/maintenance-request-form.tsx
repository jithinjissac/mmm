"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import * as z from "zod"
import { Loader2, Upload, AlertTriangle, CalendarIcon, Clock } from "lucide-react"
import { useToast } from "@/components/ui/use-toast"
import { useAuth } from "@/components/mock-auth-provider"
import { format } from "date-fns"
import { v4 as uuidv4 } from "uuid"

import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Calendar } from "@/components/ui/calendar"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Checkbox } from "@/components/ui/checkbox"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { cn } from "@/lib/utils"

// Define the form schema with Zod
const maintenanceRequestSchema = z.object({
  title: z.string().min(5, "Title must be at least 5 characters").max(100, "Title must be less than 100 characters"),
  description: z
    .string()
    .min(20, "Description must be at least 20 characters")
    .max(1000, "Description must be less than 1000 characters"),
  category: z.string().min(1, "Please select a category"),
  priority: z.string().min(1, "Please select a priority level"),
  property_id: z.string().min(1, "Please select a property"),
  room_id: z.string().min(1, "Please select a room"),
  preferred_date: z.date().optional(),
  preferred_time_slot: z.string().optional(),
  access_instructions: z.string().optional(),
  permission_to_enter: z.boolean().optional(),
  contact_method: z.string().optional(),
  alternative_contact: z.string().optional(),
  alternative_phone: z.string().optional(),
  additional_notes: z.string().optional(),
})

// Define the form values type
type MaintenanceRequestFormValues = z.infer<typeof maintenanceRequestSchema>

// Mock property and room data
const mockProperties = [
  { id: "prop-1", name: "Cozy City Apartment" },
  { id: "prop-2", name: "Spacious Family Home" },
  { id: "prop-3", name: "Rustic Countryside Cottage" },
]

// Mock room data - we'll filter this based on selected property
const mockRooms = [
  { id: "room-1", property_id: "prop-1", name: "Master Bedroom" },
  { id: "room-2", property_id: "prop-1", name: "Living Room" },
  { id: "room-3", property_id: "prop-1", name: "Kitchen" },
  { id: "room-4", property_id: "prop-1", name: "Bathroom" },
  { id: "room-5", property_id: "prop-2", name: "Master Bedroom" },
  { id: "room-6", property_id: "prop-2", name: "Guest Bedroom" },
  { id: "room-7", property_id: "prop-2", name: "Kitchen" },
  { id: "room-8", property_id: "prop-3", name: "Living Room" },
  { id: "room-9", property_id: "prop-3", name: "Bedroom" },
]

// Issue categories
const ISSUE_CATEGORIES = [
  { id: "plumbing", name: "Plumbing" },
  { id: "electrical", name: "Electrical" },
  { id: "heating", name: "Heating/Cooling" },
  { id: "appliance", name: "Appliance" },
  { id: "structural", name: "Structural" },
  { id: "pest", name: "Pest Control" },
  { id: "security", name: "Security" },
  { id: "flooring", name: "Flooring" },
  { id: "painting", name: "Painting/Walls" },
  { id: "exterior", name: "Exterior" },
  { id: "other", name: "Other" },
]

// Time slots
const TIME_SLOTS = [
  { id: "morning", name: "Morning (8am - 12pm)" },
  { id: "afternoon", name: "Afternoon (12pm - 4pm)" },
  { id: "evening", name: "Evening (4pm - 8pm)" },
]

// Contact methods
const CONTACT_METHODS = [
  { id: "email", name: "Email" },
  { id: "phone", name: "Phone" },
  { id: "sms", name: "SMS" },
  { id: "app", name: "In-App Notification" },
]

export function MaintenanceRequestForm() {
  const router = useRouter()
  const { toast } = useToast()
  const { user, isLoading } = useAuth()

  const [isSubmitting, setIsSubmitting] = useState(false)
  const [imageFiles, setImageFiles] = useState<File[]>([])
  const [imagePreviews, setImagePreviews] = useState<string[]>([])
  const [availableRooms, setAvailableRooms] = useState<typeof mockRooms>([])
  const [properties, setProperties] = useState<typeof mockProperties>([])
  const [isLoadingProperties, setIsLoadingProperties] = useState(true)
  const [formError, setFormError] = useState<string | null>(null)
  const [activeTab, setActiveTab] = useState("basic")

  // Initialize the form
  const form = useForm<MaintenanceRequestFormValues>({
    resolver: zodResolver(maintenanceRequestSchema),
    defaultValues: {
      title: "",
      description: "",
      category: "",
      priority: "medium",
      property_id: "",
      room_id: "",
      preferred_date: undefined,
      preferred_time_slot: "morning",
      access_instructions: "",
      permission_to_enter: false,
      contact_method: "email",
      alternative_contact: "",
      alternative_phone: "",
      additional_notes: "",
    },
  })

  // Load properties based on user role
  useEffect(() => {
    const loadProperties = async () => {
      setIsLoadingProperties(true)
      try {
        // In a real app, this would be an API call
        await new Promise((resolve) => setTimeout(resolve, 1000))

        // For tenants, we'd only show their rented property
        // For landlords, we'd show all their properties
        if (user?.role === "tenant") {
          // Mock: Assume tenant is in property-1
          setProperties([mockProperties[0]])
          form.setValue("property_id", "prop-1")

          // Filter rooms for this property
          const tenantRooms = mockRooms.filter((room) => room.property_id === "prop-1")
          setAvailableRooms(tenantRooms)

          // If tenant has only one room, pre-select it
          if (tenantRooms.length === 1) {
            form.setValue("room_id", tenantRooms[0].id)
          }
        } else {
          // For landlords, show all properties
          setProperties(mockProperties)
        }
      } catch (error) {
        console.error("Error loading properties:", error)
        toast({
          title: "Error",
          description: "Failed to load properties. Please try again.",
          variant: "destructive",
        })
      } finally {
        setIsLoadingProperties(false)
      }
    }

    if (user) {
      loadProperties()
    }
  }, [user, form, toast])

  // Handle property selection change
  const handlePropertyChange = (propertyId: string) => {
    form.setValue("property_id", propertyId)
    form.setValue("room_id", "") // Reset room selection

    // Filter rooms for the selected property
    const filteredRooms = mockRooms.filter((room) => room.property_id === propertyId)
    setAvailableRooms(filteredRooms)
  }

  // Handle image upload
  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const newFiles = Array.from(e.target.files)
      setImageFiles((prev) => [...prev, ...newFiles])

      // Create previews
      const newPreviews: string[] = []
      newFiles.forEach((file) => {
        const reader = new FileReader()
        reader.onloadend = () => {
          newPreviews.push(reader.result as string)
          if (newPreviews.length === newFiles.length) {
            setImagePreviews((prev) => [...prev, ...newPreviews])
          }
        }
        reader.readAsDataURL(file)
      })
    }
  }

  // Remove image
  const removeImage = (index: number) => {
    setImageFiles((prev) => prev.filter((_, i) => i !== index))
    setImagePreviews((prev) => prev.filter((_, i) => i !== index))
  }

  // Handle form submission
  const onSubmit = async (data: MaintenanceRequestFormValues) => {
    setIsSubmitting(true)
    setFormError(null)

    try {
      // In a real app, this would be an API call to submit the maintenance request
      // including uploading the image if present
      console.log("Submitting maintenance request:", data)
      console.log("Image files:", imageFiles)

      // Simulate API call
      await new Promise((resolve) => setTimeout(resolve, 2000))

      // Create a new maintenance request ID
      const newRequestId = `maint-${uuidv4().substring(0, 8)}`

      toast({
        title: "Success",
        description: "Maintenance request submitted successfully.",
      })

      // Redirect to maintenance dashboard
      if (user?.role === "tenant") {
        router.push("/dashboard/tenant/maintenance")
      } else {
        router.push("/dashboard/landlord/maintenance")
      }
    } catch (error) {
      console.error("Error submitting maintenance request:", error)

      // Set form error
      setFormError(error instanceof Error ? error.message : "Failed to submit maintenance request. Please try again.")

      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to submit maintenance request. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  if (isLoading || isLoadingProperties) {
    return (
      <div className="flex justify-center items-center h-64">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
        <span className="ml-2">Loading...</span>
      </div>
    )
  }

  return (
    <Card className="w-full max-w-3xl mx-auto">
      <CardHeader>
        <CardTitle>Maintenance Request</CardTitle>
        <CardDescription>Submit a detailed maintenance request for your property</CardDescription>
      </CardHeader>
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)}>
          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
            <TabsList className="grid grid-cols-4 mb-4 mx-6">
              <TabsTrigger value="basic">Basic Info</TabsTrigger>
              <TabsTrigger value="details">Details</TabsTrigger>
              <TabsTrigger value="scheduling">Scheduling</TabsTrigger>
              <TabsTrigger value="contact">Contact</TabsTrigger>
            </TabsList>

            <CardContent className="space-y-6 pt-0">
              {/* Form Error Alert */}
              {formError && (
                <Alert variant="destructive">
                  <AlertTriangle className="h-4 w-4" />
                  <AlertTitle>Error</AlertTitle>
                  <AlertDescription>{formError}</AlertDescription>
                </Alert>
              )}

              {/* Basic Info Tab */}
              <TabsContent value="basic" className="space-y-6">
                {/* Property Selection - Only for landlords */}
                {user?.role === "landlord" && (
                  <FormField
                    control={form.control}
                    name="property_id"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Property</FormLabel>
                        <Select
                          value={field.value}
                          onValueChange={(value) => {
                            field.onChange(value)
                            handlePropertyChange(value)
                          }}
                        >
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Select property" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            {properties.map((property) => (
                              <SelectItem key={property.id} value={property.id}>
                                {property.name}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                )}

                {/* Room Selection */}
                <FormField
                  control={form.control}
                  name="room_id"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Room</FormLabel>
                      <Select
                        value={field.value}
                        onValueChange={field.onChange}
                        disabled={!form.getValues("property_id") && user?.role === "landlord"}
                      >
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select room" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {availableRooms.map((room) => (
                            <SelectItem key={room.id} value={room.id}>
                              {room.name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormDescription>Select the specific room where the issue is located</FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {/* Issue Category */}
                <FormField
                  control={form.control}
                  name="category"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Issue Category</FormLabel>
                      <Select value={field.value} onValueChange={field.onChange}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select category" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {ISSUE_CATEGORIES.map((category) => (
                            <SelectItem key={category.id} value={category.id}>
                              {category.name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {/* Issue Title */}
                <FormField
                  control={form.control}
                  name="title"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Issue Title</FormLabel>
                      <FormControl>
                        <Input placeholder="Brief title of the issue" {...field} />
                      </FormControl>
                      <FormDescription>Provide a short, descriptive title for the maintenance issue</FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {/* Priority Level */}
                <FormField
                  control={form.control}
                  name="priority"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Priority Level</FormLabel>
                      <Select value={field.value} onValueChange={field.onChange}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select priority" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="low">Low - Can be fixed when convenient</SelectItem>
                          <SelectItem value="medium">Medium - Needs attention within a week</SelectItem>
                          <SelectItem value="high">High - Needs urgent attention</SelectItem>
                          <SelectItem value="emergency">Emergency - Immediate attention required</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <div className="flex justify-end">
                  <Button type="button" onClick={() => setActiveTab("details")}>
                    Next
                  </Button>
                </div>
              </TabsContent>

              {/* Details Tab */}
              <TabsContent value="details" className="space-y-6">
                {/* Issue Description */}
                <FormField
                  control={form.control}
                  name="description"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Description</FormLabel>
                      <FormControl>
                        <Textarea
                          placeholder="Please provide details about the issue..."
                          className="min-h-[150px]"
                          {...field}
                        />
                      </FormControl>
                      <FormDescription>
                        Describe the issue in detail, including when it started and any relevant information
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {/* Additional Notes */}
                <FormField
                  control={form.control}
                  name="additional_notes"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Additional Notes (Optional)</FormLabel>
                      <FormControl>
                        <Textarea
                          placeholder="Any additional information that might be helpful..."
                          className="min-h-[100px]"
                          {...field}
                        />
                      </FormControl>
                      <FormDescription>
                        Include any additional details that might help with diagnosing or fixing the issue
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {/* Image Upload */}
                <div className="space-y-2">
                  <FormLabel htmlFor="image">Upload Images (Optional)</FormLabel>
                  <div className="border-2 border-dashed rounded-md p-4 text-center">
                    <Input
                      id="image"
                      type="file"
                      accept="image/*"
                      multiple
                      className="hidden"
                      onChange={handleImageChange}
                    />
                    <FormLabel htmlFor="image" className="cursor-pointer block">
                      <div className="flex flex-col items-center">
                        <Upload className="h-8 w-8 text-muted-foreground mb-2" />
                        <span className="text-sm font-medium">Click to upload images</span>
                        <span className="text-xs text-muted-foreground mt-1">PNG, JPG or JPEG (max. 5MB each)</span>
                      </div>
                    </FormLabel>

                    {imagePreviews.length > 0 && (
                      <div className="mt-4 grid grid-cols-2 md:grid-cols-3 gap-4">
                        {imagePreviews.map((preview, index) => (
                          <div key={index} className="relative">
                            <img
                              src={preview || "/placeholder.svg"}
                              alt={`Issue preview ${index + 1}`}
                              className="h-24 w-full object-cover rounded-md"
                            />
                            <Button
                              type="button"
                              variant="destructive"
                              size="icon"
                              className="absolute -top-2 -right-2 h-6 w-6 rounded-full"
                              onClick={() => removeImage(index)}
                            >
                              ×
                            </Button>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>

                <div className="flex justify-between">
                  <Button type="button" variant="outline" onClick={() => setActiveTab("basic")}>
                    Previous
                  </Button>
                  <Button type="button" onClick={() => setActiveTab("scheduling")}>
                    Next
                  </Button>
                </div>
              </TabsContent>

              {/* Scheduling Tab */}
              <TabsContent value="scheduling" className="space-y-6">
                {/* Preferred Date */}
                <FormField
                  control={form.control}
                  name="preferred_date"
                  render={({ field }) => (
                    <FormItem className="flex flex-col">
                      <FormLabel>Preferred Date (Optional)</FormLabel>
                      <Popover>
                        <PopoverTrigger asChild>
                          <FormControl>
                            <Button
                              variant={"outline"}
                              className={cn(
                                "w-full pl-3 text-left font-normal",
                                !field.value && "text-muted-foreground",
                              )}
                            >
                              {field.value ? format(field.value, "PPP") : <span>Pick a date</span>}
                              <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                            </Button>
                          </FormControl>
                        </PopoverTrigger>
                        <PopoverContent className="w-auto p-0" align="start">
                          <Calendar
                            mode="single"
                            selected={field.value}
                            onSelect={field.onChange}
                            disabled={(date) => date < new Date()}
                            initialFocus
                          />
                        </PopoverContent>
                      </Popover>
                      <FormDescription>Select your preferred date for the maintenance visit</FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {/* Preferred Time Slot */}
                <FormField
                  control={form.control}
                  name="preferred_time_slot"
                  render={({ field }) => (
                    <FormItem className="space-y-3">
                      <FormLabel>Preferred Time (Optional)</FormLabel>
                      <FormControl>
                        <RadioGroup
                          onValueChange={field.onChange}
                          defaultValue={field.value}
                          className="flex flex-col space-y-1"
                        >
                          {TIME_SLOTS.map((slot) => (
                            <FormItem key={slot.id} className="flex items-center space-x-3 space-y-0">
                              <FormControl>
                                <RadioGroupItem value={slot.id} />
                              </FormControl>
                              <FormLabel className="font-normal">
                                {slot.name}
                                {slot.id === "morning" && <Clock className="ml-2 h-4 w-4 inline" />}
                              </FormLabel>
                            </FormItem>
                          ))}
                        </RadioGroup>
                      </FormControl>
                      <FormDescription>Select your preferred time slot for the maintenance visit</FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {/* Access Instructions */}
                <FormField
                  control={form.control}
                  name="access_instructions"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Access Instructions (Optional)</FormLabel>
                      <FormControl>
                        <Textarea
                          placeholder="Instructions for accessing the property..."
                          className="min-h-[100px]"
                          {...field}
                        />
                      </FormControl>
                      <FormDescription>
                        Provide any special instructions for accessing the property or room
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {/* Permission to Enter */}
                <FormField
                  control={form.control}
                  name="permission_to_enter"
                  render={({ field }) => (
                    <FormItem className="flex flex-row items-start space-x-3 space-y-0 rounded-md border p-4">
                      <FormControl>
                        <Checkbox checked={field.value} onCheckedChange={field.onChange} />
                      </FormControl>
                      <div className="space-y-1 leading-none">
                        <FormLabel>Permission to Enter</FormLabel>
                        <FormDescription>
                          Check this box if you give permission for maintenance staff to enter the property if you are
                          not present
                        </FormDescription>
                      </div>
                    </FormItem>
                  )}
                />

                <div className="flex justify-between">
                  <Button type="button" variant="outline" onClick={() => setActiveTab("details")}>
                    Previous
                  </Button>
                  <Button type="button" onClick={() => setActiveTab("contact")}>
                    Next
                  </Button>
                </div>
              </TabsContent>

              {/* Contact Tab */}
              <TabsContent value="contact" className="space-y-6">
                {/* Preferred Contact Method */}
                <FormField
                  control={form.control}
                  name="contact_method"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Preferred Contact Method</FormLabel>
                      <Select value={field.value} onValueChange={field.onChange}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select contact method" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {CONTACT_METHODS.map((method) => (
                            <SelectItem key={method.id} value={method.id}>
                              {method.name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormDescription>How would you prefer to be contacted about this request?</FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {/* Alternative Contact Person */}
                <FormField
                  control={form.control}
                  name="alternative_contact"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Alternative Contact Person (Optional)</FormLabel>
                      <FormControl>
                        <Input placeholder="Name of alternative contact person" {...field} />
                      </FormControl>
                      <FormDescription>
                        Provide the name of someone who can be contacted if you're unavailable
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {/* Alternative Contact Phone */}
                <FormField
                  control={form.control}
                  name="alternative_phone"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Alternative Contact Phone (Optional)</FormLabel>
                      <FormControl>
                        <Input placeholder="Phone number of alternative contact" {...field} />
                      </FormControl>
                      <FormDescription>Phone number for the alternative contact person</FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {/* Emergency Warning */}
                <Alert variant="warning">
                  <AlertTriangle className="h-4 w-4" />
                  <AlertTitle>Important Note</AlertTitle>
                  <AlertDescription>
                    For emergency issues that pose immediate danger (gas leaks, flooding, electrical hazards), please
                    also contact emergency services or your landlord directly.
                  </AlertDescription>
                </Alert>

                <div className="flex justify-between">
                  <Button type="button" variant="outline" onClick={() => setActiveTab("scheduling")}>
                    Previous
                  </Button>
                  <Button type="submit" disabled={isSubmitting}>
                    {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                    Submit Request
                  </Button>
                </div>
              </TabsContent>
            </CardContent>
          </Tabs>
        </form>
      </Form>
    </Card>
  )
}
