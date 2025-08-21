import { useState } from "react"
import { motion } from "framer-motion"
import { useNavigate } from "react-router-dom"
import { 
  Zap, 
  Search, 
  Bot, 
  Shield, 
  Gauge, 
  Eye, 
  Users,
  ArrowRight,
  CheckCircle
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Navigation } from "@/components/navigation"
import { Footer } from "@/components/footer"
import { useToast } from "@/hooks/use-toast"

const features = [
  {
    icon: Zap,
    title: "Quick Scan",
    description: "Lightning-fast security and performance checks in under 30 seconds"
  },
  {
    icon: Search,
    title: "Deep Scan", 
    description: "Comprehensive analysis covering security, SEO, performance, and accessibility"
  },
  {
    icon: Bot,
    title: "AI-Powered Fixes",
    description: "Get intelligent suggestions and actionable remediation steps"
  }
]

const benefits = [
  "Real-time vulnerability detection",
  "Performance optimization insights", 
  "SEO improvement recommendations",
  "Accessibility compliance checks"
]

export default function Landing() {
  const [url, setUrl] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const navigate = useNavigate()
  const { toast } = useToast()

  const validateUrl = (url: string) => {
    try {
      const urlObj = new URL(url.startsWith('http') ? url : `https://${url}`)
      return urlObj.hostname.length > 0
    } catch {
      return false
    }
  }

  const handleScan = async (scanType: "quick" | "deep") => {
    if (!url.trim()) {
      toast({
        title: "URL Required",
        description: "Please enter a website URL to scan",
        variant: "destructive"
      })
      return
    }

    if (!validateUrl(url)) {
      toast({
        title: "Invalid URL",
        description: "Please enter a valid website URL",
        variant: "destructive"
      })
      return
    }

    setIsLoading(true)
    
    // Store URL in sessionStorage for the scan pages
    sessionStorage.setItem("scanUrl", url)
    
    // Simulate navigation delay
    setTimeout(() => {
      navigate(`/scan-progress?type=${scanType}`)
    }, 500)
  }

  return (
    <div className="min-h-screen bg-gradient-hero">
      <Navigation />
      
      {/* Hero Section */}
      <section className="relative overflow-hidden pt-32 pb-16 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8 }}
            >
              <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold mb-6">
                <span className="gradient-text">Secure & Optimize</span>
                <br />
                Your Website with AI
              </h1>
              <p className="text-xl text-muted-foreground max-w-3xl mx-auto mb-8">
                WebAudit AI provides comprehensive security scans, performance analysis, and 
                intelligent recommendations to help you build better, safer websites.
              </p>
            </motion.div>

            {/* URL Input Section */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.2 }}
              className="max-w-2xl mx-auto"
            >
              <Card className="glass border-white/20 shadow-elegant">
                <CardContent className="p-6">
                  <div className="space-y-4">
                    <Input
                      type="url"
                      placeholder="Enter your website URL (e.g., example.com)"
                      value={url}
                      onChange={(e) => setUrl(e.target.value)}
                      className="text-lg h-12"
                      onKeyDown={(e) => {
                        if (e.key === "Enter") {
                          handleScan("quick")
                        }
                      }}
                    />
                    <div className="flex gap-3 justify-center">
                      <Button
                        size="lg"
                        onClick={() => handleScan("quick")}
                        disabled={isLoading}
                        className="flex-1 sm:flex-none"
                      >
                        <Zap className="h-4 w-4 mr-2" />
                        Quick Scan
                      </Button>
                      <Button
                        variant="hero"
                        size="lg"
                        onClick={() => handleScan("deep")}
                        disabled={isLoading}
                        className="flex-1 sm:flex-none"
                      >
                        <Search className="h-4 w-4 mr-2" />
                        Deep Scan
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          </div>
        </div>

        {/* Animated Background Elements */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute -top-40 -right-32 w-96 h-96 bg-gradient-primary opacity-10 rounded-full blur-3xl" />
          <div className="absolute -bottom-40 -left-32 w-96 h-96 bg-gradient-primary opacity-10 rounded-full blur-3xl" />
        </div>
      </section>

      {/* Features Section */}
      <section className="py-16 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <h2 className="text-3xl sm:text-4xl font-bold mb-4">
              Comprehensive Website Analysis
            </h2>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              Get detailed insights into your website's security, performance, and optimization opportunities
            </p>
          </motion.div>

          <div className="grid md:grid-cols-3 gap-8">
            {features.map((feature, index) => (
              <motion.div
                key={feature.title}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, delay: index * 0.1 }}
                viewport={{ once: true }}
              >
                <Card className="shadow-card-hover h-full">
                  <CardHeader>
                    <div className="w-12 h-12 bg-gradient-primary rounded-lg flex items-center justify-center mb-4">
                      <feature.icon className="h-6 w-6 text-white" />
                    </div>
                    <CardTitle className="text-xl">{feature.title}</CardTitle>
                    <CardDescription className="text-base">
                      {feature.description}
                    </CardDescription>
                  </CardHeader>
                </Card>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Benefits Section */}
      <section className="py-16 px-4 sm:px-6 lg:px-8 bg-muted/30">
        <div className="max-w-7xl mx-auto">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              whileInView={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8 }}
              viewport={{ once: true }}
            >
              <h2 className="text-3xl sm:text-4xl font-bold mb-6">
                Why Choose WebAudit AI?
              </h2>
              <p className="text-lg text-muted-foreground mb-8">
                Our AI-powered platform helps you identify and fix critical issues 
                before they impact your users or business.
              </p>
              
              <div className="space-y-4">
                {benefits.map((benefit, index) => (
                  <motion.div
                    key={benefit}
                    initial={{ opacity: 0, x: -20 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.5, delay: index * 0.1 }}
                    viewport={{ once: true }}
                    className="flex items-center space-x-3"
                  >
                    <CheckCircle className="h-5 w-5 text-success flex-shrink-0" />
                    <span>{benefit}</span>
                  </motion.div>
                ))}
              </div>

              <Button variant="hero" size="lg" className="mt-8">
                Start Free Scan
                <ArrowRight className="h-4 w-4 ml-2" />
              </Button>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, x: 20 }}
              whileInView={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8 }}
              viewport={{ once: true }}
              className="relative"
            >
              <Card className="glass shadow-elegant">
                <CardContent className="p-8">
                  <div className="grid grid-cols-2 gap-6">
                    <div className="text-center">
                      <div className="text-3xl font-bold gradient-text">99.9%</div>
                      <div className="text-sm text-muted-foreground">Accuracy</div>
                    </div>
                    <div className="text-center">
                      <div className="text-3xl font-bold gradient-text">&lt;30s</div>
                      <div className="text-sm text-muted-foreground">Scan Time</div>
                    </div>
                    <div className="text-center">
                      <div className="text-3xl font-bold gradient-text">50+</div>
                      <div className="text-sm text-muted-foreground">Check Types</div>
                    </div>
                    <div className="text-center">
                      <div className="text-3xl font-bold gradient-text">24/7</div>
                      <div className="text-sm text-muted-foreground">Monitoring</div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  )
}