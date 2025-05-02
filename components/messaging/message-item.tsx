import { formatDistanceToNow } from "date-fns"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { cn } from "@/lib/utils"

interface MessageItemProps {
  message: {
    id: string
    sender_name: string
    sender_role: string
    message: string
    created_at: string
  }
  isCurrentUser: boolean
}

export function MessageItem({ message, isCurrentUser }: MessageItemProps) {
  const formattedTime = formatDistanceToNow(new Date(message.created_at), { addSuffix: true })

  const initials = message.sender_name
    .split(" ")
    .map((name) => name[0])
    .join("")
    .toUpperCase()
    .substring(0, 2)

  return (
    <div className={cn("flex items-start gap-2", isCurrentUser ? "flex-row-reverse" : "flex-row")}>
      <Avatar className="h-8 w-8">
        <AvatarImage
          src={`/abstract-geometric-shapes.png?height=32&width=32&query=${message.sender_name}`}
          alt={message.sender_name}
        />
        <AvatarFallback>{initials}</AvatarFallback>
      </Avatar>

      <div className={cn("flex flex-col max-w-[80%]", isCurrentUser ? "items-end" : "items-start")}>
        <div
          className={cn(
            "px-4 py-2 rounded-lg",
            isCurrentUser ? "bg-primary text-primary-foreground rounded-tr-none" : "bg-muted rounded-tl-none",
          )}
        >
          <p className="text-sm">{message.message}</p>
        </div>

        <div className="flex items-center gap-1 mt-1 text-xs text-muted-foreground">
          <span className="font-medium">{isCurrentUser ? "You" : message.sender_name}</span>
          <span>•</span>
          <span>{formattedTime}</span>
          <span>•</span>
          <span className="capitalize">{message.sender_role}</span>
        </div>
      </div>
    </div>
  )
}
