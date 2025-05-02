import { Suspense } from "react"
import { TenanciesWrapper } from "./tenancies-wrapper"
import { Skeleton } from "@/components/ui/skeleton"

export default function TenanciesPage() {
  return (
    <div className="container max-w-6xl py-10">
      <h1 className="text-3xl font-bold tracking-tight mb-6">Your Tenancies</h1>
      <Suspense fallback={<TenanciesSkeleton />}>
        <TenanciesWrapper />
      </Suspense>
    </div>
  )
}

function TenanciesSkeleton() {
  return (
    <div className="space-y-4">
      <Skeleton className="h-10 w-[250px]" />
      <Skeleton className="h-[400px] w-full" />
    </div>
  )
}
