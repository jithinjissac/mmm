import { CardTitle, CardDescription } from "@/components/ui/card"
import { Building, User } from "lucide-react"

interface MessageHeaderProps {
  tenancyDetails: {
    property_name: string
    room_name: string
    landlord_name: string
    tenant_name: string
  }
}

export function MessageHeader({ tenancyDetails }: MessageHeaderProps) {
  return (
    <div>
      <CardTitle className="text-xl flex items-center gap-2">
        <Building className="h-5 w-5" />
        Conversation
      </CardTitle>
      <CardDescription className="mt-1">
        <div className="flex flex-col gap-1">
          <span>
            <strong>Property:</strong> {tenancyDetails.property_name} - {tenancyDetails.room_name}
          </span>
          <div className="flex items-center gap-4">
            <span className="flex items-center gap-1">
              <User className="h-3 w-3" />
              <strong>Landlord:</strong> {tenancyDetails.landlord_name}
            </span>
            <span className="flex items-center gap-1">
              <User className="h-3 w-3" />
              <strong>Tenant:</strong> {tenancyDetails.tenant_name}
            </span>
          </div>
        </div>
      </CardDescription>
    </div>
  )
}
