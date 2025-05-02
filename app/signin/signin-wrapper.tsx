"use client"

import dynamic from "next/dynamic"
import { Skeleton } from "@/components/ui/skeleton"
import { Card, CardContent } from "@/components/ui/card"

// Dynamically import the SignIn component with ssr: false
const SignInClient = dynamic(() => import("./signin-client"), {
  ssr: false,
  loading: () => <SignInLoadingSkeleton />,
})

export function SignInWrapper() {
  return <SignInClient />
}

function SignInLoadingSkeleton() {
  return (
    <Card className="w-full max-w-sm">
      <CardContent className="pt-6">
        <div className="space-y-2 text-center mb-6">
          <Skeleton className="h-8 w-3/4 mx-auto" />
          <Skeleton className="h-4 w-5/6 mx-auto" />
        </div>
        <div className="space-y-4">
          <div className="space-y-2">
            <Skeleton className="h-4 w-1/4" />
            <Skeleton className="h-10 w-full" />
          </div>
          <div className="space-y-2">
            <div className="flex justify-between">
              <Skeleton className="h-4 w-1/4" />
              <Skeleton className="h-4 w-1/4" />
            </div>
            <Skeleton className="h-10 w-full" />
          </div>
          <div className="flex items-center space-x-2">
            <Skeleton className="h-4 w-4 rounded" />
            <Skeleton className="h-4 w-1/4" />
          </div>
          <Skeleton className="h-10 w-full" />
        </div>
        <div className="mt-6 text-center">
          <Skeleton className="h-4 w-3/4 mx-auto" />
        </div>
      </CardContent>
    </Card>
  )
}
