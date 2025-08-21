import { useState, useRef } from "react"
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
  const urlInputSectionRef = useRef<HTMLDivElement>(null)

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

  const handleScrollToInput = () => {
    urlInputSectionRef.current?.scrollIntoView({ behavior: 'smooth' });
  }

  return (
    <div className="min-h-screen bg-background text-foreground">
      <Navigation />
      
      {/* Hero Section */}
      <section className="relative overflow-hidden pt-32 pb-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            {/* Left Content */}
            <motion.div
              initial={{ opacity: 0, x: -50 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8, ease: "easeOut" }}
              className="text-left"
            >
              {/* AI Badge */}
              <motion.div 
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.2 }}
                className="inline-flex items-center px-4 py-2 bg-white/10 rounded-full text-white/90 text-sm font-medium mb-8 backdrop-blur-sm border border-white/20"
              >
                <Bot className="h-4 w-4 mr-2" />
                AI-Powered Security Assistant
              </motion.div>

              <motion.h1 
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, delay: 0.3 }}
                className="text-5xl lg:text-6xl xl:text-7xl font-bold text-white leading-tight mb-6"
              >
                Make Your Website
                <br />
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary to-primary-variant">
                  Safer & Faster
                </span>
              </motion.h1>
              
              <motion.p 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, delay: 0.5 }}
                className="text-xl text-foreground/80 max-w-xl mb-8 leading-relaxed"
              >
                WebAudit AI helps you identify and fix critical security, performance, and accessibility issues before they impact your users.
              </motion.p>

              {/* CTA Buttons */}
              <motion.div 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.9 }}
                className="flex flex-col sm:flex-row gap-4"
              >
                <Button
                  size="lg"
                  className="bg-primary hover:bg-primary/90 text-primary-foreground font-semibold px-8 py-4 text-lg shadow-xl hover:shadow-2xl transition-all duration-300 transform hover:scale-105"
                  onClick={handleScrollToInput}
                >
                  Get Started
                  <ArrowRight className="ml-2 h-5 w-5" />
                </Button>
                
                <Button
                  variant="outline"
                  size="lg"
                  className="border-white/30 text-white hover:bg-white/10 font-medium px-8 py-4 text-lg backdrop-blur-sm transition-all duration-300"
                >
                  <Eye className="mr-2 h-5 w-5" />
                  Watch Demo
                </Button>
              </motion.div>
            </motion.div>

            {/* Right Content - 3D Spline Element */}
            <motion.div
              initial={{ opacity: 0, x: 50, scale: 0.9 }}
              animate={{ opacity: 1, x: 0, scale: 1 }}
              transition={{ duration: 0.8, delay: 0.4, ease: "easeOut" }}
              className="relative h-[500px]"
            >
              {/* 3D Spline Element - No Container */}
              <iframe 
                src='https://my.spline.design/techinspired3dassets01protection-7ggJD5jdEmQEoSR91ur7yVcQ/' 
                frameBorder='0' 
                width='100%' 
                height='100%'
                className="rounded-2xl"
                title="WebAudit AI 3D Protection Element"
                style={{ 
                  border: 'none',
                  outline: 'none',
                  background: 'transparent'
                }}
              />

              {/* Floating Elements */}
              <motion.div
                animate={{ 
                  y: [0, -10, 0],
                  rotate: [0, 5, 0]
                }}
                transition={{ 
                  duration: 4,
                  repeat: Infinity,
                  ease: "easeInOut"
                }}
                className="absolute -top-6 -right-6 w-16 h-16 bg-gradient-to-r from-primary to-primary-variant rounded-2xl flex items-center justify-center shadow-lg z-10"
              >
                <Shield className="h-8 w-8 text-white" />
              </motion.div>

              <motion.div
                animate={{ 
                  y: [0, 10, 0],
                  rotate: [0, -5, 0]
                }}
                transition={{ 
                  duration: 3,
                  repeat: Infinity,
                  ease: "easeInOut",
                  delay: 1
                }}
                className="absolute -bottom-4 -left-4 w-12 h-12 bg-gradient-to-r from-green-400 to-emerald-500 rounded-xl flex items-center justify-center shadow-lg z-10"
              >
                <Gauge className="h-6 w-6 text-white" />
              </motion.div>
            </motion.div>
          </div>
        </div>

        {/* Background Effects */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <motion.div
            animate={{
              scale: [1, 1.2, 1],
              opacity: [0.05, 0.1, 0.05],
              rotate: [0, 10, 0],
            }}
            transition={{
              duration: 15,
              repeat: Infinity,
              ease: "easeInOut",
            }}
            className="absolute -top-40 -right-32 w-[500px] h-[500px] bg-gradient-to-r from-primary/10 to-primary-variant/10 rounded-full blur-3xl"
          />
          <motion.div
            animate={{
              scale: [1.1, 1, 1.1],
              opacity: [0.07, 0.15, 0.07],
              rotate: [0, -15, 0],
            }}
            transition={{
              duration: 20,
              repeat: Infinity,
              ease: "easeInOut",
              delay: 5,
            }}
            className="absolute -bottom-40 -left-32 w-[500px] h-[500px] bg-gradient-to-r from-secondary/10 to-accent/10 rounded-full blur-3xl"
          />
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <h2 className="text-4xl lg:text-5xl font-bold text-white">Why Choose WebAudit AI?</h2>
            <p className="mt-4 text-lg text-foreground/80 max-w-3xl mx-auto">
              Our platform provides a comprehensive suite of tools to analyze, secure, and optimize your website with the power of AI.
            </p>
          </motion.div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {features.map((feature, index) => (
              <motion.div
                key={feature.title}
                initial={{ opacity: 0, y: 50, scale: 0.9 }}
                whileInView={{ opacity: 1, y: 0, scale: 1 }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                viewport={{ once: true }}
              >
                <Card className="bg-white/5 border-white/10 backdrop-blur-lg h-full flex flex-col">
                  <CardHeader className="flex-row items-center gap-4">
                    <div className="bg-gradient-to-br from-primary to-primary-variant p-3 rounded-lg">
                      <feature.icon className="h-6 w-6 text-white" />
                    </div>
                    <CardTitle className="text-white">{feature.title}</CardTitle>
                  </CardHeader>
                  <CardContent className="flex-grow">
                    <p className="text-foreground/80">{feature.description}</p>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* URL Input Section */}
      <section ref={urlInputSectionRef} className="py-16 px-4 sm:px-6 lg:px-8 bg-white/5 backdrop-blur-sm">
        <div className="max-w-4xl mx-auto text-center">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
          >
            <h2 className="text-3xl font-bold text-white mb-8">Ready to Secure Your Website?</h2>
            
            <Card className="bg-white/10 border-white/20 shadow-2xl backdrop-blur-xl">
              <CardContent className="p-8">
                <div className="space-y-6">
                  <Input
                    type="url"
                    placeholder="Enter your website URL (e.g., example.com)"
                    value={url}
                    onChange={(e) => setUrl(e.target.value)}
                    className="text-lg h-14 bg-white/90 border-white/30 text-gray-800 placeholder:text-gray-500"
                    onKeyDown={(e) => {
                      if (e.key === "Enter") {
                        handleScan("quick")
                      }
                    }}
                  />
                  <div className="flex flex-col sm:flex-row gap-4 justify-center">
                    <Button
                      size="lg"
                      onClick={() => handleScan("quick")}
                      disabled={isLoading}
                      className="bg-gradient-to-r from-yellow-400 to-orange-500 hover:from-yellow-500 hover:to-orange-600 text-white font-semibold px-8 py-4 text-lg shadow-xl transform hover:scale-105 transition-all duration-300"
                    >
                      <Zap className="h-5 w-5 mr-2" />
                      Quick Scan (30s)
                    </Button>
                    <Button
                      size="lg"
                      onClick={() => handleScan("deep")}
                      disabled={isLoading}
                      className="bg-primary hover:bg-primary/90 text-primary-foreground font-semibold px-8 py-4 text-lg shadow-xl transform hover:scale-105 transition-all duration-300"
                    >
                      <Search className="h-5 w-5 mr-2" />
                      Deep Scan (2min)
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        </div>
      </section>

      <Footer />
    </div>
  )
}