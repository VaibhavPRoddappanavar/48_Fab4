import { motion } from "framer-motion"
import { Check, Zap, Crown, Building } from "lucide-react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Navigation } from "@/components/navigation"
import { Footer } from "@/components/footer"

const plans = [
  {
    name: "Free",
    price: "0",
    description: "Perfect for personal projects and small websites",
    icon: Zap,
    features: [
      "5 quick scans per month",
      "Basic security checks",
      "Performance insights",
      "Email reports",
      "Community support"
    ],
    limitations: [
      "No deep scans",
      "Limited AI recommendations"
    ],
    buttonText: "Start Free",
    popular: false
  },
  {
    name: "Pro", 
    price: "29",
    description: "Ideal for small to medium businesses",
    icon: Crown,
    features: [
      "Unlimited quick scans",
      "50 deep scans per month",
      "Advanced AI recommendations",
      "Priority support",
      "Team collaboration (up to 5 users)",
      "Custom reports",
      "API access",
      "Scheduled scans"
    ],
    buttonText: "Start Free Trial",
    popular: true
  },
  {
    name: "Enterprise",
    price: "99",
    description: "For large organizations with complex needs", 
    icon: Building,
    features: [
      "Unlimited scans",
      "Advanced compliance reporting",
      "Custom integrations",
      "Dedicated account manager",
      "SLA guarantee",
      "Custom security rules",
      "Multi-tenant management",
      "Advanced analytics"
    ],
    buttonText: "Contact Sales",
    popular: false
  }
]

const faqs = [
  {
    question: "What's included in a quick scan?",
    answer: "Quick scans check essential security headers, basic performance metrics, and common SEO issues. They complete in under 30 seconds."
  },
  {
    question: "How detailed are deep scans?",
    answer: "Deep scans perform comprehensive analysis including vulnerability assessment, accessibility compliance, detailed performance audits, and provide AI-powered fix recommendations."
  },
  {
    question: "Can I cancel anytime?",
    answer: "Yes, you can cancel your subscription at any time. You'll continue to have access until the end of your billing period."
  },
  {
    question: "Do you offer custom enterprise solutions?",
    answer: "Yes, we offer customized solutions for enterprise clients including on-premise deployment, custom integrations, and dedicated support."
  }
]

