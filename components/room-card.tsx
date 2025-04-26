import Link from "next/link"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Bed, Building } from "lucide-react"
import type { Database } from "@/lib/database.types"

type Room = Database["public"]["Tables"]["rooms"]["Row"] & {
  room_images?: Database["public"]["Tables"]["room_images"]["Row"][]
  properties?: Database["public"]["Tables"]["properties"]["Row"]
}

interface RoomCardProps {
  room: Room
}

export function RoomCard({ room }: RoomCardProps) {
  return (
    <Link href={`/dashboard/landlord/rooms/${room.id}`}>
      <Card className="overflow-hidden hover:shadow-md transition-shadow cursor-pointer h-full flex flex-col">
        <div className="h-48 w-full overflow-hidden">
          {room.room_images && room.room_images.length > 0 ? (
            <img
              src={
                room.room_images.find((img) => img.is_primary)?.url ||
                room.room_images[0].url ||
                "/placeholder.svg?height=400&width=600&query=room" ||
                "/placeholder.svg"
              }
              alt={`${room.name}`}
              className="h-full w-full object-cover"
            />
          ) : (
            <div className="flex h-full w-full items-center justify-center bg-muted">
              <Bed className="h-12 w-12 text-muted-foreground" />
            </div>
          )}
        </div>
        <CardContent className="p-4 flex-1 flex flex-col">
          <div className="flex justify-between items-center mb-2">
            <h3 className="text-lg font-bold">{room.name}</h3>
            <Badge variant={room.status === "vacant" ? "outline" : "default"}>
              {room.status.charAt(0).toUpperCase() + room.status.slice(1)}
            </Badge>
          </div>

          {room.properties && (
            <p className="flex items-center gap-1 text-sm text-muted-foreground mb-3">
              <Building className="h-3.5 w-3.5" />
              {room.properties.name}
            </p>
          )}

          <div className="grid grid-cols-2 gap-2 mb-4">
            <div className="text-sm">
              <span className="text-muted-foreground">Type:</span>{" "}
              {room.room_type.charAt(0).toUpperCase() + room.room_type.slice(1)}
            </div>
            <div className="text-sm">
              <span className="text-muted-foreground">Max:</span> {room.max_occupants} occupants
            </div>
          </div>

          {room.description && <p className="text-sm text-muted-foreground line-clamp-2 mb-4">{room.description}</p>}

          <div className="mt-auto">
            <div className="flex justify-between items-center">
              <span className="text-lg font-bold">£{room.rent}/month</span>
              <span className="text-sm text-muted-foreground">Deposit: £{room.deposit}</span>
            </div>
          </div>
        </CardContent>
      </Card>
    </Link>
  )
}
