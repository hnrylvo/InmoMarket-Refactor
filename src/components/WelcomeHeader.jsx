import { Button } from "@/components/ui/button"

export function WelcomeHeader() {
  return (
    <div className="text-center space-y-6">
      <h1 className="text-4xl font-bold text-foreground">Welcome to InmoMarket</h1>
      <p className="text-lg text-muted-foreground">Your Real Estate Management Solution</p>
      <div className="flex gap-4 justify-center">
        <Button variant="default">Get Started</Button>
        <Button variant="secondary">Learn More</Button>
      </div>
    </div>
  )
}

