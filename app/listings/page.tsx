import { Suspense } from "react"
import { ListingDirectory } from "@/components/listings/listing-directory"

export default function ListingsPage() {
  return (
    <div className="container py-10">
      <h1 className="text-3xl font-bold tracking-tight mb-6">Property Listings</h1>
      <Suspense fallback={<div>Loading property listings...</div>}>
        <ListingDirectory />
      </Suspense>
    </div>
  )
}
