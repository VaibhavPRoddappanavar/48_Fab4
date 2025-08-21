import { motion } from "framer-motion"
import { useNavigate } from "react-router-dom"
import { Shield, Gauge, Eye, Search, Download, ArrowRight, Printer, Home, CheckCircle } from "lucide-react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { ScoreCircle } from "@/components/score-circle"
import { ReportCard, ReportIssue } from "@/components/report-card"
import { Navigation } from "@/components/navigation"
import { Footer } from "@/components/footer"
import { SeverityBadge } from "@/components/severity-badge"

// Mock data - replace with real API data later
const mockReportData = {
  overallScore: 73,
  scanUrl: "example.com",
  scanTime: "2024-01-15 14:30:25",
  categories: {
    security: {
      score: 65,
      issues: [
        {
          id: "1",
          title: "Missing HSTS Header", 
          description: "HTTP Strict Transport Security header not implemented",
          severity: "high" as const,
          category: "Security",
          aiSuggestion: "Implement HSTS to force HTTPS connections and prevent protocol downgrade attacks",
          technicalFix: "Add 'Strict-Transport-Security: max-age=31536000; includeSubDomains' to your server headers"
        }
      ]
    },
    performance: {
      score: 85,
      issues: [
        {
          id: "2", 
          title: "Large Image Files",
          description: "Several images are not optimized for web delivery",
          severity: "medium" as const,
          category: "Performance",
          aiSuggestion: "Convert images to WebP format and implement responsive images",
          technicalFix: "Use <picture> elements with WebP sources and JPEG fallbacks"
        }
      ]
    },
    seo: {
      score: 70,
      issues: [
        {
          id: "3",
          title: "Missing Meta Description",
          description: "Several pages lack meta descriptions for search engines", 
          severity: "medium" as const,
          category: "SEO",
          aiSuggestion: "Add unique, compelling meta descriptions to improve click-through rates",
          nonTechnicalFix: "Write 150-160 character descriptions that summarize each page's content"
        }
      ]
    },
    accessibility: {
      score: 90,
      issues: [
        {
          id: "4",
          title: "Missing Alt Text",
          description: "Some images lack alternative text for screen readers",
          severity: "low" as const, 
          category: "Accessibility",
          aiSuggestion: "Add descriptive alt text to all images for better accessibility",
          nonTechnicalFix: "Describe what's shown in each image for visually impaired users"
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

export default function QuickScanReport() {
  const navigate = useNavigate()
  
  // Flatten all issues for the top issues section
  const allIssues: ReportIssue[] = []
  Object.values(mockReportData.categories).forEach(category => {
    allIssues.push(...category.issues)
  })
  
  const sortedIssues = allIssues
    .sort((a, b) => {
      const severityOrder = { high: 0, medium: 1, low: 2, info: 3 }
      return severityOrder[a.severity] - severityOrder[b.severity]
    })
    .slice(0, 5) // Top 5 issues

  return (
    <div className="min-h-screen bg-background text-foreground">
      <Navigation />
      <div className="container mx-auto px-4 py-24">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <Card className="bg-card/80 backdrop-blur-lg border-border/50 shadow-lg">
            <CardHeader className="border-b border-border/50">
              <div className="flex justify-between items-start">
                <div>
                  <CardTitle className="text-3xl font-bold text-foreground">Quick Scan Report</CardTitle>
                  <CardDescription className="text-muted-foreground mt-1">
                    Results for: <a href={mockReportData.scanUrl} target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">{mockReportData.scanUrl}</a>
                  </CardDescription>
                </div>
                <div className="flex items-center gap-4">
                  <Button variant="outline" onClick={() => window.print()}>
                    <Printer className="mr-2 h-4 w-4" />
                    Print Report
                  </Button>
                  <Button className="bg-primary hover:bg-primary/90" onClick={() => navigate("/")}>
                    <Home className="mr-2 h-4 w-4" />
                    Back to Home
                  </Button>
                </div>
              </div>
            </CardHeader>
            <CardContent className="flex flex-col items-center justify-center p-6">
              <ScoreCircle score={mockReportData.overallScore} />
              <p className="text-lg text-muted-foreground mt-4">
                Your website's health score.
              </p>
            </CardContent>
          </Card>

          {/* Category Scores */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 my-12">
            {Object.entries(mockReportData.categories).map(([key, category], index) => {
              const Icon = categoryIcons[key as keyof typeof categoryIcons]
              
              return (
                <Card key={key} className="bg-card/50 border-border/30 text-center">
                  <CardHeader className="pb-4">
                    <div className="w-12 h-12 bg-primary rounded-lg flex items-center justify-center mx-auto mb-3">
                      <Icon className="h-6 w-6 text-white" />
                    </div>
                    <CardTitle className="capitalize text-foreground">{key}</CardTitle>
                  </CardHeader>
                  <CardContent className="pt-0">
                    <ScoreCircle 
                      score={category.score} 
                      size="sm"
                      showLabel={false}
                    />
                  </CardContent>
                </Card>
              )
            })}
          </div>

          {/* Top Issues */}
          <div>
            <h2 className="text-2xl font-bold text-foreground mb-4">Top Issues Found</h2>
            <div className="space-y-4">
              {sortedIssues.map((issue, index) => (
                <Card key={issue.id} className="bg-card/50 border-border/30">
                  <CardHeader>
                    <div className="flex justify-between items-center">
                      <CardTitle className="text-lg text-foreground">{issue.title}</CardTitle>
                      <SeverityBadge severity={issue.severity} />
                    </div>
                  </CardHeader>
                  <CardContent>
                    <p className="text-muted-foreground">{issue.description}</p>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>

          {/* Upgrade CTA */}
          <Card className="bg-gradient-to-r from-primary/20 to-primary/10 border-primary/30 mt-12">
            <CardHeader>
              <CardTitle className="text-xl text-foreground">Unlock Full Potential with Deep Scan</CardTitle>
              <CardDescription className="text-muted-foreground">
                Get a comprehensive analysis including SEO, accessibility, and more.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Button size="lg" className="bg-primary hover:bg-primary/90" onClick={() => navigate('/scan-progress?type=deep')}>
                <Search className="mr-2 h-5 w-5" />
                Start Deep Scan Now
              </Button>
            </CardContent>
          </Card>
        </motion.div>
      </div>
      <Footer />
    </div>
  )
}