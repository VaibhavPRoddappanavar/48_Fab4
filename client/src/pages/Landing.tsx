import { useState } from "react"
import { motion } from "framer-motion"
import { useNavigate } from "react-router-dom"
import { 
  Bot, 
  Eye, 
  ArrowRight,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Navigation } from "@/components/navigation"
import { Footer } from "@/components/footer"
import { useToast } from "@/hooks/use-toast"

export default function Landing() {
  const [url, setUrl] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const navigate = useNavigate()
  const { toast } = useToast()

  const handleScan = (scanType: "quick" | "deep") => {
    if (!url) {
      toast({
        title: "URL is required",
        description: "Please enter a website URL to start scanning.",
        variant: "destructive",
      })
      return
    }
    setIsLoading(true)
    sessionStorage.setItem("scanUrl", url)
    
    // Simulate navigation delay
    setTimeout(() => {
      navigate(`/scan-progress?type=${scanType}`)
    }, 500)
  }

  return (
    <div className="min-h-screen bg-[#007BFF] text-white">
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
                AI-Powered Financial Assistant
              </motion.div>

              <motion.h1 
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, delay: 0.3 }}
                className="text-5xl lg:text-6xl xl:text-7xl font-bold text-white leading-tight mb-6"
              >
                Your Multilingual
                <br />
                <span className="text-white">
                  Financial Companion
                </span>
              </motion.h1>
              
              <motion.p 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, delay: 0.5 }}
                className="text-xl text-blue-100 max-w-xl mb-8 leading-relaxed"
              >
                Luka AI helps you understand loan eligibility, guides through application processes, and provides financial literacy in 10+ languages.
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
              <div className="relative bg-white backdrop-blur-xl rounded-3xl p-6 shadow-2xl border border-white/20">
                {/* Chat Header */}
                <div className="flex items-center justify-between mb-6">
                  <div className="flex items-center space-x-3">
                    <div className="w-10 h-10 bg-blue-500 rounded-full flex items-center justify-center">
                      <span className="text-white text-xl">🔊</span>
                    </div>
                    <div>
                      <h3 className="font-semibold text-gray-800">Luka AI</h3>
                      <div className="flex items-center space-x-1">
                        <span className="text-xs text-gray-500">Voice & Text Assistant</span>
                      </div>
                    </div>
                  </div>
                  <Button variant="outline" size="sm" className="text-green-600 border-green-600">Live Demo</Button>
                </div>

                {/* Chat Messages */}
                <div className="space-y-4 mb-6 text-gray-800">
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5, delay: 1.2 }}
                    className="bg-gray-100 p-4 rounded-2xl rounded-bl-md max-w-xs"
                  >
                    <p className="text-sm">Hello! I'm Luka AI. How can I help with your loan needs today?</p>
                  </motion.div>
                  
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5, delay: 1.4 }}
                    className="bg-gray-100 p-4 rounded-2xl rounded-br-md max-w-xs ml-auto"
                  >
                    <p className="text-sm text-gray-700">I need a home loan. Not sure where to start.</p>
                  </motion.div>

                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5, delay: 1.6 }}
                    className="bg-gray-100 p-4 rounded-2xl rounded-bl-md max-w-xs"
                  >
                    <p className="text-sm">I can help you with that! Let's check your eligibility. What's your preferred language?</p>
                  </motion.div>

                  {/* Listening Indicator */}
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5, delay: 1.8 }}
                    className="flex items-center space-x-2"
                  >
                    <span className="text-sm text-gray-500">Listening...</span>
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
                    className="pr-12 bg-gray-50 border-gray-200 rounded-xl text-gray-800"
                  />
                  <Button size="sm" className="absolute right-2 top-1/2 transform -translate-y-1/2 bg-blue-500 hover:bg-blue-600 rounded-lg">
                    <span className="text-xl">▲</span>
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
                      className="text-xs border-gray-200 hover:bg-blue-50 text-gray-600"
                    >
                      {lang}
                    </Button>
                  ))}
                </motion.div>
              </div>
            </motion.div>
          </div>
        </div>
      </section>
      <Footer />
    </div>
  )
}