import { motion } from "framer-motion"
import { useNavigate } from "react-router-dom"
import { Shield, Gauge, Eye, Search, Download, ArrowRight } from "lucide-react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { ScoreCircle } from "@/components/score-circle"
import { ReportCard, ReportIssue } from "@/components/report-card"
import { Navigation } from "@/components/navigation"

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
    <div className="min-h-screen bg-gradient-hero">
      <Navigation />
      
      <div className="pt-32 pb-16 px-4 sm:px-6 lg:px-8">
        <div className="max-w-6xl mx-auto">
          {/* Header */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center mb-12"
          >
            <h1 className="text-3xl sm:text-4xl font-bold mb-4">
              Quick Scan Report
            </h1>
            <p className="text-xl text-muted-foreground mb-2">
              Analysis for: <span className="font-semibold">{mockReportData.scanUrl}</span>
            </p>
            <p className="text-sm text-muted-foreground">
              Scanned on {mockReportData.scanTime}
            </p>
          </motion.div>

          {/* Overall Score */}
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="flex justify-center mb-12"
          >
            <Card className="glass shadow-elegant">
              <CardContent className="p-8 text-center">
                <ScoreCircle 
                  score={mockReportData.overallScore} 
                  size="lg"
                  label="Overall Health"
                  className="mb-4"
                />
                <h3 className="text-2xl font-bold mb-2">Website Health Score</h3>
                <p className="text-muted-foreground">
                  Your site is performing reasonably well with room for improvement
                </p>
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
            {Object.entries(mockReportData.categories).map(([key, category], index) => {
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

          {/* Top Issues */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="mb-12"
          >
            <h2 className="text-2xl font-bold mb-6">Top Issues Found</h2>
            <div className="space-y-4">
              {sortedIssues.map((issue, index) => (
                <motion.div
                  key={issue.id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.5 + index * 0.1 }}
                >
                  <ReportCard issue={issue} />
                </motion.div>
              ))}
            </div>
          </motion.div>

          {/* Actions */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6 }}
            className="flex flex-col sm:flex-row gap-4 justify-center"
          >
            <Button
              variant="hero"
              size="lg"
              onClick={() => {
                sessionStorage.setItem("scanUrl", mockReportData.scanUrl)
                navigate("/scan-progress?type=deep")
              }}
              className="flex-1 sm:flex-none"
            >
              <Search className="h-4 w-4 mr-2" />
              Run Deep Scan
              <ArrowRight className="h-4 w-4 ml-2" />
            </Button>
            
            <Button
              variant="outline"
              size="lg"
              className="flex-1 sm:flex-none"
            >
              <Download className="h-4 w-4 mr-2" />
              Download PDF Report
            </Button>
          </motion.div>
        </div>
      </div>
    </div>
  )
}