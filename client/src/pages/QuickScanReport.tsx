import { motion } from "framer-motion"
import { useNavigate } from "react-router-dom"
import { 
  Shield, 
  Gauge, 
  Eye, 
  Search, 
  Download, 
  ArrowRight, 
  Printer, 
  Home, 
  CheckCircle,
  AlertTriangle,
  Info,
  XCircle,
  Calendar,
  Clock,
  TrendingUp,
  BarChart3,
  Globe,
  RefreshCw
} from "lucide-react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Progress } from "@/components/ui/progress"
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
  lastUpdate: "March 1, 2025",
  scheduledUpdate: "Recheck manually",
  pagesCrawled: "45/45",
  totalIssues: 847,
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
  },
  issueStats: {
    errors: 23,
    warnings: 156,
    notices: 668
  },
  pageHealth: {
    healthy: 32,
    hasIssues: 13
  }
}

const categoryIcons = {
  security: Shield,
  performance: Gauge,
  seo: Search,
  accessibility: Eye
}

const severityColors = {
  high: "text-red-500 bg-red-50 border-red-200",
  medium: "text-orange-500 bg-orange-50 border-orange-200", 
  low: "text-blue-500 bg-blue-50 border-blue-200",
  info: "text-gray-500 bg-gray-50 border-gray-200"
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
    <div className="min-h-screen bg-slate-900 text-foreground">
      <Navigation />
      
      <div className="container mx-auto px-4 py-24 max-w-7xl">
        {/* Header Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="mb-8"
        >
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-4">
              <div>
                <h1 className="text-3xl font-bold text-emerald-400">Overview / {mockReportData.scanUrl}</h1>
                <div className="flex items-center gap-6 text-sm text-slate-400 mt-1">
                  <span className="flex items-center gap-1">
                    Last update {mockReportData.lastUpdate}
                  </span>
                  <span className="flex items-center gap-1">
                    Scheduled update {mockReportData.scheduledUpdate}
                  </span>
                  <span className="flex items-center gap-1">
                    Pages crawled {mockReportData.pagesCrawled}
                  </span>
                </div>
              </div>
            </div>
            
            <div className="flex items-center gap-3">
              <Button className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md flex items-center gap-2">
                <RefreshCw className="h-4 w-4" />
                RESTART AUDIT
              </Button>
              <Button className="bg-slate-700 hover:bg-slate-600 text-emerald-400 px-4 py-2 rounded-md flex items-center gap-2">
                <Download className="h-4 w-4" />
                EXPORT
              </Button>
              <Button variant="ghost" size="icon" className="text-slate-400 hover:text-emerald-400">
                <div className="flex flex-col gap-1">
                  <div className="w-1 h-1 bg-current rounded-full"></div>
                  <div className="w-1 h-1 bg-current rounded-full"></div>
                  <div className="w-1 h-1 bg-current rounded-full"></div>
                </div>
              </Button>
            </div>
          </div>
        </motion.div>

        {/* Main Dashboard Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-8">
          {/* Health Score Card */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.1 }}
          >
            <div className="bg-slate-800 border border-slate-700 rounded-lg p-6">
              <div className="text-center">
                <h3 className="text-emerald-400 font-medium mb-6">HEALTH SCORE</h3>
                <div className="relative inline-block mb-6">
                  <div className="w-32 h-32 mx-auto relative">
                    <svg className="w-32 h-32 transform -rotate-90" viewBox="0 0 120 120">
                      <circle
                        cx="60"
                        cy="60"
                        r="48"
                        fill="none"
                        stroke="rgb(30 41 59)"
                        strokeWidth="8"
                      />
                      <circle
                        cx="60"
                        cy="60"
                        r="48"
                        fill="none"
                        stroke="rgb(16 185 129)"
                        strokeWidth="8"
                        strokeDasharray={`${(mockReportData.overallScore * 301.6) / 100} 301.6`}
                        strokeLinecap="round"
                        className="transition-all duration-1000"
                      />
                    </svg>
                    <div className="absolute inset-0 flex flex-col items-center justify-center">
                      <div className="text-3xl font-bold text-white">{mockReportData.overallScore}</div>
                      <div className="text-xs text-emerald-400 font-medium">Strong</div>
                    </div>
                  </div>
                </div>
                
                <div className="space-y-3 text-sm">
                  <div className="flex justify-between items-center">
                    <div className="flex items-center gap-2">
                      <div className="w-2 h-2 bg-emerald-400 rounded-full"></div>
                      <span className="text-slate-300">Your website</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="font-semibold text-white">{mockReportData.overallScore}</span>
                      <span className="text-emerald-400">▲ 4</span>
                    </div>
                  </div>
                  <div className="flex justify-between items-center">
                    <div className="flex items-center gap-2">
                      <div className="w-2 h-2 bg-emerald-400 rounded-full"></div>
                      <span className="text-slate-300">Recommended</span>
                    </div>
                    <span className="font-semibold text-white">90+</span>
                  </div>
                </div>
                
                {/* History Chart */}
                <div className="mt-6">
                  <div className="text-xs text-emerald-400 mb-2">HISTORY</div>
                  <div className="h-12 flex items-end gap-1 justify-center">
                    {[65, 68, 70, 71, 69, 73, 73, 75, 73].map((height, index) => (
                      <div
                        key={index}
                        className="w-2 bg-emerald-400/60 rounded-sm transition-all duration-300 hover:bg-emerald-400"
                        style={{ height: `${height / 2}px` }}
                      />
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </motion.div>

          {/* Issues by Type */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
          >
            <div className="bg-slate-800 border border-slate-700 rounded-lg p-6">
              <div className="text-center">
                <h3 className="text-emerald-400 font-medium mb-6">ISSUES BY TYPE</h3>
                <div className="mb-6">
                  <div className="text-3xl font-bold text-emerald-400 mb-1">{mockReportData.totalIssues.toLocaleString()}</div>
                  <div className="text-sm text-slate-400">Issues</div>
                </div>

                {/* Progress Bar */}
                <div className="flex h-2 bg-slate-700 rounded-full overflow-hidden mb-6">
                  <div className="bg-red-500 flex-shrink-0" style={{ width: '10%' }}></div>
                  <div className="bg-orange-500 flex-shrink-0" style={{ width: '25%' }}></div>
                  <div className="bg-blue-500 flex-shrink-0" style={{ width: '65%' }}></div>
                </div>

                {/* Issue Stats */}
                <div className="space-y-3 text-sm">
                  <div className="flex justify-between items-center">
                    <div className="flex items-center gap-2">
                      <div className="w-2 h-2 bg-red-500 rounded-full"></div>
                      <span className="text-slate-300">Errors</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="font-semibold text-red-400">{mockReportData.issueStats.errors}</span>
                      <span className="text-emerald-400">▼ 12</span>
                    </div>
                  </div>
                  <div className="flex justify-between items-center">
                    <div className="flex items-center gap-2">
                      <div className="w-2 h-2 bg-orange-500 rounded-full"></div>
                      <span className="text-slate-300">Warnings</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="font-semibold text-orange-400">{mockReportData.issueStats.warnings}</span>
                      <span className="text-emerald-400">▼ 45</span>
                    </div>
                  </div>
                  <div className="flex justify-between items-center">
                    <div className="flex items-center gap-2">
                      <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                      <span className="text-slate-300">Notices</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="font-semibold text-blue-400">{mockReportData.issueStats.notices}</span>
                      <span className="text-emerald-400">▼ 156</span>
                    </div>
                  </div>
                </div>

                <div className="mt-6">
                  <button className="text-emerald-400 text-sm hover:text-emerald-300 transition-colors">
                    View all issues
                  </button>
                </div>
              </div>
            </div>
          </motion.div>

          {/* Page Health Ratio */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.3 }}
          >
            <div className="bg-slate-800 border border-slate-700 rounded-lg p-6">
              <div className="text-center">
                <h3 className="text-emerald-400 font-medium mb-6">PAGE HEALTH RATIO</h3>
                <div className="mb-6">
                  <div className="text-3xl font-bold text-emerald-400 mb-1">{mockReportData.pageHealth.healthy + mockReportData.pageHealth.hasIssues}</div>
                  <div className="text-sm text-slate-400">Pages</div>
                </div>

                {/* Health Progress Bar */}
                <div className="flex h-2 bg-slate-700 rounded-full overflow-hidden mb-6">
                  <div className="bg-orange-500 flex-shrink-0" style={{ width: '70%' }}></div>
                  <div className="bg-emerald-500 flex-shrink-0" style={{ width: '30%' }}></div>
                </div>

                {/* Page Health Stats */}
                <div className="space-y-3 text-sm">
                  <div className="flex justify-between items-center">
                    <div className="flex items-center gap-2">
                      <div className="w-2 h-2 bg-orange-500 rounded-full"></div>
                      <span className="text-slate-300">Have errors and warnings</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="font-semibold text-orange-400">{mockReportData.pageHealth.hasIssues}</span>
                      <span className="text-emerald-400">▼ 3</span>
                    </div>
                  </div>
                  <div className="flex justify-between items-center">
                    <div className="flex items-center gap-2">
                      <div className="w-2 h-2 bg-emerald-500 rounded-full"></div>
                      <span className="text-slate-300">Healthy</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="font-semibold text-emerald-400">{mockReportData.pageHealth.healthy}</span>
                      <span className="text-red-400">▲ 2</span>
                    </div>
                  </div>
                </div>

                <div className="mt-6">
                  <button className="text-emerald-400 text-sm hover:text-emerald-300 transition-colors">
                    View issues by pages
                  </button>
                </div>
              </div>
            </div>
          </motion.div>
        </div>

        {/* Bottom Section */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Most Popular Use Cases */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.4 }}
          >
            <div className="bg-slate-800 border border-slate-700 rounded-lg p-6">
              <h3 className="text-emerald-400 font-medium mb-6">MOST POPULAR USE CASES</h3>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-slate-700">
                      <th className="text-left py-3 font-medium text-emerald-400">Use case</th>
                      <th className="text-right py-3 font-medium text-emerald-400">Quantity</th>
                      <th className="text-right py-3 font-medium text-emerald-400">Action</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr className="border-b border-slate-700/50">
                      <td className="py-4 text-slate-300">View uncrawled pages</td>
                      <td className="text-right py-4">
                        <span className="text-blue-400 font-semibold">398</span>
                        <span className="text-emerald-400 ml-1">▼ 2,276</span>
                      </td>
                      <td className="text-right py-4">
                        <button className="text-emerald-400 hover:text-emerald-300 transition-colors flex items-center gap-1">
                          <Download className="h-4 w-4" />
                          Export
                        </button>
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>
          </motion.div>

          {/* Top Issues */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.5 }}
          >
            <div className="bg-slate-800 border border-slate-700 rounded-lg p-6">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-emerald-400 font-medium">TOP ISSUES</h3>
                <button className="text-emerald-400 text-sm hover:text-emerald-300 transition-colors">
                  View all (6,623)
                </button>
              </div>
              <div className="space-y-4">
                {sortedIssues.map((issue, index) => (
                  <motion.div
                    key={issue.id}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.4, delay: 0.6 + index * 0.1 }}
                    className="flex items-center justify-between p-3 bg-slate-700/50 rounded-lg border border-slate-600/50"
                  >
                    <div className="flex items-center gap-3">
                      <div className={`w-6 h-6 rounded-full flex items-center justify-center ${
                        issue.severity === 'high' ? 'bg-red-500/20' : 
                        issue.severity === 'medium' ? 'bg-orange-500/20' :
                        'bg-blue-500/20'
                      }`}>
                        {issue.severity === 'high' ? (
                          <div className="w-2 h-2 bg-red-500 rounded-full"></div>
                        ) : issue.severity === 'medium' ? (
                          <AlertTriangle className="h-4 w-4 text-orange-500" />
                        ) : (
                          <Info className="h-4 w-4 text-blue-500" />
                        )}
                      </div>
                      <div>
                        <div className="font-medium text-slate-200">{issue.title}</div>
                        <div className="text-xs text-slate-400">{issue.category}</div>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="font-semibold text-slate-200">
                        {issue.severity === 'high' ? '177' : 
                         issue.severity === 'medium' ? '14' : '8'}
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>
            </div>
          </motion.div>
        </div>

        <Footer />
      </div>
    </div>
  )
}