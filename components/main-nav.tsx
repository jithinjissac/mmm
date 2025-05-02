import Link from "next/link"
import { Home } from "lucide-react"

export function MainNav() {
  return (
    <div className="flex gap-6 md:gap-10">
      <Link href="/" className="flex items-center space-x-2">
        <Home className="h-6 w-6" />
        <span className="inline-block font-bold">ARU Rental App</span>
      </Link>
      <nav className="flex gap-6">
        <Link
          href="/#features"
          className="flex items-center text-sm font-medium text-muted-foreground transition-colors hover:text-primary"
        >
          Features
        </Link>
        <Link
          href="/#testimonials"
          className="flex items-center text-sm font-medium text-muted-foreground transition-colors hover:text-primary"
        >
          Testimonials
        </Link>
        <Link
          href="/about"
          className="flex items-center text-sm font-medium text-muted-foreground transition-colors hover:text-primary"
        >
          About
        </Link>
        <Link
          href="/contact"
          className="flex items-center text-sm font-medium text-muted-foreground transition-colors hover:text-primary"
        >
          Contact
        </Link>
      </nav>
    </div>
  )
}
