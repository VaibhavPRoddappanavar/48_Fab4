import { motion } from "framer-motion"
import { Shield, Bot, Users, Award } from "lucide-react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Navigation } from "@/components/navigation"

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
    <div className="min-h-screen bg-gradient-hero">
      <Navigation />
      
      <div className="pt-32 pb-16 px-4 sm:px-6 lg:px-8">
        <div className="max-w-6xl mx-auto">
          {/* Hero Section */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center mb-16"
          >
            <h1 className="text-4xl sm:text-5xl font-bold mb-6">
              About <span className="gradient-text">WebAudit AI</span>
            </h1>
            <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
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
                <div className="text-3xl sm:text-4xl font-bold gradient-text mb-2">
                  {stat.number}
                </div>
                <div className="text-muted-foreground">
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
            <Card className="glass shadow-elegant">
              <CardContent className="p-8 sm:p-12">
                <div className="grid lg:grid-cols-2 gap-12 items-center">
                  <div>
                    <h2 className="text-3xl font-bold mb-6">Our Mission</h2>
                    <p className="text-muted-foreground text-lg mb-6">
                      In today's digital landscape, website security and performance are more 
                      critical than ever. We believe every website should be secure, fast, 
                      accessible, and optimized for success.
                    </p>
                    <p className="text-muted-foreground text-lg">
                      WebAudit AI combines cutting-edge artificial intelligence with proven 
                      security frameworks to deliver comprehensive website analysis that's 
                      both powerful and easy to understand.
                    </p>
                  </div>
                  
                  <div className="relative">
                    <div className="w-64 h-64 bg-gradient-primary rounded-full opacity-20 blur-3xl mx-auto" />
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
            <h2 className="text-3xl font-bold text-center mb-12">
              Why Choose WebAudit AI?
            </h2>
            
            <div className="grid md:grid-cols-2 gap-8">
              {features.map((feature, index) => (
                <motion.div
                  key={feature.title}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.7 + index * 0.1 }}
                >
                  <Card className="shadow-card-hover h-full">
                    <CardHeader>
                      <div className="w-12 h-12 bg-gradient-primary rounded-lg flex items-center justify-center mb-4">
                        <feature.icon className="h-6 w-6 text-white" />
                      </div>
                      <CardTitle className="text-xl">{feature.title}</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <CardDescription className="text-base">
                        {feature.description}
                      </CardDescription>
                    </CardContent>
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
            <h2 className="text-3xl font-bold mb-6">Powered by Advanced Technology</h2>
            <p className="text-xl text-muted-foreground max-w-3xl mx-auto mb-8">
              Our platform leverages machine learning, real-time threat intelligence, 
              and industry-standard security frameworks to provide the most comprehensive 
              website analysis available.
            </p>
            
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
              {["OWASP", "WCAG 2.1", "GDPR", "SOC 2"].map((standard) => (
                <div
                  key={standard}
                  className="glass p-4 rounded-lg"
                >
                  <div className="font-semibold">{standard}</div>
                  <div className="text-sm text-muted-foreground">Compliant</div>
                </div>
              ))}
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  )
}