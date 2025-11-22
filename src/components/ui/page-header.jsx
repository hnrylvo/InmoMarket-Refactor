import { cn } from "@/lib/utils"

export function PageHeader({
  title,
  description,
  className,
  children
}) {
  return (
    <div className={cn("mb-8", className)}>
      <h1 className="text-3xl font-bold mb-2">{title}</h1>
      {description && (
        <p className="text-muted-foreground">{description}</p>
      )}
      {children}
    </div>
  )
} 