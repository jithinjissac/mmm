import { ListingForm } from "@/components/listings/listing-form"

export default function CreateListingPage() {
  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold tracking-tight">Create Property Listing</h1>
      <p className="text-muted-foreground">Add a new property to rent out</p>
      <ListingForm />
    </div>
  )
}
