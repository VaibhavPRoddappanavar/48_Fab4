import { useEffect, useState } from "react"
import { motion } from "framer-motion"
import { useNavigate, useSearchParams } from "react-router-dom"
import { Shield, Search, Zap, CheckCircle, Loader2 } from "lucide-react"
import { Progress } from "@/components/ui/progress"
import { Card, CardContent } from "@/components/ui/card"
import { Navigation } from "@/components/navigation"

interface ScanStep {
  id: string
  label: string
  description: string
  icon: React.ElementType
  completed: boolean
}

const scanSteps: ScanStep[] = [
  {
    id: "start",
    label: "Starting Scan",
    description: "Initializing security analysis...",
    icon: Shield,
    completed: false
  },
  {
    id: "headers", 
    label: "Checking Headers",
    description: "Analyzing HTTP security headers...",
    icon: Search,
    completed: false
  },
  {
    id: "performance",
    label: "Performance Tests", 
    description: "Running speed and optimization checks...",
    icon: Zap,
    completed: false
  },
  {
    id: "complete",
    label: "Generating Report",
    description: "Compiling results and AI recommendations...",
    icon: CheckCircle,
    completed: false
  }
]

const tips = [
  "Did you know? HTTPS encryption protects user data and improves SEO rankings.",
  "Security headers like HSTS can prevent many common attack vectors.", 
  "Page load speed affects both user experience and search engine rankings.",
  "Accessibility features help everyone use your website more effectively.",
  "Regular security scans help identify vulnerabilities before attackers do."
]

export default function ScanProgress() {
  const [currentStep, setCurrentStep] = useState(0)
  const [progress, setProgress] = useState(0)
  const [steps, setSteps] = useState(scanSteps)
  const [currentTip, setCurrentTip] = useState(0)
  const [searchParams] = useSearchParams()
  const navigate = useNavigate()
  
  const scanType = searchParams.get("type") || "quick"
  const scanUrl = sessionStorage.getItem("scanUrl") || "example.com"

  useEffect(() => {
    // Rotate tips every 3 seconds
    const tipInterval = setInterval(() => {
      setCurrentTip((prev) => (prev + 1) % tips.length)
    }, 3000)

    // Simulate scan progress
    const stepDuration = scanType === "quick" ? 2000 : 3000 // Quick scan: 8s, Deep scan: 12s
    
    const progressInterval = setInterval(() => {
      setProgress((prev) => {
        const newProgress = prev + (100 / (steps.length * 20))
        return Math.min(newProgress, 100)
      })
    }, stepDuration / 20)

    const stepInterval = setInterval(() => {
      setCurrentStep((prev) => {
        const nextStep = prev + 1
        if (nextStep < steps.length) {
          setSteps(prevSteps => 
            prevSteps.map((step, index) => ({
              ...step,
              completed: index < nextStep
            }))
          )
          return nextStep
        } else {
          // Scan complete
          clearInterval(stepInterval)
          clearInterval(progressInterval)
          clearInterval(tipInterval)
          
          setTimeout(() => {
            navigate(`/${scanType}-scan-report`)
          }, 1000)
          
          return prev
        }
      })
    }, stepDuration)

    return () => {
      clearInterval(stepInterval)
      clearInterval(progressInterval) 
      clearInterval(tipInterval)
    }
  }, [scanType, navigate, steps.length])

  return (
    <div className="min-h-screen bg-gradient-hero">
      <Navigation />
      
      <div className="pt-32 pb-16 px-4 sm:px-6 lg:px-8">
        <div className="max-w-3xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center mb-12"
          >
            <h1 className="text-3xl sm:text-4xl font-bold mb-4">
              {scanType === "quick" ? "Quick Scan" : "Deep Scan"} in Progress
            </h1>
            <p className="text-xl text-muted-foreground mb-2">
              Analyzing: <span className="font-semibold">{scanUrl}</span>
            </p>
            <p className="text-sm text-muted-foreground">
              This will take approximately {scanType === "quick" ? "30 seconds" : "1-2 minutes"}
            </p>
          </motion.div>

          <Card className="glass shadow-elegant mb-8">
            <CardContent className="p-8">
              {/* Progress Bar */}
              <div className="mb-8">
                <div className="flex justify-between text-sm mb-2">
                  <span>Progress</span>
                  <span>{Math.round(progress)}%</span>
                </div>
                <Progress 
                  value={progress} 
                  className="h-3"
                />
              </div>

              {/* Scan Steps */}
              <div className="space-y-4">
                {steps.map((step, index) => {
                  const Icon = step.icon
                  const isActive = index === currentStep
                  const isCompleted = step.completed
                  
                  return (
                    <motion.div
                      key={step.id}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: index * 0.1 }}
                      className={`flex items-center space-x-4 p-4 rounded-lg transition-colors ${
                        isActive 
                          ? "bg-primary/10 border border-primary/20" 
                          : isCompleted
                          ? "bg-success/10"
                          : "bg-muted/30"
                      }`}
                    >
                      <div className={`flex-shrink-0 w-10 h-10 rounded-full flex items-center justify-center ${
                        isCompleted
                          ? "bg-success text-white"
                          : isActive
                          ? "bg-primary text-white" 
                          : "bg-muted"
                      }`}>
                        {isActive ? (
                          <Loader2 className="h-5 w-5 animate-spin" />
                        ) : (
                          <Icon className="h-5 w-5" />
                        )}
                      </div>
                      
                      <div className="flex-1">
                        <div className="font-medium">{step.label}</div>
                        <div className="text-sm text-muted-foreground">
                          {step.description}
                        </div>
                      </div>

                      {isCompleted && (
                        <CheckCircle className="h-5 w-5 text-success" />
                      )}
                    </motion.div>
                  )
                })}
              </div>
            </CardContent>
          </Card>

          {/* Tips Section */}
          <Card className="glass">
            <CardContent className="p-6">
              <h3 className="font-semibold mb-3 flex items-center">
                <Zap className="h-5 w-5 text-primary mr-2" />
                Did You Know?
              </h3>
              <motion.p
                key={currentTip}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="text-muted-foreground"
              >
                {tips[currentTip]}
              </motion.p>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}