export default function Pricing() {
  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col">
      <Navigation />
      
      <div className="flex-1 pt-32 pb-16 px-4 sm:px-6 lg:px-8">
        <div className="max-w-6xl mx-auto">
          {/* Header */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center mb-16"
          >
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-white mb-6">
              Simple, Transparent <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary to-primary-variant">Pricing</span>
            </h1>
            <p className="text-xl text-foreground/80 max-w-3xl mx-auto leading-relaxed">
              Choose the plan that fits your needs. Start free and upgrade as you grow.
            </p>
          </motion.div>

          {/* Pricing Cards */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="grid md:grid-cols-3 gap-8 mb-16"
          >
            {plans.map((plan, index) => (
              <motion.div
                key={plan.name}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 + index * 0.1 }}
                className={`relative group ${plan.popular ? 'md:-mt-4 md:mb-4' : ''}`}
              >
                {plan.popular && (
                  <div className="absolute -top-4 left-1/2 transform -translate-x-1/2 z-10">
                    <span className="bg-gradient-to-r from-primary to-primary-variant text-white px-3 py-1 rounded-full text-sm font-medium">
                      Most Popular
                    </span>
                  </div>
                )}
                
                <Card className={`relative bg-gradient-to-br from-slate-900/80 via-slate-800/60 to-slate-900/80 border border-slate-700/50 backdrop-blur-xl h-full hover:border-primary/30 transition-all duration-500 hover:shadow-2xl hover:shadow-primary/10 hover:-translate-y-2 ${
                  plan.popular ? 'ring-2 ring-primary/50' : ''
                }`}>
                  {/* Background Gradient Overlay */}
                  <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-primary-variant/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                  
                  <CardHeader className="text-center">
                    <div className="w-12 h-12 bg-gradient-to-r from-primary to-primary-variant rounded-lg flex items-center justify-center mx-auto mb-4 group-hover:scale-105 transition-transform">
                      <plan.icon className="h-6 w-6 text-white" />
                    </div>
                    <CardTitle className="text-2xl text-white">{plan.name}</CardTitle>
                    <CardDescription className="text-base text-slate-300">
                      {plan.description}
                    </CardDescription>
                    <div className="text-center py-4">
                      <span className="text-4xl font-bold text-white">${plan.price}</span>
                      <span className="text-slate-400">/month</span>
                    </div>
                  </CardHeader>
                  
                  <CardContent className="pt-0">
                    <Button 
                      variant={plan.popular ? "default" : "outline"}
                      className={`w-full mb-6 ${
                        plan.popular 
                          ? 'bg-primary hover:bg-primary/90 text-white' 
                          : 'border-slate-600 text-white hover:bg-primary/10 hover:border-primary/30'
                      }`}
                      size="lg"
                    >
                      {plan.buttonText}
                    </Button>
                    
                    <div className="space-y-3">
                      {plan.features.map((feature) => (
                        <div key={feature} className="flex items-center">
                          <Check className="h-4 w-4 text-primary mr-3 flex-shrink-0" />
                          <span className="text-sm text-slate-300">{feature}</span>
                        </div>
                      ))}
                      
                      {plan.limitations?.map((limitation) => (
                        <div key={limitation} className="flex items-center opacity-60">
                          <div className="h-4 w-4 mr-3 flex-shrink-0 flex items-center justify-center">
                            <div className="h-1 w-3 bg-slate-500 rounded" />
                          </div>
                          <span className="text-sm text-slate-400">{limitation}</span>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                  
                  {/* Bottom Accent Line */}
                  <div className="h-1 w-0 group-hover:w-full bg-gradient-to-r from-primary to-primary-variant transition-all duration-700 ease-out" />
                </Card>
              </motion.div>
            ))}
          </motion.div>

          {/* FAQ Section */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6 }}
          >
            <h2 className="text-3xl font-bold text-center text-white mb-12">
              Frequently Asked Questions
            </h2>
            
            <div className="grid md:grid-cols-2 gap-8">
              {faqs.map((faq, index) => (
                <motion.div
                  key={faq.question}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.7 + index * 0.1 }}
                  className="group"
                >
                  <Card className="relative bg-gradient-to-br from-slate-900/80 via-slate-800/60 to-slate-900/80 border border-slate-700/50 backdrop-blur-xl hover:border-primary/30 transition-all duration-500 hover:shadow-2xl hover:shadow-primary/10 hover:-translate-y-2">
                    <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-primary-variant/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                    <CardHeader>
                      <CardTitle className="text-lg text-white">{faq.question}</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <p className="text-slate-300">{faq.answer}</p>
                    </CardContent>
                    
                    {/* Bottom Accent Line */}
                    <div className="h-1 w-0 group-hover:w-full bg-gradient-to-r from-primary to-primary-variant transition-all duration-700 ease-out" />
                  </Card>
                </motion.div>
              ))}
            </div>
          </motion.div>

          {/* CTA Section */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.8 }}
            className="text-center mt-16"
          >
            <Card className="relative bg-slate-900/70 backdrop-blur-xl border border-slate-700/50 shadow-2xl shadow-primary/10">
              <CardContent className="p-12">
                <h3 className="text-3xl font-bold text-white mb-4">Ready to secure your website?</h3>
                <p className="text-xl text-foreground/80 mb-8 max-w-2xl mx-auto leading-relaxed">
                  Start with a free account and see how WebAudit AI can help improve 
                  your website's security, performance, and user experience.
                </p>
                <Button 
                  className="bg-primary hover:bg-primary/90 text-white font-semibold px-8 py-4 text-lg shadow-xl hover:shadow-2xl transition-all duration-300 transform hover:scale-105" 
                  size="lg"
                >
                  Start Free Scan Now
                </Button>
              </CardContent>
            </Card>
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