import { useState } from "react"
import { motion } from "framer-motion"
import { useNavigate } from "react-router-dom"
import { Zap, Search, Shield, Bot, ArrowRight, CheckCircle, AlertCircle, Globe } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Navigation } from "@/components/navigation"
import { Footer } from "@/components/footer"
import { useToast } from "@/hooks/use-toast"

const scanFeatures = [
  {
    title: "Security Analysis",
    description: "Vulnerability detection and threat analysis",
    icon: Shield,
    color: "from-emerald-500 to-teal-500"
  },
  {
    title: "Performance Check",
    description: "Speed optimization and core web vitals",
    icon: Zap,
    color: "from-green-400 to-emerald-500"
  },
  {
    title: "AI Recommendations",
    description: "Intelligent fixes and improvements",
    icon: Bot,
    color: "from-lime-500 to-green-500"
  }
]

export default function Scan() {
  const [url, setUrl] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [urlError, setUrlError] = useState("")
  const [isValidUrl, setIsValidUrl] = useState(false)
  const navigate = useNavigate()
  const { toast } = useToast()

  const validateUrl = (inputUrl: string) => {
    if (!inputUrl.trim()) {
      setUrlError("")
      setIsValidUrl(false)
      return false
    }

    try {
      // Clean the URL - remove extra spaces and common prefixes
      let cleanUrl = inputUrl.trim()
      
      // Check for common invalid patterns
      if (cleanUrl.includes(' ') || cleanUrl.includes('..') || cleanUrl.length < 3) {
        setUrlError("Please enter a valid website URL")
        setIsValidUrl(false)
        return false
      }

      // Add https if no protocol is specified
      if (!cleanUrl.startsWith('http://') && !cleanUrl.startsWith('https://')) {
        cleanUrl = `https://${cleanUrl}`
      }

      const urlObj = new URL(cleanUrl)
      
      // Check if hostname is valid
      if (!urlObj.hostname || urlObj.hostname.length < 3) {
        setUrlError("Please enter a valid domain name")
        setIsValidUrl(false)
        return false
      }

      // Check for valid domain format (at least one dot)
      if (!urlObj.hostname.includes('.')) {
        setUrlError("Please enter a complete domain (e.g., example.com)")
        setIsValidUrl(false)
        return false
      }

      // Check for localhost or invalid domains
      if (urlObj.hostname === 'localhost' || urlObj.hostname.startsWith('127.') || urlObj.hostname.startsWith('192.168.')) {
        setUrlError("Please enter a public website URL")
        setIsValidUrl(false)
        return false
      }

      setUrlError("")
      setIsValidUrl(true)
      return true
    } catch (error) {
      setUrlError("Please enter a valid website URL")
      setIsValidUrl(false)
      return false
    }
  }

  const handleUrlChange = (value: string) => {
    setUrl(value)
    validateUrl(value)
  }

  const startScan = async (scanType: "quick" | "deep") => {
    if (!url) {
      setUrlError("Please enter a URL")
      return
    }
    setIsLoading(true)
    setUrlError("")

    try {
      const response = await fetch("http://localhost:5000/api/audit", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ url, scanType }),
      })

      const data = await response.json()

      if (response.ok && data.success) {
        navigate(`/scan-progress/${data.auditId}`)
      } else {
        setUrlError(data.message || "Failed to start scan")
      }
    } catch (err) {
      setUrlError("An error occurred while trying to start the scan.")
      console.error(err)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col">
      <Navigation />
      
      {/* hero4 Section */}
      <section className="relative flex-1 overflow-hidden pt-32 pb-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            {/* Left Content */}
            <motion.div
              initial={{ opacity: 0, x: -50 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8, ease: "easeOut" }}
              className="text-left"
            >
              {/* Badge */}
              <motion.div 
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.2 }}
                className="inline-flex items-center px-4 py-2 bg-white/10 rounded-full text-white/90 text-sm font-medium mb-8 backdrop-blur-sm border border-white/20"
              >
                <Shield className="h-4 w-4 mr-2" />
                Website Security Scanner
              </motion.div>

              <motion.h1 
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, delay: 0.3 }}
                className="text-5xl lg:text-6xl xl:text-7xl font-bold text-white leading-tight mb-6"
              >
                Secure Your
                <br />
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary to-primary-variant">
                  Website Today
                </span>
              </motion.h1>
              
              <motion.p 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, delay: 0.5 }}
                className="text-xl text-foreground/80 max-w-xl mb-8 leading-relaxed"
              >
                Get comprehensive security analysis, performance insights, and AI-powered 
                recommendations to protect and optimize your website.
              </motion.p>

              {/* Quick Stats */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.7 }}
                className="flex items-center gap-6 mb-8 text-sm text-slate-300"
              >
                <div className="flex items-center gap-2">
                  <CheckCircle className="h-4 w-4 text-primary" />
                  <span>Free Analysis</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle className="h-4 w-4 text-primary" />
                  <span>Instant Results</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle className="h-4 w-4 text-primary" />
                  <span>No Registration</span>
                </div>
              </motion.div>
            </motion.div>

            {/* Right Content - Scan Form */}
            <motion.div
              initial={{ opacity: 0, x: 50, scale: 0.95 }}
              animate={{ opacity: 1, x: 0, scale: 1 }}
              transition={{ duration: 0.8, delay: 0.4, ease: "easeOut" }}
              className="relative"
            >
              <Card className="relative bg-gradient-to-br from-slate-900/90 via-slate-800/80 to-slate-900/90 border border-slate-700/50 backdrop-blur-xl shadow-2xl shadow-black/40 overflow-hidden">
                {/* Background Effects */}
                <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-primary-variant/5 opacity-50" />
                
                <CardHeader className="relative pb-4">
                  <CardTitle className="text-2xl font-bold text-white text-center mb-2">
                    Start Your Security Audit
                  </CardTitle>
                  <CardDescription className="text-center text-slate-300">
                    Enter your website URL to begin comprehensive analysis
                  </CardDescription>
                </CardHeader>

                <CardContent className="relative p-8 pt-4">
                  <div className="space-y-6">
                    {/* URL Input */}
                    <div className="relative">
                      <div className="relative">
                        <Globe className="absolute left-4 top-1/2 transform -translate-y-1/2 h-5 w-5 text-slate-400" />
                        <Input
                          type="url"
                          placeholder="Enter your website URL (e.g., example.com)"
                          value={url}
                          onChange={(e) => handleUrlChange(e.target.value)}
                          className={`text-lg h-16 pl-12 pr-12 bg-slate-800/50 border text-white placeholder:text-slate-400 focus:bg-slate-800/70 transition-all duration-300 ${
                            urlError 
                              ? "border-red-500/50 focus:border-red-500/70" 
                              : isValidUrl 
                              ? "border-green-500/50 focus:border-green-500/70" 
                              : "border-slate-600/50 focus:border-primary/50"
                          }`}
                          onKeyDown={(e) => {
                            if (e.key === "Enter" && isValidUrl) {
                              startScan("quick")
                            }
                          }}
                        />
                        {/* Status Icon */}
                        <div className="absolute right-4 top-1/2 transform -translate-y-1/2">
                          {urlError ? (
                            <AlertCircle className="h-5 w-5 text-red-400" />
                          ) : isValidUrl ? (
                            <CheckCircle className="h-5 w-5 text-green-400" />
                          ) : null}
                        </div>
                      </div>
                      
                      {/* Error Message */}
                      {urlError && (
                        <motion.p
                          initial={{ opacity: 0, y: -5 }}
                          animate={{ opacity: 1, y: 0 }}
                          className="text-red-400 text-sm mt-2 flex items-center gap-1"
                        >
                          <AlertCircle className="h-4 w-4" />
                          {urlError}
                        </motion.p>
                      )}
                      
                      {/* Valid URL Message */}
                      {isValidUrl && !urlError && (
                        <motion.p
                          initial={{ opacity: 0, y: -5 }}
                          animate={{ opacity: 1, y: 0 }}
                          className="text-green-400 text-sm mt-2 flex items-center gap-1"
                        >
                          <CheckCircle className="h-4 w-4" />
                          Ready to scan this website
                        </motion.p>
                      )}
                    </div>

                    {/* Scan Buttons */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <Button
                        size="lg"
                        onClick={() => startScan("quick")}
                        disabled={isLoading || !isValidUrl}
                        className="relative overflow-hidden bg-gradient-to-r from-primary to-primary-variant hover:from-primary/90 hover:to-primary-variant/90 text-white font-semibold px-6 py-4 text-base shadow-xl hover:shadow-2xl transition-all duration-300 transform hover:scale-105 group disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
                      >
                        <div className="absolute inset-0 bg-gradient-to-r from-primary/20 to-primary-variant/20 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                        <Zap className="h-5 w-5 mr-2 relative z-10" />
                        <div className="relative z-10">
                          <div className="font-semibold">Quick Scan</div>
                          <div className="text-xs opacity-90">Under 1 minute</div>
                        </div>
                      </Button>

                      <Button
                        size="lg"
                        onClick={() => startScan("deep")}
                        disabled={isLoading || !isValidUrl}
                        className="relative overflow-hidden bg-gradient-to-r from-primary to-primary-variant hover:from-primary/90 hover:to-primary-variant/90 text-white font-semibold px-6 py-4 text-base shadow-xl hover:shadow-2xl transition-all duration-300 transform hover:scale-105 group border-2 border-primary/30 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
                      >
                        <div className="absolute inset-0 bg-gradient-to-r from-primary/20 to-primary-variant/20 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                        <Search className="h-5 w-5 mr-2 relative z-10" />
                        <div className="relative z-10">
                          <div className="font-semibold">Deep Scan</div>
                          <div className="text-xs opacity-90">5-10 minutes</div>
                        </div>
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>

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
            <h2 className="text-4xl lg:text-5xl font-bold text-white mb-6">
              What We <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary to-primary-variant">Analyze</span>
            </h2>
            <p className="text-lg text-foreground/80 max-w-3xl mx-auto leading-relaxed">
              Our comprehensive scanning engine examines every critical aspect of your website
            </p>
          </motion.div>

          <div className="grid md:grid-cols-3 gap-8">
            {scanFeatures.map((feature, index) => (
              <motion.div
                key={feature.title}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: index * 0.1 }}
                viewport={{ once: true }}
                className="group"
              >
                <Card className="relative bg-gradient-to-br from-slate-900/80 via-slate-800/60 to-slate-900/80 border border-slate-700/50 backdrop-blur-xl h-full flex flex-col overflow-hidden hover:border-primary/30 transition-all duration-300 hover:shadow-lg hover:shadow-primary/5">
                  {/* Background Gradient Overlay */}
                  <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-primary-variant/5 opacity-0 group-hover:opacity-50 transition-opacity duration-300" />
                  
                  <CardHeader className="relative pb-4 pt-8 px-8">
                    <div className="w-16 h-16 mb-6 mx-auto relative">
                      <div className={`absolute inset-0 bg-gradient-to-r ${feature.color} rounded-2xl shadow-lg`} />
                      <div className={`relative w-full h-full bg-gradient-to-br ${feature.color} rounded-2xl flex items-center justify-center`}>
                        <feature.icon className="h-8 w-8 text-white drop-shadow-sm" />
                      </div>
                    </div>
                    
                    <CardTitle className="text-2xl font-bold text-white text-center mb-4">
                      {feature.title}
                    </CardTitle>
                  </CardHeader>
                  
                  <CardContent className="relative flex-grow px-8 pb-8">
                    <p className="text-slate-300 text-center leading-relaxed text-base">
                      {feature.description}
                    </p>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      <Footer />
    </div>
  )
}
