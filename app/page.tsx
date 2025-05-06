import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Building, User, Wrench, ArrowRight, Search, MapPin } from "lucide-react"
import { PropertySearchForm } from "@/components/property-search-form"

export default function HomePage() {
  return (
    <div className="flex flex-col min-h-screen">
      <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container flex h-14 items-center">
          <Link href="/" className="flex items-center space-x-2">
            <Building className="h-6 w-6" />
            <span className="font-bold text-xl">UK Rental</span>
          </Link>
          <nav className="ml-auto flex gap-4 sm:gap-6">
            <Link
              href="/listings"
              className="text-sm font-medium text-muted-foreground transition-colors hover:text-primary"
            >
              Listings
            </Link>
            <Link
              href="/dashboard"
              className="text-sm font-medium text-muted-foreground transition-colors hover:text-primary"
            >
              Dashboard
            </Link>
            <Link
              href="/signin"
              className="text-sm font-medium text-muted-foreground transition-colors hover:text-primary"
            >
              Sign In
            </Link>
            <Link href="/signup">
              <Button>Sign Up</Button>
            </Link>
          </nav>
        </div>
      </header>
      <main className="flex-1">
        {/* Hero Section with Search */}
        <section className="relative py-20 md:py-32 overflow-hidden bg-gradient-to-b from-blue-50 to-white">
          <div className="container px-4 md:px-6 relative z-10">
            <div className="flex flex-col items-center text-center max-w-3xl mx-auto mb-12">
              <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold tracking-tight mb-6">
                Find Your Perfect Home in the UK
              </h1>
              <p className="text-xl text-gray-600 mb-8 max-w-2xl">
                Search thousands of rental properties across the UK. From city apartments to suburban houses, find your
                ideal home today.
              </p>

              {/* Property Search Form */}
              <PropertySearchForm />
            </div>

            {/* Featured Properties Preview */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-12">
              <Card className="overflow-hidden hover:shadow-lg transition-shadow">
                <div className="relative h-48">
                  <img
                    src="/cozy-city-apartment.png"
                    alt="Modern apartment in London"
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute top-2 right-2 bg-primary text-white px-2 py-1 rounded text-sm font-medium">
                    Featured
                  </div>
                </div>
                <CardContent className="p-4">
                  <h3 className="font-bold text-lg mb-1">Modern City Apartment</h3>
                  <div className="flex items-center text-gray-500 mb-2">
                    <MapPin className="h-4 w-4 mr-1" />
                    <span className="text-sm">Central London, E1</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="font-bold text-lg">£1,200/month</span>
                    <Button variant="outline" size="sm" asChild>
                      <Link href="/listings/1">View</Link>
                    </Button>
                  </div>
                </CardContent>
              </Card>

              <Card className="overflow-hidden hover:shadow-lg transition-shadow">
                <div className="relative h-48">
                  <img
                    src="/suburban-house-exterior.png"
                    alt="Suburban house in Manchester"
                    className="w-full h-full object-cover"
                  />
                </div>
                <CardContent className="p-4">
                  <h3 className="font-bold text-lg mb-1">Spacious Family Home</h3>
                  <div className="flex items-center text-gray-500 mb-2">
                    <MapPin className="h-4 w-4 mr-1" />
                    <span className="text-sm">Manchester, M20</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="font-bold text-lg">£1,800/month</span>
                    <Button variant="outline" size="sm" asChild>
                      <Link href="/listings/2">View</Link>
                    </Button>
                  </div>
                </CardContent>
              </Card>

              <Card className="overflow-hidden hover:shadow-lg transition-shadow">
                <div className="relative h-48">
                  <img
                    src="/cozy-city-studio.png"
                    alt="Studio flat in Birmingham"
                    className="w-full h-full object-cover"
                  />
                </div>
                <CardContent className="p-4">
                  <h3 className="font-bold text-lg mb-1">Cozy Studio Apartment</h3>
                  <div className="flex items-center text-gray-500 mb-2">
                    <MapPin className="h-4 w-4 mr-1" />
                    <span className="text-sm">Birmingham, B1</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="font-bold text-lg">£850/month</span>
                    <Button variant="outline" size="sm" asChild>
                      <Link href="/listings/3">View</Link>
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </div>

            <div className="flex justify-center mt-8">
              <Button asChild>
                <Link href="/listings">
                  View All Properties <ArrowRight className="ml-2 h-4 w-4" />
                </Link>
              </Button>
            </div>
          </div>

          {/* Background decorative elements */}
          <div className="absolute top-0 right-0 -translate-y-1/4 translate-x-1/4 w-96 h-96 bg-blue-100 rounded-full opacity-50 blur-3xl"></div>
          <div className="absolute bottom-0 left-0 translate-y-1/4 -translate-x-1/4 w-96 h-96 bg-blue-100 rounded-full opacity-50 blur-3xl"></div>
        </section>

        {/* Features Section */}
        <section className="py-16 bg-white">
          <div className="container px-4 md:px-6">
            <h2 className="text-3xl font-bold text-center mb-12">Why Choose Our Platform</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              <div className="flex flex-col items-center text-center">
                <div className="bg-primary/10 p-4 rounded-full mb-4">
                  <Search className="h-8 w-8 text-primary" />
                </div>
                <h3 className="text-xl font-bold mb-2">Easy Search</h3>
                <p className="text-gray-600">
                  Find your perfect rental property with our powerful search tools. Filter by location, price, and
                  amenities.
                </p>
              </div>

              <div className="flex flex-col items-center text-center">
                <div className="bg-primary/10 p-4 rounded-full mb-4">
                  <Building className="h-8 w-8 text-primary" />
                </div>
                <h3 className="text-xl font-bold mb-2">Verified Listings</h3>
                <p className="text-gray-600">
                  All our properties are verified by our team to ensure quality and accuracy of information.
                </p>
              </div>

              <div className="flex flex-col items-center text-center">
                <div className="bg-primary/10 p-4 rounded-full mb-4">
                  <User className="h-8 w-8 text-primary" />
                </div>
                <h3 className="text-xl font-bold mb-2">Tenant Support</h3>
                <p className="text-gray-600">
                  Get support throughout your rental journey, from application to moving in and beyond.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* User Types Section */}
        <section className="py-16 bg-gray-50">
          <div className="container px-4 md:px-6">
            <h2 className="text-3xl font-bold text-center mb-12">Who We Serve</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <Card className="flex flex-col items-center text-center">
                <CardContent className="pt-6">
                  <div className="p-2 bg-primary/10 rounded-full mx-auto mb-4">
                    <User className="h-8 w-8 text-primary" />
                  </div>
                  <h3 className="text-xl font-bold mb-2">Tenants</h3>
                  <p className="mb-4 text-gray-600">
                    Find your perfect rental home, manage payments, and submit maintenance requests all in one place.
                  </p>
                  <Button asChild className="mt-2">
                    <Link href="/dashboard/tenant">
                      Tenant Dashboard <ArrowRight className="ml-2 h-4 w-4" />
                    </Link>
                  </Button>
                </CardContent>
              </Card>

              <Card className="flex flex-col items-center text-center">
                <CardContent className="pt-6">
                  <div className="p-2 bg-primary/10 rounded-full mx-auto mb-4">
                    <Building className="h-8 w-8 text-primary" />
                  </div>
                  <h3 className="text-xl font-bold mb-2">Landlords</h3>
                  <p className="mb-4 text-gray-600">
                    List your properties, screen tenants, collect rent, and manage maintenance requests efficiently.
                  </p>
                  <Button asChild className="mt-2">
                    <Link href="/dashboard/landlord">
                      Landlord Dashboard <ArrowRight className="ml-2 h-4 w-4" />
                    </Link>
                  </Button>
                </CardContent>
              </Card>

              <Card className="flex flex-col items-center text-center">
                <CardContent className="pt-6">
                  <div className="p-2 bg-primary/10 rounded-full mx-auto mb-4">
                    <Wrench className="h-8 w-8 text-primary" />
                  </div>
                  <h3 className="text-xl font-bold mb-2">Maintenance</h3>
                  <p className="mb-4 text-gray-600">
                    Receive and manage maintenance requests, schedule repairs, and communicate with landlords and
                    tenants.
                  </p>
                  <Button asChild className="mt-2">
                    <Link href="/dashboard/maintenance">
                      Maintenance Dashboard <ArrowRight className="ml-2 h-4 w-4" />
                    </Link>
                  </Button>
                </CardContent>
              </Card>
            </div>
          </div>
        </section>
      </main>
      <footer className="border-t py-8 bg-gray-50">
        <div className="container px-4 md:px-6">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <div className="flex items-center gap-2 mb-4 md:mb-0">
              <Building className="h-6 w-6" />
              <span className="text-xl font-bold">UK Rental</span>
            </div>
            <div className="flex flex-col md:flex-row items-center gap-4 md:gap-8">
              <Link href="/about" className="text-sm text-gray-600 hover:text-gray-900">
                About Us
              </Link>
              <Link href="/contact" className="text-sm text-gray-600 hover:text-gray-900">
                Contact
              </Link>
              <Link href="/terms" className="text-sm text-gray-600 hover:text-gray-900">
                Terms of Service
              </Link>
              <Link href="/privacy" className="text-sm text-gray-600 hover:text-gray-900">
                Privacy Policy
              </Link>
            </div>
          </div>
          <div className="mt-8 text-center text-sm text-gray-500">© 2023 UK Rental. All rights reserved.</div>
        </div>
      </footer>
    </div>
  )
}
