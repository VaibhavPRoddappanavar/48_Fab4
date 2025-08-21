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
    <div className="min-h-screen bg-gradient-to-br from-blue-600 via-blue-700 to-blue-900">
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
                Your Multilingual
                <br />
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-300 to-blue-300">
                  Security Companion
                </span>
              </motion.h1>
              
              <motion.p 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, delay: 0.5 }}
                className="text-xl text-blue-100 max-w-xl mb-8 leading-relaxed"
              >
                WebAudit AI helps you understand website security, guides through scan processes, and provides intelligent recommendations in 10+ languages.
              </motion.p>

              {/* Language Tags */}
              <motion.div 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.7 }}
                className="flex flex-wrap gap-2 mb-8"
              >
                {["Hindi", "English", "Tamil", "Telugu", "Bengali", "+5 more"].map((lang, index) => (
                  <motion.span
                    key={lang}
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ duration: 0.4, delay: 0.8 + index * 0.1 }}
                    className="px-3 py-1 bg-white/10 rounded-full text-white/80 text-sm backdrop-blur-sm border border-white/20"
                  >
                    {lang}
                  </motion.span>
                ))}
              </motion.div>

              {/* CTA Buttons */}
              <motion.div 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.9 }}
                className="flex flex-col sm:flex-row gap-4"
              >
                <Button
                  size="lg"
                  className="bg-white text-blue-700 hover:bg-blue-50 font-semibold px-8 py-4 text-lg shadow-xl hover:shadow-2xl transition-all duration-300 transform hover:scale-105"
                  onClick={() => handleScan("quick")}
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

            {/* Right Content - Chat Interface */}
            <motion.div
              initial={{ opacity: 0, x: 50, scale: 0.9 }}
              animate={{ opacity: 1, x: 0, scale: 1 }}
              transition={{ duration: 0.8, delay: 0.4, ease: "easeOut" }}
              className="relative"
            >
              {/* Main Chat Card */}
              <div className="relative bg-gradient-to-br from-white/95 to-white/80 backdrop-blur-xl rounded-3xl p-6 shadow-2xl border border-white/20">
                {/* Chat Header */}
                <div className="flex items-center justify-between mb-6">
                  <div className="flex items-center space-x-3">
                    <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-cyan-500 rounded-full flex items-center justify-center">
                      <Shield className="h-6 w-6 text-white" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-gray-800">WebAudit AI</h3>
                      <div className="flex items-center space-x-1">
                        <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                        <span className="text-xs text-gray-500">Online</span>
                      </div>
                    </div>
                  </div>
                  <div className="flex space-x-1">
                    <div className="w-3 h-3 bg-gray-300 rounded-full"></div>
                    <div className="w-3 h-3 bg-gray-300 rounded-full"></div>
                    <div className="w-3 h-3 bg-gray-300 rounded-full"></div>
                  </div>
                </div>

                {/* Chat Messages */}
                <div className="space-y-4 mb-6">
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5, delay: 1.2 }}
                    className="bg-gradient-to-r from-blue-500 to-cyan-500 text-white p-4 rounded-2xl rounded-bl-md max-w-xs"
                  >
                    <p className="text-sm">Hello! I'm WebAudit AI. How can I help with your website security today?</p>
                  </motion.div>
                  
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5, delay: 1.4 }}
                    className="bg-gray-100 p-4 rounded-2xl rounded-br-md max-w-xs ml-auto"
                  >
                    <p className="text-sm text-gray-700">I need a security scan. Not sure where to start.</p>
                  </motion.div>

                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5, delay: 1.6 }}
                    className="bg-gradient-to-r from-blue-500 to-cyan-500 text-white p-4 rounded-2xl rounded-bl-md max-w-xs"
                  >
                    <p className="text-sm">I can help you with that! Let's check your website's security. What's your preferred language?</p>
                  </motion.div>

                  {/* Typing Indicator */}
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5, delay: 1.8 }}
                    className="flex items-center space-x-2"
                  >
                    <div className="flex space-x-1">
                      <motion.div
                        animate={{ scale: [1, 1.2, 1] }}
                        transition={{ duration: 0.6, repeat: Infinity, delay: 0 }}
                        className="w-2 h-2 bg-blue-400 rounded-full"
                      />
                      <motion.div
                        animate={{ scale: [1, 1.2, 1] }}
                        transition={{ duration: 0.6, repeat: Infinity, delay: 0.2 }}
                        className="w-2 h-2 bg-blue-400 rounded-full"
                      />
                      <motion.div
                        animate={{ scale: [1, 1.2, 1] }}
                        transition={{ duration: 0.6, repeat: Infinity, delay: 0.4 }}
                        className="w-2 h-2 bg-blue-400 rounded-full"
                      />
                    </div>
                    <span className="text-xs text-gray-500 italic">WebAudit AI is typing...</span>
                  </motion.div>
                </div>

                {/* Input Area */}
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: 2.0 }}
                  className="relative"
                >
                  <Input 
                    placeholder="Type your message..."
                    className="pr-12 bg-gray-50 border-gray-200 rounded-xl"
                  />
                  <Button size="sm" className="absolute right-2 top-1/2 transform -translate-y-1/2 bg-blue-500 hover:bg-blue-600 rounded-lg">
                    <ArrowRight className="h-4 w-4" />
                  </Button>
                </motion.div>

                {/* Language Selector */}
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: 2.2 }}
                  className="flex justify-center space-x-2 mt-4"
                >
                  {["Hindi", "English", "Tamil", "Telugu", "+7"].map((lang) => (
                    <Button
                      key={lang}
                      variant="outline"
                      size="sm"
                      className="text-xs border-gray-200 hover:bg-blue-50"
                    >
                      {lang}
                    </Button>
                  ))}
                </motion.div>
              </div>

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
                className="absolute -top-6 -right-6 w-16 h-16 bg-gradient-to-r from-yellow-400 to-orange-500 rounded-2xl flex items-center justify-center shadow-lg"
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
                className="absolute -bottom-4 -left-4 w-12 h-12 bg-gradient-to-r from-green-400 to-emerald-500 rounded-xl flex items-center justify-center shadow-lg"
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
              scale: [1, 1.1, 1],
              opacity: [0.1, 0.2, 0.1],
            }}
            transition={{
              duration: 8,
              repeat: Infinity,
              ease: "easeInOut",
            }}
            className="absolute -top-40 -right-32 w-96 h-96 bg-gradient-to-r from-cyan-400 to-blue-400 rounded-full blur-3xl"
          />
          <motion.div
            animate={{
              scale: [1.1, 1, 1.1],
              opacity: [0.1, 0.3, 0.1],
            }}
            transition={{
              duration: 6,
              repeat: Infinity,
              ease: "easeInOut",
              delay: 2,
            }}
            className="absolute -bottom-40 -left-32 w-96 h-96 bg-gradient-to-r from-blue-400 to-indigo-400 rounded-full blur-3xl"
          />
        </div>
      </section>
            <h1>above hero section</h1>
      {/* Image and 3D Element Section */}
      <section className="py-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="grid lg:grid-cols-2 gap-16 items-center">
            {/* Left side for 3D element */}
            <motion.div 
              initial={{ opacity: 0, x: -50 }}
              whileInView={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8, ease: "easeOut" }}
              viewport={{ once: true }}
              className="h-96 bg-white/5 rounded-2xl backdrop-blur-sm border border-white/10 flex items-center justify-center"
            >
              <p className="text-white/50">3D element coming soon...</p>
            </motion.div>

            {/* Right side for Image */}
            <motion.div
              initial={{ opacity: 0, x: 50 }}
              whileInView={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8, ease: "easeOut" }}
              viewport={{ once: true }}
            >
              <img 
                src="/hero.png" 
                alt="WebAudit AI Dashboard" 
                className="rounded-2xl shadow-2xl border border-white/10"
              />
            </motion.div>
          </div>
        </div>
      </section>

      {/* URL Input Section */}
      <section className="py-16 px-4 sm:px-6 lg:px-8 bg-white/5 backdrop-blur-sm">
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
                      className="bg-white text-blue-700 hover:bg-blue-50 font-semibold px-8 py-4 text-lg shadow-xl transform hover:scale-105 transition-all duration-300"
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