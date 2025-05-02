"use client"

import type React from "react"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Switch } from "@/components/ui/switch"
import { Slider } from "@/components/ui/slider"
import { Loader2, MapPin } from "lucide-react"
import { useToast } from "@/components/ui/use-toast"

export function TenantPreferencesForm() {
  const router = useRouter()
  const { toast } = useToast()

  const [isSubmitting, setIsSubmitting] = useState(false)
  const [preferences, setPreferences] = useState({
    propertyType: "",
    isShared: false,
    maxRent: 1000,
    location: "",
    minBedrooms: 1,
    moveInDate: "",
    amenities: {
      parking: false,
      garden: false,
      petFriendly: false,
      furnished: true,
      billsIncluded: false,
    },
  })

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    setPreferences({
      ...preferences,
      [name]: value,
    })
  }

  const handleSelectChange = (name: string, value: string) => {
    setPreferences({
      ...preferences,
      [name]: value,
    })
  }

  const handleSwitchChange = (name: string, checked: boolean) => {
    setPreferences({
      ...preferences,
      [name]: checked,
    })
  }

  const handleAmenityChange = (name: string, checked: boolean) => {
    setPreferences({
      ...preferences,
      amenities: {
        ...preferences.amenities,
        [name]: checked,
      },
    })
  }

  const handleSliderChange = (name: string, value: number[]) => {
    setPreferences({
      ...preferences,
      [name]: value[0],
    })
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    // Validate form
    if (!preferences.propertyType || !preferences.location) {
      toast({
        title: "Missing information",
        description: "Please fill in all required fields.",
        variant: "destructive",
      })
      return
    }

    setIsSubmitting(true)
    try {
      // In a real app, this would be an API call to save preferences
      await new Promise((resolve) => setTimeout(resolve, 1500))

      toast({
        title: "Preferences saved",
        description: "Your rental preferences have been saved successfully.",
      })

      router.push("/listings")
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to save preferences. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="max-w-2xl mx-auto">
      <Card>
        <CardHeader>
          <CardTitle>Rental Preferences</CardTitle>
          <CardDescription>Set your preferences to find the perfect rental property</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit}>
            <div className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="propertyType">
                  Property Type <span className="text-red-500">*</span>
                </Label>
                <Select
                  value={preferences.propertyType}
                  onValueChange={(value) => handleSelectChange("propertyType", value)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select property type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="flat">Flat</SelectItem>
                    <SelectItem value="house">House</SelectItem>
                    <SelectItem value="studio">Studio</SelectItem>
                    <SelectItem value="any">Any</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <Label htmlFor="isShared">Shared Accommodation</Label>
                  <Switch
                    id="isShared"
                    checked={preferences.isShared}
                    onCheckedChange={(checked) => handleSwitchChange("isShared", checked)}
                  />
                </div>
                <p className="text-sm text-muted-foreground">
                  Enable if you're looking for a room in a shared property
                </p>
              </div>

              <div className="space-y-2">
                <div className="flex justify-between items-center">
                  <Label htmlFor="maxRent">Maximum Monthly Rent</Label>
                  <span className="text-sm font-medium">£{preferences.maxRent}</span>
                </div>
                <Slider
                  id="maxRent"
                  min={300}
                  max={3000}
                  step={50}
                  value={[preferences.maxRent]}
                  onValueChange={(value) => handleSliderChange("maxRent", value)}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="location">
                  Location <span className="text-red-500">*</span>
                </Label>
                <div className="relative">
                  <MapPin className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="location"
                    name="location"
                    placeholder="City or postcode"
                    value={preferences.location}
                    onChange={handleInputChange}
                    className="pl-8"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="minBedrooms">Minimum Bedrooms</Label>
                <Select
                  value={preferences.minBedrooms.toString()}
                  onValueChange={(value) => handleSelectChange("minBedrooms", value)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select minimum bedrooms" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="1">1 bedroom</SelectItem>
                    <SelectItem value="2">2 bedrooms</SelectItem>
                    <SelectItem value="3">3 bedrooms</SelectItem>
                    <SelectItem value="4">4+ bedrooms</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="moveInDate">Earliest Move-in Date</Label>
                <Input
                  id="moveInDate"
                  name="moveInDate"
                  type="date"
                  value={preferences.moveInDate}
                  onChange={handleInputChange}
                />
              </div>

              <div className="space-y-2">
                <Label>Amenities</Label>
                <div className="grid grid-cols-2 gap-4">
                  <div className="flex items-center space-x-2">
                    <Switch
                      id="parking"
                      checked={preferences.amenities.parking}
                      onCheckedChange={(checked) => handleAmenityChange("parking", checked)}
                    />
                    <Label htmlFor="parking">Parking</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Switch
                      id="garden"
                      checked={preferences.amenities.garden}
                      onCheckedChange={(checked) => handleAmenityChange("garden", checked)}
                    />
                    <Label htmlFor="garden">Garden</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Switch
                      id="petFriendly"
                      checked={preferences.amenities.petFriendly}
                      onCheckedChange={(checked) => handleAmenityChange("petFriendly", checked)}
                    />
                    <Label htmlFor="petFriendly">Pet Friendly</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Switch
                      id="furnished"
                      checked={preferences.amenities.furnished}
                      onCheckedChange={(checked) => handleAmenityChange("furnished", checked)}
                    />
                    <Label htmlFor="furnished">Furnished</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Switch
                      id="billsIncluded"
                      checked={preferences.amenities.billsIncluded}
                      onCheckedChange={(checked) => handleAmenityChange("billsIncluded", checked)}
                    />
                    <Label htmlFor="billsIncluded">Bills Included</Label>
                  </div>
                </div>
              </div>
            </div>
          </form>
        </CardContent>
        <CardFooter>
          <div className="flex justify-between w-full">
            <Button variant="outline" onClick={() => router.push("/listings")}>
              Cancel
            </Button>
            <Button onClick={handleSubmit} disabled={isSubmitting}>
              {isSubmitting && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
              Save Preferences
            </Button>
          </div>
        </CardFooter>
      </Card>
    </div>
  )
}
