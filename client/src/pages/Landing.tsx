import { useState } from "react"
import { motion } from "framer-motion"
import { useNavigate } from "react-router-dom"
import { 
  Bot, 
  ArrowRight,
  Eye,
  Mic,
  Send
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Navigation } from "@/components/navigation"

export default function Landing() {
  const [url, setUrl] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const navigate = useNavigate()

  const handleScan = async (scanType: "quick" | "deep") => {
    // This function can be adapted for the new context if needed
  }

  return (
    <div className="min-h-screen bg-[#0F7BFF]">
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
                className="inline-flex items-center px-3 py-1.5 bg-white/10 rounded-full text-white/90 text-sm font-medium mb-6 backdrop-blur-sm border border-white/20"
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
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-white to-gray-300">
                  Financial Companion
                </span>
              </motion.h1>
              
              <motion.p 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, delay: 0.5 }}
                className="text-lg text-blue-100 max-w-lg mb-8 leading-relaxed"
              >
                Luka AI helps you understand loan eligibility, guides through application processes, and provides financial literacy in 10+ languages.
              </motion.p>

              {/* Language Tags */}
              <motion.div 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.7 }}
                className="flex flex-wrap gap-3 mb-10"
              >
                {["Hindi", "English", "Tamil", "Telugu", "Bengali", "+5 more"].map((lang) => (
                  <motion.span
                    key={lang}
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ duration: 0.4, delay: 0.8 + Math.random() * 0.2 }}
                    className="px-4 py-2 bg-white/10 rounded-md text-white/80 text-sm backdrop-blur-sm border border-white/20"
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
                  className="bg-white text-blue-600 hover:bg-gray-200 font-semibold px-8 py-6 text-lg shadow-lg transform hover:scale-105 transition-all duration-300"
                >
                  Get Started
                  <ArrowRight className="ml-2 h-5 w-5" />
                </Button>
                
                <Button
                  variant="outline"
                  size="lg"
                  className="border-white/30 text-white hover:bg-white/10 font-medium px-8 py-6 text-lg backdrop-blur-sm transition-all duration-300"
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
              <Button variant="outline" className="absolute -top-4 right-4 bg-green-500 text-white border-green-400 hover:bg-green-600">Live Demo</Button>
              {/* Main Chat Card */}
              <div className="relative bg-white/95 backdrop-blur-xl rounded-2xl p-6 shadow-2xl border border-white/20">
                {/* Chat Header */}
                <div className="flex items-center justify-between mb-6">
                  <div className="flex items-center space-x-3">
                    <div className="w-10 h-10 bg-blue-500 rounded-full flex items-center justify-center">
                      <span className="text-white text-2xl font-bold">))</span>
                    </div>
                    <div>
                      <h3 className="font-semibold text-gray-800">Luka AI</h3>
                      <p className="text-xs text-gray-500">Voice & Text Assistant</p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-1">
                    <span className="text-gray-400 text-xs">...</span>
                  </div>
                </div>

                {/* Chat Messages */}
                <div className="space-y-4 mb-6 h-64 overflow-y-auto pr-2">
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5, delay: 1.2 }}
                    className="bg-gray-100 p-3 rounded-lg rounded-bl-none max-w-xs"
                  >
                    <p className="text-sm text-gray-700">Hello! I'm Luka AI. How can I help with your loan needs today?</p>
                  </motion.div>
                  
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5, delay: 1.4 }}
                    className="bg-blue-500 text-white p-3 rounded-lg rounded-br-none max-w-xs ml-auto"
                  >
                    <p className="text-sm">I need a home loan. Not sure where to start.</p>
                  </motion.div>

                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5, delay: 1.6 }}
                    className="bg-gray-100 p-3 rounded-lg rounded-bl-none max-w-xs"
                  >
                    <p className="text-sm text-gray-700">I can help you with that! Let's check your eligibility. What's your preferred language?</p>
                  </motion.div>

                  {/* Listening Indicator */}
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5, delay: 1.8 }}
                    className="flex items-center space-x-2"
                  >
                    <span className="text-sm text-gray-500 italic">Listening...</span>
                    <div className="flex space-x-1">
                      <div className="w-2 h-2 bg-red-500 rounded-full animate-pulse"></div>
                      <div className="w-2 h-2 bg-blue-500 rounded-full animate-pulse delay-200"></div>
                    </div>
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
                    className="pr-20 bg-gray-100 border-gray-200 rounded-lg"
                  />
                  <div className="absolute right-2 top-1/2 transform -translate-y-1/2 flex space-x-1">
                    <Button size="icon" variant="ghost" className="text-gray-500 hover:text-blue-500">
                      <Mic className="h-5 w-5" />
                    </Button>
                     <Button size="icon" className="bg-blue-500 hover:bg-blue-600 rounded-full">
                      <Send className="h-4 w-4" />
                    </Button>
                  </div>
                </motion.div>
                
                {/* Language buttons */}
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
            </motion.div>
          </div>
        </div>
      </section>
    </div>
  )
}