import type { Metadata } from "next"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { DisputeForm } from "@/components/disputes/dispute-form"
import { DisputeList } from "@/components/disputes/dispute-list"

export const metadata: Metadata = {
  title: "Disputes | UK Rental Solution",
  description: "Manage and resolve disputes related to your tenancies",
}

export default function DisputesPage() {
  return (
    <div className="container mx-auto py-6 space-y-6">
      <div className="flex flex-col gap-2">
        <h1 className="text-3xl font-bold tracking-tight">Disputes</h1>
        <p className="text-muted-foreground">Raise and manage disputes related to your tenancies</p>
      </div>

      <Tabs defaultValue="list" className="w-full">
        <TabsList className="grid w-full max-w-md grid-cols-2">
          <TabsTrigger value="list">My Disputes</TabsTrigger>
          <TabsTrigger value="create">Create Dispute</TabsTrigger>
        </TabsList>

        <TabsContent value="list" className="mt-6">
          <DisputeList />
        </TabsContent>

        <TabsContent value="create" className="mt-6">
          <div className="max-w-3xl mx-auto">
            <DisputeForm />
          </div>
        </TabsContent>
      </Tabs>
    </div>
  )
}
