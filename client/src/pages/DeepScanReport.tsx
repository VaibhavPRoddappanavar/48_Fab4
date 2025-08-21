import { useState } from "react"
import { motion } from "framer-motion"
import { Shield, Gauge, Eye, Search, Download, Bot, TrendingUp, Users } from "lucide-react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion"
import { ScoreCircle } from "@/components/score-circle"
import { ReportCard, ReportIssue } from "@/components/report-card"
import { Navigation } from "@/components/navigation"
import { Footer } from "@/components/footer"
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, ResponsiveContainer } from "recharts"

// Extended mock data for deep scan
const mockDeepScanData = {
  overallScore: 68,
  scanUrl: "example.com", 
  scanTime: "2024-01-15 14:35:12",
  categories: {
    security: {
      score: 60,
      issues: [
        {
          id: "s1",
          title: "Missing HSTS Header",
          description: "HTTP Strict Transport Security header not implemented",
          severity: "high" as const,
          category: "Security",
          aiSuggestion: "Implement HSTS to force HTTPS connections and prevent protocol downgrade attacks",
          technicalFix: "Add 'Strict-Transport-Security: max-age=31536000; includeSubDomains' to your server headers",
          nonTechnicalFix: "Ask your hosting provider or developer to enable HSTS security headers"
        },
        {
          id: "s2", 
          title: "Weak Content Security Policy",
          description: "CSP header is too permissive, allowing inline scripts",
          severity: "medium" as const,
          category: "Security", 
          aiSuggestion: "Tighten CSP to block inline scripts and restrict resource loading",
          technicalFix: "Replace 'unsafe-inline' with nonces or hashes for legitimate inline scripts"
        },
        {
          id: "s3",
          title: "Missing Security Headers",
          description: "X-Frame-Options and X-Content-Type-Options headers not set",
          severity: "medium" as const,
          category: "Security",
          aiSuggestion: "Add protective headers to prevent clickjacking and MIME sniffing attacks"
        }
      ]
    },
    performance: {
      score: 75,
      issues: [
        {
          id: "p1",
          title: "Large Image Files",
          description: "Several images are not optimized for web delivery (average 2.3MB)", 
          severity: "high" as const,
          category: "Performance",
          aiSuggestion: "Convert images to WebP format and implement responsive images to reduce load times",
          technicalFix: "Use <picture> elements with WebP sources and JPEG fallbacks, implement lazy loading"
        },
        {
          id: "p2",
          title: "Render Blocking Resources",
          description: "CSS and JavaScript files blocking initial page render",
          severity: "medium" as const,
          category: "Performance",
          aiSuggestion: "Defer non-critical CSS and JavaScript to improve First Contentful Paint"
        }
      ]
    },
    seo: {
      score: 65,
      issues: [
        {
          id: "se1", 
          title: "Missing Meta Descriptions",
          description: "8 out of 12 pages lack meta descriptions for search engines",
          severity: "high" as const,
          category: "SEO",
          aiSuggestion: "Add unique, compelling meta descriptions to improve click-through rates from search results",
          nonTechnicalFix: "Write 150-160 character descriptions that summarize each page's content and value proposition"
        },
        {
          id: "se2",
          title: "Duplicate Title Tags", 
          description: "Multiple pages share identical title tags",
          severity: "medium" as const,
          category: "SEO",
          aiSuggestion: "Create unique, descriptive titles for each page including target keywords"
        }
      ]
    },
    accessibility: {
      score: 85,
      issues: [
        {
          id: "a1",
          title: "Missing Alt Text",
          description: "12 images lack alternative text for screen readers",
          severity: "medium" as const,
          category: "Accessibility", 
          aiSuggestion: "Add descriptive alt text to all images for better screen reader accessibility",
          nonTechnicalFix: "Describe what's shown in each image to help visually impaired users understand the content"
        },
        {
          id: "a2",
          title: "Low Color Contrast",
          description: "Some text elements don't meet WCAG contrast requirements",
          severity: "low" as const,
          category: "Accessibility",
          aiSuggestion: "Adjust colors to meet WCAG AA standards for better readability"
        }
      ]
    }
  }
}

