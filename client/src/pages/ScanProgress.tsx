import { useEffect, useState } from "react"
import { motion } from "framer-motion"
import { useNavigate, useParams } from "react-router-dom"
import { 
  Shield, 
  Search, 
  Zap, 
  CheckCircle, 
  Loader2, 
  Globe,
  Database,
  Eye,
  Bot,
  ArrowDown,
  Clock,
  Activity
} from "lucide-react"
import { Progress } from "@/components/ui/progress"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Navigation } from "@/components/navigation"
import { Footer } from "@/components/footer"

interface ScanStep {
  id: string
  label: string
  description: string
  icon: React.ElementType
  completed: boolean
  estimatedTime: string
  color: string
}

const quickScanSteps: ScanStep[] = [
  {
    id: "initialize",
    label: "Initializing Scan",
    description: "Setting up security analysis engines...",
    icon: Shield,
    completed: false,
    estimatedTime: "5s",
    color: "from-green-600 to-green-500"
  },
  {
    id: "crawling",
    label: "Website Crawling",
    description: "Discovering pages and endpoints...",
    icon: Globe,
    completed: false,
    estimatedTime: "10s",
    color: "from-green-500 to-green-400"
  },
  {
    id: "headers",
    label: "Security Headers",
    description: "Analyzing HTTP security headers...",
    icon: Database,
    completed: false,
    estimatedTime: "8s",
    color: "from-green-400 to-emerald-500"
  },
  {
    id: "performance",
    label: "Performance Check",
    description: "Testing load times and optimization...",
    icon: Zap,
    completed: false,
    estimatedTime: "12s",
    color: "from-emerald-500 to-emerald-400"
  },
  {
    id: "ai_analysis",
    label: "AI Analysis",
    description: "Generating intelligent recommendations...",
    icon: Bot,
    completed: false,
    estimatedTime: "10s",
    color: "from-emerald-400 to-teal-500"
  },
  {
    id: "complete",
    label: "Finalizing Report",
    description: "Compiling results and generating report...",
    icon: CheckCircle,
    completed: false,
    estimatedTime: "5s",
    color: "from-teal-500 to-green-300"
  }
]

const deepScanSteps: ScanStep[] = [
  {
    id: "initialize",
    label: "Initializing Deep Scan",
    description: "Preparing comprehensive analysis suite...",
    icon: Shield,
    completed: false,
    estimatedTime: "10s",
    color: "from-green-700 to-green-600"
  },
  {
    id: "comprehensive_crawling",
    label: "Deep Website Crawling",
    description: "Exhaustive site mapping and discovery...",
    icon: Globe,
    completed: false,
    estimatedTime: "60s",
    color: "from-green-600 to-green-500"
  },
  {
    id: "security_audit",
    label: "Security Vulnerability Scan",
    description: "Advanced threat detection and analysis...",
    icon: Database,
    completed: false,
    estimatedTime: "90s",
    color: "from-green-500 to-green-400"
  },
  {
    id: "performance_deep",
    label: "Performance Optimization",
    description: "Comprehensive speed and UX analysis...",
    icon: Zap,
    completed: false,
    estimatedTime: "45s",
    color: "from-green-400 to-emerald-500"
  },
  {
    id: "seo_accessibility",
    label: "SEO & Accessibility",
    description: "Search engine and accessibility audit...",
    icon: Eye,
    completed: false,
    estimatedTime: "60s",
    color: "from-emerald-500 to-emerald-400"
  },
  {
    id: "ai_deep_analysis",
    label: "Advanced AI Analysis",
    description: "Machine learning insights and recommendations...",
    icon: Bot,
    completed: false,
    estimatedTime: "45s",
    color: "from-emerald-400 to-teal-500"
  },
  {
    id: "complete",
    label: "Generating Comprehensive Report",
    description: "Creating detailed analysis with actionable insights...",
    icon: CheckCircle,
    completed: false,
    estimatedTime: "30s",
    color: "from-teal-500 to-green-300"
  }
]

