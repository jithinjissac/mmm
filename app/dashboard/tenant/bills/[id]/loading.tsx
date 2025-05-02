import { Skeleton } from "@/components/ui/skeleton"
import { Card, CardContent, CardHeader } from "@/components/ui/card"

export default function BillDetailLoading() {
  return (
    <div className="space-y-6">
      <Skeleton className="h-10 w-[120px]" />

      <Card>
        <CardHeader>
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div>
              <Skeleton className="h-8 w-[300px] mb-2" />
              <Skeleton className="h-4 w-[200px]" />
            </div>
            <div className="flex items-center gap-2">
              <Skeleton className="h-6 w-[100px]" />
              <Skeleton className="h-6 w-[100px]" />
            </div>
          </div>
        </CardHeader>

        <CardContent className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="flex flex-col">
              <Skeleton className="h-4 w-[100px] mb-2" />
              <Skeleton className="h-8 w-[150px]" />
            </div>

            <div className="flex flex-col">
              <Skeleton className="h-4 w-[100px] mb-2" />
              <Skeleton className="h-6 w-[150px]" />
            </div>

            <div className="flex flex-col">
              <Skeleton className="h-4 w-[100px] mb-2" />
              <Skeleton className="h-6 w-[150px]" />
              <Skeleton className="h-4 w-[100px] mt-1" />
            </div>
          </div>

          <Skeleton className="h-[1px] w-full" />

          <div>
            <Skeleton className="h-6 w-[200px] mb-4" />
            <div className="space-y-4">
              {Array(4)
                .fill(0)
                .map((_, i) => (
                  <div key={i} className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <Skeleton className="h-10 w-10 rounded-full" />
                      <div>
                        <Skeleton className="h-5 w-[150px] mb-1" />
                        <Skeleton className="h-4 w-[100px]" />
                      </div>
                    </div>

                    <div className="flex items-center gap-4">
                      <Skeleton className="h-6 w-[80px]" />
                      <Skeleton className="h-9 w-[100px]" />
                    </div>
                  </div>
                ))}
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
