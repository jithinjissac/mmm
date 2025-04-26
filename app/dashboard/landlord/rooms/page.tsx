import { Suspense } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Bed, Plus } from "lucide-react"
import { getRooms } from "./actions"
import { RoomListSkeleton } from "@/components/skeletons/room-list-skeleton"
import { RoomCard } from "@/components/room-card"

export default function RoomsPage() {
  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold tracking-tight">Rooms</h1>
        <Link href="/dashboard/landlord/rooms/add">
          <Button>
            <Plus className="mr-2 h-4 w-4" /> Add Room
          </Button>
        </Link>
      </div>

      <Suspense fallback={<RoomListSkeleton />}>
        <RoomList />
      </Suspense>
    </div>
  )
}

async function RoomList() {
  const rooms = await getRooms()

  if (rooms.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center rounded-lg border border-dashed p-8 text-center">
        <Bed className="h-10 w-10 text-muted-foreground" />
        <h3 className="mt-4 text-lg font-semibold">No rooms yet</h3>
        <p className="mt-2 text-sm text-muted-foreground">Add your first room to start managing your rental spaces.</p>
        <Link href="/dashboard/landlord/rooms/add" className="mt-4">
          <Button>
            <Plus className="mr-2 h-4 w-4" /> Add Room
          </Button>
        </Link>
      </div>
    )
  }

  return (
    <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
      {rooms.map((room) => (
        <RoomCard key={room.id} room={room} />
      ))}
    </div>
  )
}
