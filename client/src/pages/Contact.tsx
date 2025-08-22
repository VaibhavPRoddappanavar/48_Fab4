import { useState } from "react"
import { motion } from "framer-motion"
import { Mail, Phone, MapPin, Send } from "lucide-react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { Navigation } from "@/components/navigation"
import { useToast } from "@/hooks/use-toast"
import { Footer } from "@/components/footer"

const contactMethods = [
  {
    icon: Mail,
    title: "Email Us",
    description: "Get in touch via email",
    contact: "hello@webaudit.ai",
    action: "mailto:hello@webaudit.ai"
  },
  {
    icon: Phone,
    title: "Call Us", 
    description: "Speak with our team",
    contact: "+1 (555) 123-4567",
    action: "tel:+15551234567"
  },
  {
    icon: MapPin,
    title: "Visit Us",
    description: "Meet us in person",
    contact: "San Francisco, CA",
    action: "#"
  }
]

export default function Contact() {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    company: "",
    message: ""
  })
  const [isSubmitting, setIsSubmitting] = useState(false)
  const { toast } = useToast()

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    })
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)

    // Simulate form submission
    setTimeout(() => {
      setIsSubmitting(false)
      toast({
        title: "Message Sent!",
        description: "We'll get back to you within 24 hours.",
      })
      setFormData({
        name: "",
        email: "",
        company: "",
        message: ""
      })
    }, 2000)
  }

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
            <h1 className="text-4xl sm:text-5xl font-bold mb-6">
              Get in <span className="gradient-text">Touch</span>
            </h1>
            <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
              Have questions about WebAudit AI? Want to discuss enterprise solutions? 
              We'd love to hear from you.
            </p>
          </motion.div>

          <div className="grid lg:grid-cols-2 gap-12">
            {/* Contact Form */}
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.2 }}
            >
              <Card className="shadow-card-hover">
                <CardHeader>
                  <CardTitle className="text-2xl">Send us a Message</CardTitle>
                  <CardDescription>
                    Fill out the form below and we'll respond within 24 hours
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <form onSubmit={handleSubmit} className="space-y-6">
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="name">Name *</Label>
                        <Input
                          id="name"
                          name="name"
                          value={formData.name}
                          onChange={handleInputChange}
                          required
                          placeholder="Your full name"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="email">Email *</Label>
                        <Input
                          id="email"
                          name="email"
                          type="email"
                          value={formData.email}
                          onChange={handleInputChange}
                          required
                          placeholder="your@email.com"
                        />
                      </div>
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="company">Company</Label>
                      <Input
                        id="company"
                        name="company"
                        value={formData.company}
                        onChange={handleInputChange}
                        placeholder="Your company name (optional)"
                      />
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="message">Message *</Label>
                      <Textarea
                        id="message"
                        name="message"
                        value={formData.message}
                        onChange={handleInputChange}
                        required
                        placeholder="Tell us about your project or question..."
                        className="min-h-32"
                      />
                    </div>
                    
                    <Button
                      type="submit"
                      variant="hero4"
                      size="lg"
                      className="w-full"
                      disabled={isSubmitting}
                    >
                      {isSubmitting ? (
                        "Sending..."
                      ) : (
                        <>
                          <Send className="h-4 w-4 mr-2" />
                          Send Message
                        </>
                      )}
                    </Button>
                  </form>
                </CardContent>
              </Card>
            </motion.div>

            {/* Contact Information */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.4 }}
              className="space-y-6"
            >
              <Card className="glass shadow-elegant">
                <CardContent className="p-8">
                  <h3 className="text-2xl font-bold mb-6">Let's Connect</h3>
                  <p className="text-muted-foreground mb-8">
                    Whether you're looking to improve your website's security, 
                    need help with compliance, or want to discuss enterprise solutions, 
                    our team is here to help.
                  </p>
                  
                  <div className="space-y-6">
                    {contactMethods.map((method, index) => (
                      <motion.div
                        key={method.title}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.5 + index * 0.1 }}
                      >
                        <a 
                          href={method.action}
                          className="flex items-start space-x-4 p-4 rounded-lg hover:bg-muted/50 transition-colors group"
                        >
                          <div className="w-12 h-12 bg-gradient-primary rounded-lg flex items-center justify-center group-hover:scale-105 transition-transform">
                            <method.icon className="h-6 w-6 text-white" />
                          </div>
                          <div>
                            <h4 className="font-semibold mb-1">{method.title}</h4>
                            <p className="text-sm text-muted-foreground mb-1">
                              {method.description}
                            </p>
                            <p className="text-primary font-medium">
                              {method.contact}
                            </p>
                          </div>
                        </a>
                      </motion.div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              
            </motion.div>
          </div>

          {/* CTA Section */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6 }}
            className="text-center mt-16"
          >
            <Card className="glass shadow-elegant">
              <CardContent className="p-12">
                <h3 className="text-3xl font-bold mb-4">Ready to Get Started?</h3>
                <p className="text-xl text-muted-foreground mb-8">
                  Don't wait for security issues to impact your business. 
                  Start your free website audit today.
                </p>
                <Button variant="hero4" size="lg">
                  Start Free Audit
                </Button>
              </CardContent>
            </Card>
          </motion.div>
        </div>
      </div>
      
      {/* Background Effects */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        {/* Background effects code */}
      </div>

      <Footer />
    </div>
  )
}