const categoryIcons = {
  security: Shield,
  performance: Gauge,
  seo: Search,
  accessibility: Eye
}

const severityChartData = [
  { name: "High", count: 3, fill: "hsl(var(--severity-high))" },
  { name: "Medium", count: 7, fill: "hsl(var(--severity-medium))" },
  { name: "Low", count: 2, fill: "hsl(var(--severity-low))" },
  { name: "Info", count: 1, fill: "hsl(var(--severity-info))" }
]

export default function DeepScanReport() {
  const [activeTab, setActiveTab] = useState("summary")
  
  // Flatten all issues by category for different tabs
  const allIssues: ReportIssue[] = []
  Object.values(mockDeepScanData.categories).forEach(category => {
    allIssues.push(...category.issues)
  })
    
  const technicalIssues = allIssues.filter(issue => issue.technicalFix)
  const nonTechnicalIssues = allIssues.filter(issue => issue.nonTechnicalFix)

  return (
    <div className="min-h-screen bg-gradient-hero text-foreground flex flex-col">
      <Navigation />
      
      <div className="flex-1 pt-32 pb-16 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          {/* Header */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center mb-12"
          >
            <h1 className="text-3xl sm:text-4xl font-bold mb-4">
              Deep Scan Report
            </h1>
            <p className="text-xl text-muted-foreground mb-2">
              Comprehensive analysis for: <span className="font-semibold">{mockDeepScanData.scanUrl}</span>
            </p>
            <p className="text-sm text-muted-foreground">
              Scanned on {mockDeepScanData.scanTime}
            </p>
          </motion.div>

          {/* Overview Cards */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12"
          >
            {/* Overall Score */}
            <Card className="glass shadow-elegant">
              <CardContent className="p-6 text-center">
                <ScoreCircle 
                  score={mockDeepScanData.overallScore} 
                  size="md"
                  label="Overall Score"
                />
                <p className="text-sm text-muted-foreground mt-4">
                  Based on {allIssues.length} issues found
                </p>
              </CardContent>
            </Card>

            {/* Issues Breakdown */}
            <Card className="shadow-card-hover">
              <CardHeader>
                <CardTitle className="flex items-center">
                  <TrendingUp className="h-5 w-5 mr-2 text-primary" />
                  Issues Found
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span className="text-sm">High Priority</span>
                    <span className="font-semibold text-severity-high">3</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm">Medium Priority</span>
                    <span className="font-semibold text-severity-medium">7</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm">Low Priority</span>
                    <span className="font-semibold text-severity-low">2</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Severity Chart */}
            <Card className="shadow-card-hover">
              <CardHeader>
                <CardTitle>Issue Distribution</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="h-32">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={severityChartData}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="name" tick={{ fontSize: 12 }} />
                      <YAxis tick={{ fontSize: 12 }} />
                      <Bar dataKey="count" fill="currentColor" />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>
          </motion.div>

          {/* Category Scores */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="grid grid-cols-2 md:grid-cols-4 gap-6 mb-12"
          >
            {Object.entries(mockDeepScanData.categories).map(([key, category], index) => {
              const Icon = categoryIcons[key as keyof typeof categoryIcons]
              
              return (
                <motion.div
                  key={key}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.3 + index * 0.1 }}
                >
                  <Card className="shadow-card-hover text-center">
                    <CardHeader className="pb-4">
                      <div className="w-12 h-12 bg-gradient-primary rounded-lg flex items-center justify-center mx-auto mb-3">
                        <Icon className="h-6 w-6 text-white" />
                      </div>
                      <CardTitle className="capitalize">{key}</CardTitle>
                      <CardDescription>
                        {category.issues.length} issues
                      </CardDescription>
                    </CardHeader>
                    <CardContent className="pt-0">
                      <ScoreCircle 
                        score={category.score} 
                        size="sm"
                        showLabel={false}
                      />
                    </CardContent>
                  </Card>
                </motion.div>
              )
            })}
          </motion.div>

          {/* Detailed Report Tabs */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
          >
            <Tabs value={activeTab} onValueChange={setActiveTab} className="mb-8">
              <TabsList className="grid w-full grid-cols-3">
                <TabsTrigger value="summary">Executive Summary</TabsTrigger>
                <TabsTrigger value="technical">Developer Fixes</TabsTrigger>
                <TabsTrigger value="business">Business Summary</TabsTrigger>
              </TabsList>

              <TabsContent value="summary" className="mt-8">
                <div className="grid gap-6">
                  {Object.entries(mockDeepScanData.categories).map(([key, category]) => {
                    const Icon = categoryIcons[key as keyof typeof categoryIcons]
                    
                    return (
                      <Card key={key} className="shadow-card-hover">
                        <CardHeader>
                          <CardTitle className="flex items-center capitalize">
                            <Icon className="h-5 w-5 mr-2 text-primary" />
                            {key} Issues
                          </CardTitle>
                        </CardHeader>
                        <CardContent>
                          <Accordion type="single" collapsible className="w-full">
                            {category.issues.map((issue, index) => (
                              <AccordionItem key={issue.id} value={issue.id}>
                                <AccordionTrigger className="text-left">
                                  <div className="flex items-center justify-between w-full mr-4">
                                    <span>{issue.title}</span>
                                    <div className="flex items-center space-x-2">
                                      <span className={`px-2 py-1 rounded text-xs font-medium ${
                                        issue.severity === "high" ? "bg-severity-high text-white" :
                                        issue.severity === "medium" ? "bg-severity-medium text-white" :
                                        issue.severity === "low" ? "bg-severity-low text-white" :
                                        "bg-severity-info text-white"
                                      }`}>
                                        {issue.severity.toUpperCase()}
                                      </span>
                                    </div>
                                  </div>
                                </AccordionTrigger>
                                <AccordionContent>
                                  <div className="pt-4">
                                    <p className="text-muted-foreground mb-4">{issue.description}</p>
                                    {issue.aiSuggestion && (
                                      <div className="bg-primary/5 border-l-4 border-primary p-4 rounded-r-lg">
                                        <div className="flex items-start space-x-2">
                                          <Bot className="h-4 w-4 text-primary mt-0.5 flex-shrink-0" />
                                          <div>
                                            <h5 className="font-medium text-primary mb-1">AI Recommendation</h5>
                                            <p className="text-sm text-muted-foreground">{issue.aiSuggestion}</p>
                                          </div>
                                        </div>
                                      </div>
                                    )}
                                  </div>
                                </AccordionContent>
                              </AccordionItem>
                            ))}
                          </Accordion>
                        </CardContent>
                      </Card>
                    )
                  })}
                </div>
              </TabsContent>

              <TabsContent value="technical" className="mt-8">
                <div className="space-y-6">
                  <Card className="shadow-card-hover">
                    <CardHeader>
                      <CardTitle>Technical Implementation Guide</CardTitle>
                      <CardDescription>
                        Detailed fixes for developers and technical teams
                      </CardDescription>
                    </CardHeader>
                  </Card>
                  
                  <div className="space-y-4">
                    {technicalIssues.map((issue, index) => (
                      <ReportCard key={issue.id} issue={issue} />
                    ))}
                  </div>
                </div>
              </TabsContent>

              <TabsContent value="business" className="mt-8">
                <div className="space-y-6">
                  <Card className="shadow-card-hover">
                    <CardHeader>
                      <CardTitle>Business Impact Summary</CardTitle>
                      <CardDescription>
                        Non-technical solutions and business recommendations
                      </CardDescription>
                    </CardHeader>
                  </Card>
                  
                  <div className="space-y-4">
                    {nonTechnicalIssues.map((issue, index) => (
                      <ReportCard key={issue.id} issue={issue} />
                    ))}
                  </div>
                </div>
              </TabsContent>
            </Tabs>

            {/* Action Buttons */}
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button variant="hero" size="lg" className="flex-1 sm:flex-none">
                <Download className="h-4 w-4 mr-2" />
                Download Full Report
              </Button>
              
              <Button variant="outline" size="lg" className="flex-1 sm:flex-none">
                <Users className="h-4 w-4 mr-2" />
                Share with Team
              </Button>
            </div>
          </motion.div>
        </div>
      </div>

      <Footer />
    </div>
  )
}