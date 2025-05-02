"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Bed, Plus } from "lucide-react"
import { RoomListSkeleton } from "@/components/skeletons/room-list-skeleton"
import { RoomCard } from "@/components/room-card"
import { useAuth } from "@/components/mock-auth-provider" // Changed from auth-provider to mock-auth-provider
import { getAllRooms } from "@/lib/local-storage/storage-service"
import type { LocalRoom } from "@/lib/local-storage/storage-service"

export default function RoomsPage() {
  const { user } = useAuth()
  const [rooms, setRooms] = useState<LocalRoom[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    async function loadRooms() {
      try {
        if (!user) {
          setError("You need to be logged in to view your rooms.")
          setIsLoading(false)
          return
        }

        const allRooms = await getAllRooms()

        // Filter rooms by landlord ID
        const userRooms = allRooms.filter((room) => room.properties && room.properties.landlord_id === user.id)

        setRooms(userRooms)
        setIsLoading(false)
      } catch (err) {
        console.error("Error loading rooms:", err)
        setError("Failed to load rooms. Please try again.")
        setIsLoading(false)
      }
    }

    loadRooms()
  }, [user])

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

      {isLoading ? (
        <RoomListSkeleton />
      ) : error ? (
        <div className="rounded-lg border border-destructive bg-destructive/10 p-8 text-center">
          <h2 className="text-lg font-semibold">Error Loading Rooms</h2>
          <p className="mt-2 text-muted-foreground">{error}</p>
        </div>
      ) : rooms.length === 0 ? (
        <div className="flex flex-col items-center justify-center rounded-lg border border-dashed p-8 text-center">
          <Bed className="h-10 w-10 text-muted-foreground" />
          <h3 className="mt-4 text-lg font-semibold">No rooms yet</h3>
          <p className="mt-2 text-sm text-muted-foreground">
            Add your first room to start managing your rental spaces.
          </p>
          <Link href="/dashboard/landlord/rooms/add" className="mt-4">
            <Button>
              <Plus className="mr-2 h-4 w-4" /> Add Room
            </Button>
          </Link>
        </div>
      ) : (
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {rooms.map((room) => (
            <RoomCard key={room.id} room={room} />
          ))}
        </div>
      )}
    </div>
  )
}
