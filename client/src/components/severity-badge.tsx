import { Badge } from "@/components/ui/badge"
import { cn } from "@/lib/utils"

export type SeverityLevel = "high" | "medium" | "low" | "info"

interface SeverityBadgeProps {
  severity: SeverityLevel
  className?: string
}

const severityConfig = {
  high: {
    label: "High",
    className: "bg-severity-high text-white border-severity-high"
  },
  medium: {
    label: "Medium", 
    className: "bg-severity-medium text-white border-severity-medium"
  },
  low: {
    label: "Low",
    className: "bg-severity-low text-white border-severity-low"
  },
  info: {
    label: "Info",
    className: "bg-severity-info text-white border-severity-info"
  }
}

export function SeverityBadge({ severity, className }: SeverityBadgeProps) {
  const config = severityConfig[severity]
  
  return (
    <Badge 
      variant="outline"
      className={cn(config.className, className)}
    >
      {config.label}
    </Badge>
  )
}