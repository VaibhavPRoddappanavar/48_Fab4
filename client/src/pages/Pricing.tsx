import { motion } from "framer-motion"
import { Check, Zap, Crown, Building } from "lucide-react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Navigation } from "@/components/navigation"

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
    <div className="min-h-screen bg-gradient-hero">
      <Navigation />
      
      <div className="pt-32 pb-16 px-4 sm:px-6 lg:px-8">
        <div className="max-w-6xl mx-auto">
          {/* Header */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center mb-16"
          >
            <h1 className="text-4xl sm:text-5xl font-bold mb-6">
              Simple, Transparent <span className="gradient-text">Pricing</span>
            </h1>
            <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
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
                className={`relative ${plan.popular ? 'md:-mt-4 md:mb-4' : ''}`}
              >
                {plan.popular && (
                  <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
                    <span className="bg-gradient-primary text-white px-3 py-1 rounded-full text-sm font-medium">
                      Most Popular
                    </span>
                  </div>
                )}
                
                <Card className={`shadow-card-hover h-full ${
                  plan.popular ? 'ring-2 ring-primary shadow-elegant' : ''
                }`}>
                  <CardHeader className="text-center">
                    <div className="w-12 h-12 bg-gradient-primary rounded-lg flex items-center justify-center mx-auto mb-4">
                      <plan.icon className="h-6 w-6 text-white" />
                    </div>
                    <CardTitle className="text-2xl">{plan.name}</CardTitle>
                    <CardDescription className="text-base">
                      {plan.description}
                    </CardDescription>
                    <div className="text-center py-4">
                      <span className="text-4xl font-bold">${plan.price}</span>
                      <span className="text-muted-foreground">/month</span>
                    </div>
                  </CardHeader>
                  
                  <CardContent className="pt-0">
                    <Button 
                      variant={plan.popular ? "hero" : "outline"}
                      className="w-full mb-6"
                      size="lg"
                    >
                      {plan.buttonText}
                    </Button>
                    
                    <div className="space-y-3">
                      {plan.features.map((feature) => (
                        <div key={feature} className="flex items-center">
                          <Check className="h-4 w-4 text-success mr-3 flex-shrink-0" />
                          <span className="text-sm">{feature}</span>
                        </div>
                      ))}
                      
                      {plan.limitations?.map((limitation) => (
                        <div key={limitation} className="flex items-center opacity-60">
                          <div className="h-4 w-4 mr-3 flex-shrink-0 flex items-center justify-center">
                            <div className="h-1 w-3 bg-muted-foreground rounded" />
                          </div>
                          <span className="text-sm">{limitation}</span>
                        </div>
                      ))}
                    </div>
                  </CardContent>
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
            <h2 className="text-3xl font-bold text-center mb-12">
              Frequently Asked Questions
            </h2>
            
            <div className="grid md:grid-cols-2 gap-8">
              {faqs.map((faq, index) => (
                <motion.div
                  key={faq.question}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.7 + index * 0.1 }}
                >
                  <Card className="shadow-card-hover">
                    <CardHeader>
                      <CardTitle className="text-lg">{faq.question}</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <p className="text-muted-foreground">{faq.answer}</p>
                    </CardContent>
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
            <Card className="glass shadow-elegant">
              <CardContent className="p-12">
                <h3 className="text-3xl font-bold mb-4">Ready to secure your website?</h3>
                <p className="text-xl text-muted-foreground mb-8 max-w-2xl mx-auto">
                  Start with a free account and see how WebAudit AI can help improve 
                  your website's security, performance, and user experience.
                </p>
                <Button variant="hero" size="lg">
                  Start Free Scan Now
                </Button>
              </CardContent>
            </Card>
          </motion.div>
        </div>
      </div>
    </div>
  )
}