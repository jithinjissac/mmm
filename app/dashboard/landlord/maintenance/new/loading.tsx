import { Loader2 } from "lucide-react"

export default function NewLandlordMaintenanceRequestLoading() {
  return (
    <div className="flex flex-col space-y-6">
      <div>
        <h1 className="text-3xl font-bold">New Maintenance Request</h1>
        <p className="text-muted-foreground">Create a maintenance request for one of your properties</p>
      </div>

      <div className="flex justify-center items-center h-[60vh]">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
        <span className="ml-2">Loading form...</span>
      </div>
    </div>
  )
}
