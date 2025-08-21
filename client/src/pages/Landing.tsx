import { useState, useRef, useEffect } from "react"
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
  CheckCircle,
  AlertTriangle,
  Activity,
  Lock,
  Wifi,
  Database,
  Globe
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
  const navigate = useNavigate()
  const [scanningActive, setScanningActive] = useState(false)
  const [vulnerabilities, setVulnerabilities] = useState(0)
  const [securityScore, setSecurityScore] = useState(85)

  // Simulate scanning animation
  useEffect(() => {
    const interval = setInterval(() => {
      setScanningActive(prev => !prev)
      setVulnerabilities(prev => Math.floor(Math.random() * 12) + 1)
      setSecurityScore(prev => Math.min(95, Math.max(75, prev + (Math.random() - 0.5) * 10)))
    }, 3000)

    return () => clearInterval(interval)
  }, [])

  const handleScan = () => {
    navigate('/scan');
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
                className="inline-flex items-center px-4 py-2 bg-primary/20 rounded-full text-primary text-sm font-medium mb-8 backdrop-blur-sm border border-primary/30"
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
                  onClick={handleScan}
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
                  Book Demo
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
      {/* Image and 3D Element Section */}
      <section className="py-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="grid lg:grid-cols-[2fr,3fr] gap-12 items-center">
            {/* Left side - Modern WebAudit Features Showcase */}
            <motion.div 
              initial={{ opacity: 0, x: -50 }}
              whileInView={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8, ease: "easeOut" }}
              viewport={{ once: true }}
              className="relative w-full h-auto"
            >
              {/* Main Container with a more refined glass effect */}
              <div className="relative bg-slate-900/70 rounded-3xl backdrop-blur-xl border border-slate-700/50 shadow-2xl shadow-black/40 overflow-hidden">
                
                {/* Aurora Background Effect */}
                <div className="absolute -top-1/2 -left-1/2 w-[200%] h-[200%] opacity-10"
                     style={{
                       background: "radial-gradient(circle at center, hsl(var(--primary)) 0%, transparent 50%)"
                     }}
                />

                {/* Content Container */}
                <div className="relative p-8 flex flex-col">
                  
                  {/* Header Section */}
                  <motion.div
                    initial={{ opacity: 0, y: -20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6, ease: "easeOut" }}
                    viewport={{ once: true }}
                    className="text-center mb-10"
                  >
                    <h3 className="text-3xl font-bold text-white mb-3">
                      One Scan, <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary to-primary-variant">Total Clarity</span>
                    </h3>
                    <p className="text-slate-400 max-w-md mx-auto">
                      Our AI-powered audit covers every critical aspect of your website's health.
                    </p>
                  </motion.div>

                  {/* Features List */}
                  <div className="space-y-1">
                    
                    {/* Security Analysis */}
                    <motion.div 
                      initial={{ opacity: 0, x: -20 }}
                      whileInView={{ opacity: 1, x: 0 }}
                      transition={{ delay: 0.2, duration: 0.5, ease: "easeOut" }}
                      viewport={{ once: true }}
                      className="group flex items-center gap-4 p-4 rounded-2xl bg-slate-800/50 border border-slate-700 hover:bg-slate-800/80 hover:border-primary/40 transition-all duration-300"
                    >
                      <div className="flex-shrink-0 w-12 h-12 bg-gradient-to-br from-primary to-primary-variant rounded-xl flex items-center justify-center shadow-lg shadow-primary/20 group-hover:scale-105 transition-transform">
                        <Shield className="h-6 w-6 text-white" />
                      </div>
                      <div className="flex-1">
                        <h4 className="font-semibold text-white">Security Analysis</h4>
                        <p className="text-sm text-slate-400">Find and fix vulnerabilities before they're exploited.</p>
                      </div>
                      <ArrowRight className="h-5 w-5 text-slate-600 group-hover:text-primary group-hover:translate-x-1 transition-all duration-300" />
                    </motion.div>

                    {/* Performance Optimization */}
                    <motion.div 
                      initial={{ opacity: 0, x: -20 }}
                      whileInView={{ opacity: 1, x: 0 }}
                      transition={{ delay: 0.3, duration: 0.5, ease: "easeOut" }}
                      viewport={{ once: true }}
                      className="group flex items-center gap-4 p-4 rounded-2xl bg-slate-800/50 border border-slate-700 hover:bg-slate-800/80 hover:border-primary/40 transition-all duration-300"
                    >
                      <div className="flex-shrink-0 w-12 h-12 bg-gradient-to-br from-primary to-primary-variant rounded-xl flex items-center justify-center shadow-lg shadow-primary/20 group-hover:scale-105 transition-transform">
                        <Gauge className="h-6 w-6 text-white" />
                      </div>
                      <div className="flex-1">
                        <h4 className="font-semibold text-white">Performance Optimization</h4>
                        <p className="text-sm text-slate-400">Boost load times and improve user experience.</p>
                      </div>
                      <ArrowRight className="h-5 w-5 text-slate-600 group-hover:text-primary group-hover:translate-x-1 transition-all duration-300" />
                    </motion.div>

                    {/* SEO & Accessibility */}
                    <motion.div 
                      initial={{ opacity: 0, x: -20 }}
                      whileInView={{ opacity: 1, x: 0 }}
                      transition={{ delay: 0.4, duration: 0.5, ease: "easeOut" }}
                      viewport={{ once: true }}
                      className="group flex items-center gap-4 p-4 rounded-2xl bg-slate-800/50 border border-slate-700 hover:bg-slate-800/80 hover:border-primary/40 transition-all duration-300"
                    >
                      <div className="flex-shrink-0 w-12 h-12 bg-gradient-to-br from-primary to-primary-variant rounded-xl flex items-center justify-center shadow-lg shadow-primary/20 group-hover:scale-105 transition-transform">
                        <Search className="h-6 w-6 text-white" />
                      </div>
                      <div className="flex-1">
                        <h4 className="font-semibold text-white">SEO & Accessibility</h4>
                        <p className="text-sm text-slate-400">Improve rankings and reach a wider audience.</p>
                      </div>
                      <ArrowRight className="h-5 w-5 text-slate-600 group-hover:text-primary group-hover:translate-x-1 transition-all duration-300" />
                    </motion.div>

                    {/* AI-Powered Fixes */}
                    <motion.div 
                      initial={{ opacity: 0, x: -20 }}
                      whileInView={{ opacity: 1, x: 0 }}
                      transition={{ delay: 0.5, duration: 0.5, ease: "easeOut" }}
                      viewport={{ once: true }}
                      className="group flex items-center gap-4 p-4 rounded-2xl bg-slate-800/50 border border-slate-700 hover:bg-slate-800/80 hover:border-primary/40 transition-all duration-300"
                    >
                      <div className="flex-shrink-0 w-12 h-12 bg-gradient-to-br from-primary to-primary-variant rounded-xl flex items-center justify-center shadow-lg shadow-primary/20 group-hover:scale-105 transition-transform">
                        <Bot className="h-6 w-6 text-white" />
                      </div>
                      <div className="flex-1">
                        <h4 className="font-semibold text-white">AI-Powered Fixes</h4>
                        <p className="text-sm text-slate-400">Get actionable, intelligent recommendations.</p>
                      </div>
                      <ArrowRight className="h-5 w-5 text-slate-600 group-hover:text-primary group-hover:translate-x-1 transition-all duration-300" />
                    </motion.div>

                  </div>

                  {/* Bottom CTA */}
                  <motion.div 
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.6, duration: 0.6, ease: "easeOut" }}
                    viewport={{ once: true }}
                    className="mt-10 text-center"
                  >
                    <Button size="lg" variant="outline" className="bg-transparent border-slate-600 hover:bg-primary/10 hover:border-primary/30 hover:text-primary transition-all duration-300">
                      Explore All Features
                    </Button>
                  </motion.div>

                </div>
              </div>
            </motion.div>

            {/* Right side for Image - 60% width */}
            <motion.div
              initial={{ opacity: 0, x: 50 }}
              whileInView={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8, ease: "easeOut" }}
              viewport={{ once: true }}
              className="relative w-full"
            >
              {/* Image container with enhanced styling */}
              <div className="relative overflow-hidden rounded-2xl shadow-2xl border border-white/10 bg-gradient-to-br from-card/50 to-card/20 backdrop-blur-sm">
                <img 
                  src="/hero.png" 
                  alt="WebAudit AI Dashboard" 
                  className="w-full h-auto object-cover transform transition-all duration-500 hover:scale-105"
                />
                
                {/* Image overlay for better integration */}
                <div className="absolute inset-0 bg-gradient-to-t from-background/20 via-transparent to-transparent pointer-events-none" />
              </div>
              
              
              
            
            </motion.div>
          </div>
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
            <h2 className="text-4xl lg:text-5xl font-bold text-white mb-6">Why Choose WebAudit AI?</h2>
            <p className="mt-4 text-lg text-foreground/80 max-w-3xl mx-auto leading-relaxed">
              Our platform provides a comprehensive suite of tools to analyze, secure, and optimize your website with the power of AI.
            </p>
          </motion.div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8 lg:gap-10">
            {features.map((feature, index) => (
              <motion.div
                key={feature.title}
                initial={{ opacity: 0, y: 50, scale: 0.9 }}
                whileInView={{ opacity: 1, y: 0, scale: 1 }}
                transition={{ duration: 0.6, delay: index * 0.15, ease: "easeOut" }}
                viewport={{ once: true }}
                className="group"
              >
                <Card className="relative bg-gradient-to-br from-slate-900/80 via-slate-800/60 to-slate-900/80 border border-slate-700/50 backdrop-blur-xl h-full flex flex-col overflow-hidden hover:border-primary/30 transition-all duration-500 hover:shadow-2xl hover:shadow-primary/10 hover:-translate-y-2">
                  {/* Background Gradient Overlay */}
                  <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-primary-variant/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                  
                  {/* Animated Border Glow */}
                  <div className="absolute inset-0 rounded-lg bg-gradient-to-r from-primary/20 via-primary-variant/20 to-primary/20 opacity-0 group-hover:opacity-100 blur-xl transition-opacity duration-500 -z-10" />
                  
                  <CardHeader className="relative pb-4 pt-8 px-8">
                    {/* Icon Container with Enhanced Styling */}
                    <motion.div 
                      className="w-16 h-16 mb-6 mx-auto relative"
                      whileHover={{ scale: 1.1, rotate: 5 }}
                      transition={{ duration: 0.3, ease: "easeOut" }}
                    >
                      <div className="absolute inset-0 bg-gradient-to-r from-primary to-primary-variant rounded-2xl shadow-lg group-hover:shadow-primary/40 transition-all duration-300" />
                      <div className="relative w-full h-full bg-gradient-to-br from-primary via-primary to-primary-variant rounded-2xl flex items-center justify-center">
                        <feature.icon className="h-8 w-8 text-white drop-shadow-sm" />
                      </div>
                      
                      {/* Floating particles effect */}
                      <div className="absolute -top-1 -right-1 w-3 h-3 bg-primary rounded-full opacity-0 group-hover:opacity-100 group-hover:animate-ping transition-opacity duration-300" />
                    </motion.div>
                    
                    <CardTitle className="text-2xl font-bold text-white text-center mb-4 group-hover:text-transparent group-hover:bg-clip-text group-hover:bg-gradient-to-r group-hover:from-white group-hover:to-primary/90 transition-all duration-300">
                      {feature.title}
                    </CardTitle>
                  </CardHeader>
                  
                  <CardContent className="relative flex-grow px-8 pb-8">
                    <p className="text-slate-300 text-center leading-relaxed text-base group-hover:text-slate-200 transition-colors duration-300">
                      {feature.description}
                    </p>
                    
                    {/* Feature highlights for each card */}
                    <div className="mt-6 pt-6 border-t border-slate-700/50">
                      <div className="flex items-center justify-center gap-2 text-sm text-slate-400 group-hover:text-slate-300 transition-colors duration-300">
                        {index === 0 && (
                          <>
                            <Zap className="h-4 w-4 text-primary" />
                            <span>Under 30 seconds</span>
                          </>
                        )}
                        {index === 1 && (
                          <>
                            <Search className="h-4 w-4 text-primary" />
                            <span>4 Analysis Types</span>
                          </>
                        )}
                        {index === 2 && (
                          <>
                            <Bot className="h-4 w-4 text-primary" />
                            <span>Smart Recommendations</span>
                          </>
                        )}
                      </div>
                    </div>
                  </CardContent>
                  
                  {/* Bottom Accent Line */}
                  <div className="h-1 w-0 group-hover:w-full bg-gradient-to-r from-primary to-primary-variant transition-all duration-700 ease-out" />
                </Card>
              </motion.div>
            ))}
          </div>

          {/* Additional CTA Section */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.3 }}
            viewport={{ once: true }}
            className="text-center mt-16"
          >
            
          </motion.div>
        </div>
      </section>

      <Footer />
    </div>
  )
}