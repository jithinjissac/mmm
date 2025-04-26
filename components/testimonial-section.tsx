import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Card, CardContent } from "@/components/ui/card"

export function TestimonialSection() {
  return (
    <section id="testimonials" className="w-full py-12 md:py-24 lg:py-32">
      <div className="container px-4 md:px-6">
        <div className="flex flex-col items-center justify-center space-y-4 text-center">
          <div className="space-y-2">
            <div className="inline-block rounded-lg bg-primary px-3 py-1 text-sm text-primary-foreground">
              Testimonials
            </div>
            <h2 className="text-3xl font-bold tracking-tighter md:text-4xl/tight">What Our Users Say</h2>
            <p className="max-w-[900px] text-muted-foreground md:text-xl/relaxed lg:text-base/relaxed xl:text-xl/relaxed">
              Hear from landlords, tenants, and maintenance companies who use our platform
            </p>
          </div>
        </div>
        <div className="mx-auto grid max-w-5xl grid-cols-1 gap-6 py-12 md:grid-cols-2 lg:grid-cols-3">
          <Card>
            <CardContent className="p-6">
              <div className="flex flex-col items-center space-y-4">
                <Avatar className="h-16 w-16">
                  <AvatarImage src="/confident-leader.png" alt="Sarah Johnson" />
                  <AvatarFallback>SJ</AvatarFallback>
                </Avatar>
                <div className="space-y-2 text-center">
                  <h3 className="text-xl font-bold">Sarah Johnson</h3>
                  <h4 className="text-sm text-muted-foreground">Landlord, Manchester</h4>
                  <p className="text-muted-foreground">
                    "This platform has transformed how I manage my properties. The room-specific features are perfect
                    for my shared houses."
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-6">
              <div className="flex flex-col items-center space-y-4">
                <Avatar className="h-16 w-16">
                  <AvatarImage src="/confident-urban-professional.png" alt="James Wilson" />
                  <AvatarFallback>JW</AvatarFallback>
                </Avatar>
                <div className="space-y-2 text-center">
                  <h3 className="text-xl font-bold">James Wilson</h3>
                  <h4 className="text-sm text-muted-foreground">Tenant, London</h4>
                  <p className="text-muted-foreground">
                    "Finding a room in a shared house was so easy. I could see details about potential roommates before
                    deciding."
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-6">
              <div className="flex flex-col items-center space-y-4">
                <Avatar className="h-16 w-16">
                  <AvatarImage src="/diligent-building-maintenance.png" alt="Robert Brown" />
                  <AvatarFallback>RB</AvatarFallback>
                </Avatar>
                <div className="space-y-2 text-center">
                  <h3 className="text-xl font-bold">Robert Brown</h3>
                  <h4 className="text-sm text-muted-foreground">Maintenance Company, Birmingham</h4>
                  <p className="text-muted-foreground">
                    "The maintenance request system streamlines our workflow. We can prioritize and track all jobs
                    efficiently."
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </section>
  )
}
