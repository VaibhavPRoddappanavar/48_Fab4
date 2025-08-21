import { useState } from "react"
import { motion } from "framer-motion"
import { useNavigate } from "react-router-dom"
import { Zap, Search } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent } from "@/components/ui/card"
import { Navigation } from "@/components/navigation"
import { Footer } from "@/components/footer"
import { useToast } from "@/hooks/use-toast"

export default function Scan() {
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
    
    sessionStorage.setItem("scanUrl", url)
    
    setTimeout(() => {
      navigate(`/scan-progress?type=${scanType}`)
    }, 500)
  }

  return (
    <div className="min-h-screen bg-background text-foreground">
      <Navigation />
      
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
