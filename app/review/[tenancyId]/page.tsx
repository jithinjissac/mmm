import { ReviewForm } from "@/components/reviews/review-form"

export default function ReviewPage() {
  return (
    <div className="container max-w-4xl py-10">
      <h1 className="text-3xl font-bold tracking-tight mb-6">Write a Review</h1>
      <ReviewForm />
    </div>
  )
}
