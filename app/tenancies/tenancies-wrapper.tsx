"use client"

import dynamic from "next/dynamic"
import { Loader2 } from "lucide-react"

// Import the client component with ssr: false to prevent server-side rendering
const TenanciesClient = dynamic(() => import("./tenancies-client"), {
  ssr: false,
  loading: () => (
    <div className="flex justify-center items-center h-64">
      <Loader2 className="h-8 w-8 animate-spin text-primary" />
    </div>
  ),
})

export function TenanciesWrapper() {
  return <TenanciesClient />
}
