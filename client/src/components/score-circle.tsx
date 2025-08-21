import { motion } from "framer-motion"
import { cn } from "@/lib/utils"

interface ScoreCircleProps {
  score: number
  size?: "sm" | "md" | "lg"
  className?: string
  showLabel?: boolean
  label?: string
}

const sizeClasses = {
  sm: "w-16 h-16",
  md: "w-24 h-24", 
  lg: "w-32 h-32"
}

const textSizes = {
  sm: "text-xs",
  md: "text-sm",
  lg: "text-lg"
}

export function ScoreCircle({ 
  score, 
  size = "md", 
  className,
  showLabel = true,
  label = "Score"
}: ScoreCircleProps) {
  const normalizedScore = Math.max(0, Math.min(100, score))
  const radius = size === "lg" ? 58 : size === "md" ? 42 : 26
  const circumference = 2 * Math.PI * radius
  const strokeDashoffset = circumference - (normalizedScore / 100) * circumference

  const getScoreColor = (score: number) => {
    if (score >= 80) return "text-success"
    if (score >= 60) return "text-warning"
    if (score >= 40) return "text-severity-medium"
    return "text-severity-high"
  }

  const getStrokeColor = (score: number) => {
    if (score >= 80) return "stroke-success"
    if (score >= 60) return "stroke-warning"
    if (score >= 40) return "stroke-severity-medium"
    return "stroke-severity-high"
  }

  return (
    <div className={cn("relative flex flex-col items-center", className)}>
      <div className={cn("relative", sizeClasses[size])}>
        <svg
          className="w-full h-full transform -rotate-90"
          viewBox="0 0 120 120"
        >
          {/* Background circle */}
          <circle
            cx="60"
            cy="60"
            r={radius}
            strokeWidth="8"
            className="fill-none stroke-muted"
          />
          
          {/* Progress circle */}
          <motion.circle
            cx="60"
            cy="60"
            r={radius}
            strokeWidth="8"
            className={cn("fill-none score-circle", getStrokeColor(normalizedScore))}
            strokeLinecap="round"
            strokeDasharray={circumference}
            initial={{ strokeDashoffset: circumference }}
            animate={{ strokeDashoffset }}
            transition={{ duration: 2, ease: "easeInOut" }}
          />
        </svg>
        
        {/* Score text */}
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="text-center">
            <motion.div
              className={cn("font-bold", textSizes[size], getScoreColor(normalizedScore))}
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: 1, duration: 0.5 }}
            >
              {Math.round(normalizedScore)}
            </motion.div>
            {showLabel && size !== "sm" && (
              <div className="text-xs text-muted-foreground mt-1">
                {label}
              </div>
            )}
          </div>
        </div>
      </div>
      
      {showLabel && size === "sm" && (
        <div className="text-xs text-muted-foreground mt-1 text-center">
          {label}
        </div>
      )}
    </div>
  )
}