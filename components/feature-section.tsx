import { Building, Users, ClipboardList, Shield, MessageSquare, CreditCard, Calendar, Wrench } from "lucide-react"

export function FeatureSection() {
  return (
    <section id="features" className="w-full py-12 md:py-24 lg:py-32 bg-muted">
      <div className="container px-4 md:px-6">
        <div className="flex flex-col items-center justify-center space-y-4 text-center">
          <div className="space-y-2">
            <div className="inline-block rounded-lg bg-primary px-3 py-1 text-sm text-primary-foreground">Features</div>
            <h2 className="text-3xl font-bold tracking-tighter md:text-4xl/tight">
              Everything You Need to Manage Properties
            </h2>
            <p className="max-w-[900px] text-muted-foreground md:text-xl/relaxed lg:text-base/relaxed xl:text-xl/relaxed">
              Our platform provides comprehensive tools for all users in the rental ecosystem
            </p>
          </div>
        </div>
        <div className="mx-auto grid max-w-5xl grid-cols-1 gap-6 py-12 md:grid-cols-2 lg:grid-cols-3">
          <div className="flex flex-col items-center space-y-2 rounded-lg border p-6 shadow-sm">
            <Building className="h-12 w-12 text-primary" />
            <h3 className="text-xl font-bold">Property Management</h3>
            <p className="text-center text-muted-foreground">
              List and manage properties with detailed information including photos, amenities, and location
            </p>
          </div>
          <div className="flex flex-col items-center space-y-2 rounded-lg border p-6 shadow-sm">
            <Users className="h-12 w-12 text-primary" />
            <h3 className="text-xl font-bold">Room Management</h3>
            <p className="text-center text-muted-foreground">
              Manage individual rooms with specific details for shared housing scenarios
            </p>
          </div>
          <div className="flex flex-col items-center space-y-2 rounded-lg border p-6 shadow-sm">
            <ClipboardList className="h-12 w-12 text-primary" />
            <h3 className="text-xl font-bold">Tenant Management</h3>
            <p className="text-center text-muted-foreground">
              Track tenant details, agreements, and communications in one place
            </p>
          </div>
          <div className="flex flex-col items-center space-y-2 rounded-lg border p-6 shadow-sm">
            <Shield className="h-12 w-12 text-primary" />
            <h3 className="text-xl font-bold">UK Compliance</h3>
            <p className="text-center text-muted-foreground">
              Stay compliant with UK rental regulations and data protection laws
            </p>
          </div>
          <div className="flex flex-col items-center space-y-2 rounded-lg border p-6 shadow-sm">
            <MessageSquare className="h-12 w-12 text-primary" />
            <h3 className="text-xl font-bold">Communication</h3>
            <p className="text-center text-muted-foreground">
              Built-in messaging system between landlords, tenants, and maintenance companies
            </p>
          </div>
          <div className="flex flex-col items-center space-y-2 rounded-lg border p-6 shadow-sm">
            <CreditCard className="h-12 w-12 text-primary" />
            <h3 className="text-xl font-bold">Payment Tracking</h3>
            <p className="text-center text-muted-foreground">
              Track rent payments, deposits, and other financial transactions
            </p>
          </div>
          <div className="flex flex-col items-center space-y-2 rounded-lg border p-6 shadow-sm">
            <Calendar className="h-12 w-12 text-primary" />
            <h3 className="text-xl font-bold">Scheduling</h3>
            <p className="text-center text-muted-foreground">
              Schedule viewings, maintenance visits, and other property-related events
            </p>
          </div>
          <div className="flex flex-col items-center space-y-2 rounded-lg border p-6 shadow-sm">
            <Wrench className="h-12 w-12 text-primary" />
            <h3 className="text-xl font-bold">Maintenance Requests</h3>
            <p className="text-center text-muted-foreground">
              Create, track, and resolve maintenance requests efficiently
            </p>
          </div>
          <div className="flex flex-col items-center space-y-2 rounded-lg border p-6 shadow-sm">
            <Users className="h-12 w-12 text-primary" />
            <h3 className="text-xl font-bold">Role-Based Access</h3>
            <p className="text-center text-muted-foreground">
              Tailored dashboards for admins, landlords, tenants, and maintenance companies
            </p>
          </div>
        </div>
      </div>
    </section>
  )
}
