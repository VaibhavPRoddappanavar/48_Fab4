import { motion } from "framer-motion"
import { Shield, Bot, Users, Award } from "lucide-react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Navigation } from "@/components/navigation"
import { Footer } from "@/components/footer"

const features = [
  {
    icon: Shield,
    title: "Advanced Security Scanning",
    description: "Comprehensive vulnerability detection using industry-leading security frameworks and real-time threat intelligence."
  },
  {
    icon: Bot,
    title: "AI-Powered Analysis",
    description: "Machine learning algorithms analyze patterns and provide intelligent recommendations for optimization."
  },
  {
    icon: Users,
    title: "Team Collaboration",
    description: "Share reports, track progress, and collaborate with your development and security teams."
  },
  {
    icon: Award,
    title: "Industry Standards",
    description: "Compliance checks for OWASP, WCAG, and other industry security and accessibility standards."
  }
]

const stats = [
  { number: "10M+", label: "Websites Scanned" },
  { number: "99.9%", label: "Accuracy Rate" },
  { number: "50+", label: "Security Checks" },
  { number: "24/7", label: "Monitoring" }
]

export default function About() {
  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col">
      <Navigation />
      
      <div className="flex-1 pt-32 pb-16 px-4 sm:px-6 lg:px-8">
        <div className="max-w-6xl mx-auto">
          {/* hero4 Section */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center mb-16"
          >
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-white mb-6">
              About <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary to-primary-variant">WebAudit AI</span>
            </h1>
            <p className="text-xl text-foreground/80 max-w-3xl mx-auto leading-relaxed">
              We're on a mission to make the web safer and more accessible for everyone. 
              Our AI-powered platform helps businesses identify and fix critical security, 
              performance, and accessibility issues before they impact users.
            </p>
          </motion.div>

          {/* Stats Section */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="grid grid-cols-2 md:grid-cols-4 gap-8 mb-16"
          >
            {stats.map((stat, index) => (
              <motion.div
                key={stat.label}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 + index * 0.1 }}
                className="text-center"
              >
                <div className="text-3xl sm:text-4xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-primary to-primary-variant mb-2">
                  {stat.number}
                </div>
                <div className="text-foreground/70">
                  {stat.label}
                </div>
              </motion.div>
            ))}
          </motion.div>

          {/* Mission Section */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="mb-16"
          >
            <Card className="relative bg-gradient-to-br from-slate-900/80 via-slate-800/60 to-slate-900/80 border border-slate-700/50 backdrop-blur-xl shadow-2xl shadow-primary/10">
              <CardContent className="p-8 sm:p-12">
                <div className="grid lg:grid-cols-2 gap-12 items-center">
                  <div>
                    <h2 className="text-3xl font-bold text-white mb-6">Our Mission</h2>
                    <p className="text-foreground/80 text-lg mb-6 leading-relaxed">
                      In today's digital landscape, website security and performance are more 
                      critical than ever. We believe every website should be secure, fast, 
                      accessible, and optimized for success.
                    </p>
                    <p className="text-foreground/80 text-lg leading-relaxed">
                      WebAudit AI combines cutting-edge artificial intelligence with proven 
                      security frameworks to deliver comprehensive website analysis that's 
                      both powerful and easy to understand.
                    </p>
                  </div>
                  
                  <div className="relative">
                    <div className="w-64 h-64 bg-gradient-to-r from-primary to-primary-variant rounded-full opacity-20 blur-3xl mx-auto" />
                    <div className="absolute inset-0 flex items-center justify-center">
                      <Shield className="h-24 w-24 text-primary" />
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>

          {/* Features Grid */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6 }}
            className="mb-16"
          >
            <h2 className="text-3xl font-bold text-center text-white mb-12">
              Why Choose WebAudit AI?
            </h2>
            
            <div className="grid md:grid-cols-2 gap-8">
              {features.map((feature, index) => (
                <motion.div
                  key={feature.title}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.7 + index * 0.1 }}
                  className="group"
                >
                  <Card className="relative bg-gradient-to-br from-slate-900/80 via-slate-800/60 to-slate-900/80 border border-slate-700/50 backdrop-blur-xl h-full hover:border-primary/30 transition-all duration-500 hover:shadow-2xl hover:shadow-primary/10 hover:-translate-y-2">
                    {/* Background Gradient Overlay */}
                    <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-primary-variant/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                    
                    <CardHeader>
                      <div className="w-12 h-12 bg-gradient-to-r from-primary to-primary-variant rounded-lg flex items-center justify-center mb-4 group-hover:scale-105 transition-transform">
                        <feature.icon className="h-6 w-6 text-white" />
                      </div>
                      <CardTitle className="text-xl text-white group-hover:text-transparent group-hover:bg-clip-text group-hover:bg-gradient-to-r group-hover:from-white group-hover:to-primary/90 transition-all duration-300">{feature.title}</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <CardDescription className="text-base text-slate-300 group-hover:text-slate-200 transition-colors duration-300">
                        {feature.description}
                      </CardDescription>
                    </CardContent>
                    
                    {/* Bottom Accent Line */}
                    <div className="h-1 w-0 group-hover:w-full bg-gradient-to-r from-primary to-primary-variant transition-all duration-700 ease-out" />
                  </Card>
                </motion.div>
              ))}
            </div>
          </motion.div>

          {/* Technology Section */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.8 }}
            className="text-center"
          >
            <h2 className="text-3xl font-bold text-white mb-6">Powered by Advanced Technology</h2>
            <p className="text-xl text-foreground/80 max-w-3xl mx-auto mb-8 leading-relaxed">
              Our platform leverages machine learning, real-time threat intelligence, 
              and industry-standard security frameworks to provide the most comprehensive 
              website analysis available.
            </p>
            
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
              {["OWASP", "WCAG 2.1", "GDPR", "SOC 2"].map((standard, index) => (
                <motion.div
                  key={standard}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.9 + index * 0.1 }}
                  className="relative bg-slate-900/70 backdrop-blur-xl border border-slate-700/50 p-4 rounded-lg hover:border-primary/30 transition-all duration-300"
                >
                  <div className="font-semibold text-white">{standard}</div>
                  <div className="text-sm text-slate-400">Compliant</div>
                </motion.div>
              ))}
            </div>
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
  )
}