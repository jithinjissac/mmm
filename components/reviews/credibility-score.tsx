"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { Badge } from "@/components/ui/badge"
import { Award, Clock, CheckCircle, Home } from "lucide-react"

interface CredibilityScoreProps {
  userId: string
  userType: "landlord" | "tenant"
}

export function CredibilityScore({ userId, userType }: CredibilityScoreProps) {
  const [isLoading, setIsLoading] = useState(true)
  const [score, setScore] = useState(0)
  const [level, setLevel] = useState("")
  const [metrics, setMetrics] = useState<any[]>([])

  useEffect(() => {
    const loadCredibilityData = async () => {
      setIsLoading(true)
      try {
        // In a real app, this would be an API call
        await new Promise((resolve) => setTimeout(resolve, 500))

        // Mock data
        if (userType === "landlord") {
          setScore(130)
          setLevel("Gold")
          setMetrics([
            { name: "Response Time", score: 45, maxScore: 50, icon: Clock },
            { name: "Issue Resolution", score: 40, maxScore: 50, icon: CheckCircle },
            { name: "Property Maintenance", score: 45, maxScore: 50, icon: Home },
          ])
        } else {
          setScore(85)
          setLevel("Silver")
          setMetrics([
            { name: "Payment Reliability", score: 45, maxScore: 50, icon: Clock },
            { name: "Property Care", score: 30, maxScore: 50, icon: Home },
            { name: "Communication", score: 10, maxScore: 20, icon: CheckCircle },
          ])
        }
      } catch (error) {
        console.error("Error loading credibility data:", error)
      } finally {
        setIsLoading(false)
      }
    }

    loadCredibilityData()
  }, [userId, userType])

  const getProgressColor = (score: number, maxScore: number) => {
    const percentage = (score / maxScore) * 100
    if (percentage >= 80) return "bg-green-500"
    if (percentage >= 60) return "bg-yellow-500"
    return "bg-red-500"
  }

  const getLevelColor = (level: string) => {
    switch (level) {
      case "Gold":
        return "bg-yellow-50 text-yellow-700 border-yellow-200"
      case "Silver":
        return "bg-slate-50 text-slate-700 border-slate-200"
      case "Bronze":
        return "bg-amber-50 text-amber-700 border-amber-200"
      default:
        return ""
    }
  }

  if (isLoading) {
    return <div className="h-[200px] flex items-center justify-center">Loading...</div>
  }

  return (
    <Card>
      <CardHeader className="pb-2">
        <div className="flex justify-between items-center">
          <CardTitle className="text-lg">Credibility Score</CardTitle>
          <Badge variant="outline" className={getLevelColor(level)}>
            {level} Level
          </Badge>
        </div>
      </CardHeader>
      <CardContent>
        <div className="flex items-center gap-4 mb-4">
          <div className="bg-primary/10 p-3 rounded-full">
            <Award className="h-6 w-6 text-primary" />
          </div>
          <div>
            <div className="text-2xl font-bold">{score} points</div>
            <p className="text-sm text-muted-foreground">
              {userType === "landlord"
                ? "Based on tenant reviews and property management"
                : "Based on landlord reviews and rental history"}
            </p>
          </div>
        </div>

        <div className="space-y-4 mt-6">
          {metrics.map((metric) => (
            <div key={metric.name} className="space-y-1">
              <div className="flex justify-between text-sm">
                <div className="flex items-center gap-2">
                  <metric.icon className="h-4 w-4 text-muted-foreground" />
                  <span>{metric.name}</span>
                </div>
                <span>
                  {metric.score}/{metric.maxScore}
                </span>
              </div>
              <Progress
                value={(metric.score / metric.maxScore) * 100}
                className={getProgressColor(metric.score, metric.maxScore)}
              />
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  )
}
