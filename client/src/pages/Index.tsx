import { motion } from "framer-motion"
import { Shield, Zap, Bot, ArrowRight } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Navigation } from "@/components/navigation"
import { Footer } from "@/components/footer"
import { useNavigate } from "react-router-dom"

const Index = () => {
  const navigate = useNavigate()

  return (
    <div className="min-h-screen bg-background text-foreground">
      <Navigation />
      
      <div className="pt-32 pb-16 px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto text-center">
          {/* hero4 Section */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-16"
          >
            <motion.div 
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="inline-flex items-center px-4 py-2 bg-white/10 rounded-full text-white/90 text-sm font-medium mb-8 backdrop-blur-sm border border-white/20"
            >
              <Bot className="h-4 w-4 mr-2" />
              AI-Powered Security Platform
            </motion.div>

            <motion.h1 
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.3 }}
              className="text-5xl lg:text-6xl xl:text-7xl font-bold text-white leading-tight mb-6"
            >
              Welcome to
              <br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary to-primary-variant">
                WebAudit AI
              </span>
            </motion.h1>
            
            <motion.p 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.5 }}
              className="text-xl text-foreground/80 max-w-2xl mx-auto mb-8 leading-relaxed"
            >
              Secure, optimize, and enhance your website with the power of artificial intelligence. 
              Get comprehensive security audits and performance insights in minutes.
            </motion.p>

            {/* CTA Buttons */}
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.7 }}
              className="flex flex-col sm:flex-row gap-4 justify-center"
            >
              <Button
                size="lg"
                className="bg-primary hover:bg-primary/90 text-white font-semibold px-8 py-4 text-lg shadow-xl hover:shadow-2xl transition-all duration-300 transform hover:scale-105"
                onClick={() => navigate('/scan')}
              >
                Start Free Scan
                <ArrowRight className="ml-2 h-5 w-5" />
              </Button>
              
              <Button
                variant="outline"
                size="lg"
                className="border-slate-600 text-white hover:bg-primary/10 hover:border-primary/30 font-medium px-8 py-4 text-lg backdrop-blur-sm transition-all duration-300"
                onClick={() => navigate('/about')}
              >
                Learn More
              </Button>
            </motion.div>
          </motion.div>

          {/* Feature Cards */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.9 }}
            className="grid md:grid-cols-3 gap-8"
          >
            {[
              {
                icon: Shield,
                title: "Security Scanning",
                description: "Comprehensive vulnerability detection and threat analysis"
              },
              {
                icon: Zap,
                title: "Performance Optimization",
                description: "Speed up your website with AI-powered recommendations"
              },
              {
                icon: Bot,
                title: "AI-Powered Insights",
                description: "Intelligent analysis and actionable improvement suggestions"
              }
            ].map((feature, index) => (
              <motion.div
                key={feature.title}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 1 + index * 0.1 }}
                className="group"
              >
                <Card className="relative bg-gradient-to-br from-slate-900/80 via-slate-800/60 to-slate-900/80 border border-slate-700/50 backdrop-blur-xl h-full hover:border-primary/30 transition-all duration-500 hover:shadow-2xl hover:shadow-primary/10 hover:-translate-y-2">
                  {/* Background Gradient Overlay */}
                  <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-primary-variant/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                  
                  <CardContent className="p-8 text-center">
                    <div className="w-16 h-16 bg-gradient-to-r from-primary to-primary-variant rounded-2xl flex items-center justify-center mx-auto mb-6 group-hover:scale-105 transition-transform">
                      <feature.icon className="h-8 w-8 text-white" />
                    </div>
                    <h3 className="text-xl font-bold text-white mb-4 group-hover:text-transparent group-hover:bg-clip-text group-hover:bg-gradient-to-r group-hover:from-white group-hover:to-primary/90 transition-all duration-300">
                      {feature.title}
                    </h3>
                    <p className="text-slate-300 group-hover:text-slate-200 transition-colors duration-300">
                      {feature.description}
                    </p>
                  </CardContent>
                  
                  {/* Bottom Accent Line */}
                  <div className="h-1 w-0 group-hover:w-full bg-gradient-to-r from-primary to-primary-variant transition-all duration-700 ease-out" />
                </Card>
              </motion.div>
            ))}
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

      <Footer />
    </div>
  );
};

export default Index;