const tips = [
  "🔒 HTTPS encryption is now a Google ranking factor and protects user data.",
  "⚡ A 1-second delay in page load time can reduce conversions by 7%.",
  "🛡️ Security headers like HSTS prevent 90% of common web attacks.",
  "♿ Accessible websites reach 15% more users and improve SEO rankings.",
  "🤖 AI-powered recommendations can improve site performance by up to 40%.",
  "📊 Regular security scans help prevent 95% of common vulnerabilities.",
  "🎯 Meta descriptions with 150-160 characters get the highest click-through rates.",
  "💡 WebP images can reduce file size by up to 35% compared to JPEG."
]

export default function ScanProgress() {
  const [currentStep, setCurrentStep] = useState(0)
  const [progress, setProgress] = useState(0)
  const [steps, setSteps] = useState<ScanStep[]>([])
  const [currentTip, setCurrentTip] = useState(0)
  const [timeElapsed, setTimeElapsed] = useState(0)
  const [status, setStatus] = useState(null)
  const [error, setError] = useState<string | null>(null)
  const [scanUrl, setScanUrl] = useState("")
  const [scanType, setScanType] = useState("quick")
  const { auditId } = useParams()
  const navigate = useNavigate()

  useEffect(() => {
    const pollStatus = async () => {
      if (!auditId) return;

      try {
        const response = await fetch(
          `http://localhost:5000/api/audit/${auditId}/status`
        );
        if (response.ok) {
          const data = await response.json();
          setStatus(data);
          setScanUrl(data.url);
          setScanType(data.scanType);

          if (data.status === "completed") {
            navigate(`/report/${auditId}`);
          } else if (data.status === "failed") {
            setError(data.error || "The scan failed.");
          } else {
            // Continue polling every 3 seconds
            setTimeout(pollStatus, 3000);
          }
        } else {
          setError("Failed to get scan status.");
        }
      } catch (err) {
        setError("An error occurred while fetching scan status.");
        console.error(err);
      }
    };

    pollStatus();
  }, [auditId, navigate]);

  useEffect(() => {
    if (!scanType) return;
    
    // Set steps based on scan type - NO SIMULATION, just display
    const selectedSteps = scanType === "quick" ? quickScanSteps : deepScanSteps;
    setSteps(selectedSteps);
    
    // Simple timer for elapsed time display
    const timeInterval = setInterval(() => {
      setTimeElapsed(prev => prev + 1);
    }, 1000);

    // Rotate tips every 4 seconds
    const tipInterval = setInterval(() => {
      setCurrentTip((prev) => (prev + 1) % tips.length);
    }, 4000);

    // Update progress and steps based on actual backend status
    if (status) {
      // Calculate progress based on status
      if (status.status === "completed") {
        setProgress(100);
        setCurrentStep(selectedSteps.length - 1);
        setSteps(prevSteps => 
          prevSteps.map(step => ({ ...step, completed: true }))
        );
      } else if (status.status === "running") {
        // Estimate progress based on elapsed time (rough estimate)
        const elapsed = timeElapsed;
        const estimatedTotal = scanType === "quick" ? 90 : 300; // seconds
        const estimatedProgress = Math.min((elapsed / estimatedTotal) * 100, 95);
        setProgress(estimatedProgress);
        
        // Update current step based on progress
        const stepIndex = Math.floor((estimatedProgress / 100) * selectedSteps.length);
        setCurrentStep(Math.min(stepIndex, selectedSteps.length - 1));
        
        // Mark completed steps
        setSteps(prevSteps => 
          prevSteps.map((step, index) => ({
            ...step,
            completed: index < stepIndex
          }))
        );
      }
    }

    return () => {
      clearInterval(timeInterval);
      clearInterval(tipInterval);
    };
  }, [scanType, status, timeElapsed]);

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-hero4 text-foreground flex flex-col">
        <Navigation />
        <div className="flex-1 flex items-center justify-center">
          <div className="text-center">
            <div className="text-red-500 text-xl font-bold mb-4">Error</div>
            <p className="text-slate-300">{error}</p>
            <Button 
              onClick={() => navigate('/scan')} 
              className="mt-4 bg-primary hover:bg-primary/90"
            >
              Start New Scan
            </Button>
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  // Show loading until we have backend data
  if (!status || !scanUrl) {
    return (
      <div className="min-h-screen bg-gradient-hero4 text-foreground flex flex-col">
        <Navigation />
        <div className="flex-1 flex items-center justify-center">
          <div className="text-center">
            <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary mx-auto mb-4"></div>
            <h1 className="text-2xl font-bold mb-4">Connecting to Backend...</h1>
            <p className="text-slate-300">Initializing security audit</p>
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-hero4 text-foreground flex flex-col">
      <Navigation />
      
      <div className="flex-1 pt-24 pb-16 px-4 sm:px-6 lg:px-8">
        <div className="max-w-6xl mx-auto">
          {/* Header Section */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center mb-12"
          >
            <div className="inline-flex items-center px-6 py-3 bg-primary/10 rounded-full text-primary text-sm font-medium mb-6 backdrop-blur-sm border border-primary/20">
              <Activity className="h-4 w-4 mr-2 animate-pulse" />
              {scanType === "quick" ? "Quick Scan" : "Deep Scan"} in Progress
            </div>
            
            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold mb-4 bg-gradient-to-r from-white to-slate-300 bg-clip-text text-transparent">
              Analyzing Your Website
            </h1>
            
            <p className="text-xl text-slate-300 mb-3">
              Scanning: <span className="font-semibold text-white">{scanUrl}</span>
            </p>
            
            <div className="flex items-center justify-center gap-6 text-sm text-slate-400">
              <div className="flex items-center gap-2">
                <Clock className="h-4 w-4" />
                <span>Elapsed: {formatTime(timeElapsed)}</span>
              </div>
              <div className="flex items-center gap-2">
                <Zap className="h-4 w-4" />
                <span>ETA: {scanType === "quick" ? "~1 minute" : "~5-10 minutes"}</span>
              </div>
            </div>
          </motion.div>

          {/* Main Progress Section */}
          <div className="grid lg:grid-cols-3 gap-8">
            {/* Flowchart Section */}
            <div className="lg:col-span-2">
              <Card className="glass shadow-elegant p-6">
                <CardContent className="p-0">
                  {/* Overall Progress */}
                  <div className="mb-8">
                    <div className="flex justify-between items-center mb-3">
                      <h3 className="text-lg font-semibold">Overall Progress</h3>
                      <span className="text-2xl font-bold text-primary">{Math.round(progress)}%</span>
                    </div>
                    <Progress 
                      value={progress} 
                      className="h-4 bg-slate-800"
                    />
                  </div>

                  {/* Flowchart Steps */}
                  <div className="space-y-6">
                    {steps.map((step, index) => {
                      const Icon = step.icon
                      const isActive = index === currentStep
                      const isCompleted = step.completed
                      const isUpcoming = index > currentStep
                      
                      return (
                        <div key={step.id} className="relative">
                          {/* Connection Line */}
                          {index < steps.length - 1 && (
                            <div className="absolute left-8 top-16 w-0.5 h-12 bg-gradient-to-b from-slate-600 to-slate-700" />
                          )}
                          
                          <motion.div
                            initial={{ opacity: 0, x: -50 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: index * 0.1 }}
                            className={`relative flex items-center p-4 rounded-2xl transition-all duration-500 ${
                              isActive 
                                ? "bg-gradient-to-r from-primary/20 to-primary/5 border-2 border-primary/30 shadow-lg shadow-primary/20" 
                                : isCompleted
                                ? "bg-gradient-to-r from-green-500/10 to-green-500/5 border border-green-500/30"
                                : "bg-slate-800/30 border border-slate-700/50"
                            }`}
                          >
                            {/* Step Icon */}
                            <div className={`relative flex-shrink-0 w-16 h-16 rounded-2xl flex items-center justify-center transition-all duration-500 ${
                              isCompleted
                                ? "bg-gradient-to-r from-green-500 to-emerald-500 shadow-lg shadow-green-500/30"
                                : isActive
                                ? `bg-gradient-to-r ${step.color} shadow-lg shadow-primary/30` 
                                : "bg-slate-700 border border-slate-600"
                            }`}>
                              {isActive ? (
                                <motion.div
                                  animate={{ rotate: 360 }}
                                  transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
                                >
                                  <Loader2 className="h-8 w-8 text-white" />
                                </motion.div>
                              ) : isCompleted ? (
                                <CheckCircle className="h-8 w-8 text-white" />
                              ) : (
                                <Icon className={`h-8 w-8 ${isUpcoming ? 'text-slate-400' : 'text-white'}`} />
                              )}
                              
                              {/* Pulse Animation for Active Step */}
                              {isActive && (
                                <div className="absolute inset-0 rounded-2xl bg-primary/30 animate-ping" />
                              )}
                            </div>
                            
                            {/* Step Content */}
                            <div className="flex-1 ml-6">
                              <div className="flex items-center justify-between mb-2">
                                <h4 className={`font-semibold text-lg ${
                                  isActive ? 'text-white' : isCompleted ? 'text-green-400' : 'text-slate-300'
                                }`}>
                                  {step.label}
                                </h4>
                                <span className="text-xs px-2 py-1 rounded-full bg-slate-700 text-slate-300">
                                  {step.estimatedTime}
                                </span>
                              </div>
                              <p className={`text-sm ${
                                isActive ? 'text-slate-200' : 'text-slate-400'
                              }`}>
                                {step.description}
                              </p>
                              
                              {/* Progress Bar for Active Step */}
                              {isActive && (
                                <motion.div
                                  initial={{ width: 0 }}
                                  animate={{ width: "100%" }}
                                  transition={{ duration: parseInt(step.estimatedTime) }}
                                  className="mt-3 h-1 bg-gradient-to-r from-primary to-primary-variant rounded-full"
                                />
                              )}
                            </div>

                            {/* Completion Checkmark */}
                            {isCompleted && (
                              <motion.div
                                initial={{ scale: 0 }}
                                animate={{ scale: 1 }}
                                className="absolute -top-2 -right-2 w-6 h-6 bg-green-500 rounded-full flex items-center justify-center"
                              >
                                <CheckCircle className="h-4 w-4 text-white" />
                              </motion.div>
                            )}
                          </motion.div>
                        </div>
                      )
                    })}
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Side Panel */}
            <div className="space-y-6">
              {/* Current Status */}
              <Card className="glass shadow-elegant">
                <CardContent className="p-6">
                  <h3 className="font-semibold mb-4 flex items-center">
                    <Activity className="h-5 w-5 text-primary mr-2" />
                    Current Status
                  </h3>
                  <div className="space-y-3">
                    <div className="flex justify-between">
                      <span className="text-sm text-slate-400">Step</span>
                      <span className="font-medium">{currentStep + 1} of {steps.length}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm text-slate-400">Progress</span>
                      <span className="font-medium">{Math.round(progress)}%</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm text-slate-400">Time Elapsed</span>
                      <span className="font-medium">{formatTime(timeElapsed)}</span>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Security Tips */}
              <Card className="glass shadow-elegant">
                <CardContent className="p-6">
                  <h3 className="font-semibold mb-4 flex items-center">
                    <Bot className="h-5 w-5 text-primary mr-2" />
                    Security Insights
                  </h3>
                  <motion.div
                    key={currentTip}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -20 }}
                    className="text-sm text-slate-300 leading-relaxed"
                  >
                    {tips[currentTip]}
                  </motion.div>
                </CardContent>
              </Card>

              {/* Scan Details */}
              <Card className="glass shadow-elegant">
                <CardContent className="p-6">
                  <h3 className="font-semibold mb-4 flex items-center">
                    <Search className="h-5 w-5 text-primary mr-2" />
                    Scan Details
                  </h3>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-slate-400">Scan Type</span>
                      <span className="capitalize font-medium">{scanType}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-400">Target URL</span>
                      <span className="font-medium truncate ml-2">{scanUrl}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-400">Analysis Depth</span>
                      <span className="font-medium">
                        {scanType === "quick" ? "Standard" : "Comprehensive"}
                      </span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </div>

      <Footer />
    </div>
  )
}