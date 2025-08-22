import { useState } from "react"
import { motion } from "framer-motion"
import { 
  Shield, 
  Gauge, 
  Eye, 
  Search, 
  Download, 
  Bot, 
  TrendingUp, 
  Users,
  Calendar,
  Clock,
  BarChart3,
  Globe,
  RefreshCw,
  AlertTriangle,
  Info,
  XCircle,
  CheckCircle,
  ArrowRight,
  Filter,
  Settings,
  Share2
} from "lucide-react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion"
import { Progress } from "@/components/ui/progress"
import { ScoreCircle } from "@/components/score-circle"
import { ReportCard, ReportIssue } from "@/components/report-card"
import { Navigation } from "@/components/navigation"
import { Footer } from "@/components/footer"
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, ResponsiveContainer, PieChart, Pie, Cell } from "recharts"
import { generatePdf } from "@/lib/pdf-generator"

// Extended mock data for deep scan
const mockDeepScanData = {
  overallScore: 68,
  scanUrl: "example.com", 
  scanTime: "2024-01-15 14:35:12",
  lastUpdate: "March 1, 2025",
  scheduledUpdate: "Recheck manually", 
  pagesCrawled: "1000/1000",
  totalIssues: 19433,
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
  },
  issueStats: {
    errors: 129,
    warnings: 3248, 
    notices: 15966
  },
  pageHealth: {
    healthy: 538,
    hasIssues: 2617
  },
  trendsData: [
    { date: '2024-01', score: 62 },
    { date: '2024-02', score: 65 },
    { date: '2024-03', score: 67 },
    { date: '2024-04', score: 66 },
    { date: '2024-05', score: 68 },
    { date: '2024-06', score: 68 }
  ]
}

const categoryIcons = {
  security: Shield,
  performance: Gauge,
  seo: Search,
  accessibility: Eye
}

const severityChartData = [
  { name: "High", count: 8, fill: "hsl(var(--destructive))" },
  { name: "Medium", count: 15, fill: "hsl(var(--warning))" },
  { name: "Low", count: 6, fill: "hsl(var(--severity-low))" },
  { name: "Info", count: 3, fill: "hsl(var(--severity-info))" }
]

const pieChartColors = ['#ef4444', '#f97316', '#3b82f6', '#6b7280']

export default function DeepScanReport() {
  const [activeTab, setActiveTab] = useState("overview")
  
  // Flatten all issues by category for different tabs
  const allIssues: ReportIssue[] = []
  Object.values(mockDeepScanData.categories).forEach(category => {
    allIssues.push(...category.issues)
  })
    
  const technicalIssues = allIssues.filter(issue => issue.technicalFix)
  const nonTechnicalIssues = allIssues.filter(issue => issue.nonTechnicalFix)
  const topIssues = allIssues.slice(0, 6) // Top 6 issues

  const handleExport = () => {
    generatePdf(mockDeepScanData);
  };

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
                <h1 className="text-3xl font-bold text-emerald-400">Deep Analysis / {mockDeepScanData.scanUrl}</h1>
                <div className="flex items-center gap-6 text-sm text-slate-400 mt-1">
                  <span className="flex items-center gap-1">
                    Last update {mockDeepScanData.lastUpdate}
                  </span>
                  <span className="flex items-center gap-1">
                    Scheduled update {mockDeepScanData.scheduledUpdate}
                  </span>
                  <span className="flex items-center gap-1">
                    Pages crawled {mockDeepScanData.pagesCrawled}
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
                <Settings className="h-4 w-4" />
                SETTINGS
              </Button>
              <Button 
                onClick={handleExport}
                className="bg-slate-700 hover:bg-slate-600 text-emerald-400 px-4 py-2 rounded-md flex items-center gap-2"
              >
                <Download className="h-4 w-4" />
                EXPORT
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
                        strokeDasharray={`${(mockDeepScanData.overallScore * 301.6) / 100} 301.6`}
                        strokeLinecap="round"
                        className="transition-all duration-1000"
                      />
                    </svg>
                    <div className="absolute inset-0 flex flex-col items-center justify-center">
                      <div className="text-3xl font-bold text-white">{mockDeepScanData.overallScore}</div>
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
                      <span className="font-semibold text-white">{mockDeepScanData.overallScore}</span>
                      <span className="text-emerald-400">▲ 2</span>
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
                    {mockDeepScanData.trendsData.map((data, index) => (
                      <div
                        key={index}
                        className="w-2 bg-emerald-400/60 rounded-sm transition-all duration-300 hover:bg-emerald-400"
                        style={{ height: `${data.score / 2}px` }}
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
                  <div className="text-3xl font-bold text-emerald-400 mb-1">{mockDeepScanData.totalIssues.toLocaleString()}</div>
                  <div className="text-sm text-slate-400">Issues</div>
                </div>

                {/* Progress Bar */}
                <div className="flex h-2 bg-slate-700 rounded-full overflow-hidden mb-6">
                  <div className="bg-red-500 flex-shrink-0" style={{ width: '8%' }}></div>
                  <div className="bg-orange-500 flex-shrink-0" style={{ width: '20%' }}></div>
                  <div className="bg-blue-500 flex-shrink-0" style={{ width: '72%' }}></div>
                </div>

                {/* Issue Stats */}
                <div className="space-y-3 text-sm">
                  <div className="flex justify-between items-center">
                    <div className="flex items-center gap-2">
                      <div className="w-2 h-2 bg-red-500 rounded-full"></div>
                      <span className="text-slate-300">Errors</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="font-semibold text-red-400">{mockDeepScanData.issueStats.errors}</span>
                      <span className="text-emerald-400">▼ 1,929</span>
                    </div>
                  </div>
                  <div className="flex justify-between items-center">
                    <div className="flex items-center gap-2">
                      <div className="w-2 h-2 bg-orange-500 rounded-full"></div>
                      <span className="text-slate-300">Warnings</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="font-semibold text-orange-400">{mockDeepScanData.issueStats.warnings}</span>
                      <span className="text-emerald-400">▼ 4,246</span>
                    </div>
                  </div>
                  <div className="flex justify-between items-center">
                    <div className="flex items-center gap-2">
                      <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                      <span className="text-slate-300">Notices</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="font-semibold text-blue-400">{mockDeepScanData.issueStats.notices}</span>
                      <span className="text-emerald-400">▼ 6,559</span>
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
                  <div className="text-3xl font-bold text-emerald-400 mb-1">{(mockDeepScanData.pageHealth.healthy + mockDeepScanData.pageHealth.hasIssues).toLocaleString()}</div>
                  <div className="text-sm text-slate-400">Pages</div>
                </div>

                {/* Health Progress Bar */}
                <div className="flex h-2 bg-slate-700 rounded-full overflow-hidden mb-6">
                  <div className="bg-orange-500 flex-shrink-0" style={{ width: '83%' }}></div>
                  <div className="bg-emerald-500 flex-shrink-0" style={{ width: '17%' }}></div>
                </div>

                {/* Page Health Stats */}
                <div className="space-y-3 text-sm">
                  <div className="flex justify-between items-center">
                    <div className="flex items-center gap-2">
                      <div className="w-2 h-2 bg-orange-500 rounded-full"></div>
                      <span className="text-slate-300">Have errors and warnings</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="font-semibold text-orange-400">{mockDeepScanData.pageHealth.hasIssues.toLocaleString()}</span>
                      <span className="text-emerald-400">▼ 2,127</span>
                    </div>
                  </div>
                  <div className="flex justify-between items-center">
                    <div className="flex items-center gap-2">
                      <div className="w-2 h-2 bg-emerald-500 rounded-full"></div>
                      <span className="text-slate-300">Healthy</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="font-semibold text-emerald-400">{mockDeepScanData.pageHealth.healthy}</span>
                      <span className="text-red-400">▲ 1,805</span>
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

        {/* Detailed Analysis Section */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.4 }}
        >
          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
            <div className="flex items-center justify-between mb-6">
              <TabsList className="bg-slate-800 border border-slate-700 rounded-lg p-1">
                <TabsTrigger 
                  value="overview" 
                  className="flex items-center gap-2 data-[state=active]:bg-slate-700 data-[state=active]:text-emerald-400 text-slate-400 hover:text-slate-300"
                >
                  <BarChart3 className="h-4 w-4" />
                  Overview
                </TabsTrigger>
                <TabsTrigger 
                  value="categories" 
                  className="flex items-center gap-2 data-[state=active]:bg-slate-700 data-[state=active]:text-emerald-400 text-slate-400 hover:text-slate-300"
                >
                  <Filter className="h-4 w-4" />
                  By Category
                </TabsTrigger>
                <TabsTrigger 
                  value="technical" 
                  className="flex items-center gap-2 data-[state=active]:bg-slate-700 data-[state=active]:text-emerald-400 text-slate-400 hover:text-slate-300"
                >
                  <Bot className="h-4 w-4" />
                  Technical Fixes
                </TabsTrigger>
                <TabsTrigger 
                  value="insights" 
                  className="flex items-center gap-2 data-[state=active]:bg-slate-700 data-[state=active]:text-emerald-400 text-slate-400 hover:text-slate-300"
                >
                  <TrendingUp className="h-4 w-4" />
                  Business Impact
                </TabsTrigger>
              </TabsList>

              <div className="flex items-center gap-2">
                <Button className="bg-slate-700 hover:bg-slate-600 text-emerald-400 px-4 py-2 rounded-md flex items-center gap-2 text-sm">
                  <Download className="h-4 w-4" />
                  Export Report
                </Button>
                <Button className="bg-slate-700 hover:bg-slate-600 text-emerald-400 px-4 py-2 rounded-md flex items-center gap-2 text-sm">
                  <Share2 className="h-4 w-4" />
                  Share
                </Button>
              </div>
            </div>

            <TabsContent value="overview" className="space-y-6">
              {/* Category Performance Grid */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                {Object.entries(mockDeepScanData.categories).map(([key, category], index) => {
                  const Icon = categoryIcons[key as keyof typeof categoryIcons]
                  
                  return (
                    <motion.div
                      key={key}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.1 + index * 0.1 }}
                    >
                      <div className="bg-slate-800 border border-slate-700 rounded-lg p-6 text-center hover:border-slate-600 transition-all duration-300">
                        <div className="w-12 h-12 bg-emerald-500 rounded-xl flex items-center justify-center mx-auto mb-3">
                          <Icon className="h-6 w-6 text-white" />
                        </div>
                        <h3 className="capitalize text-lg font-medium text-emerald-400 mb-2">{key}</h3>
                        <p className="text-sm text-slate-400 mb-4">{category.issues.length} issues found</p>
                        <div className="relative inline-block">
                          <div className="w-16 h-16 mx-auto relative">
                            <svg className="w-16 h-16 transform -rotate-90" viewBox="0 0 60 60">
                              <circle
                                cx="30"
                                cy="30"
                                r="24"
                                fill="none"
                                stroke="rgb(30 41 59)"
                                strokeWidth="4"
                              />
                              <circle
                                cx="30"
                                cy="30"
                                r="24"
                                fill="none"
                                stroke="rgb(16 185 129)"
                                strokeWidth="4"
                                strokeDasharray={`${(category.score * 150.8) / 100} 150.8`}
                                strokeLinecap="round"
                                className="transition-all duration-1000"
                              />
                            </svg>
                            <div className="absolute inset-0 flex items-center justify-center">
                              <div className="text-sm font-bold text-white">{category.score}</div>
                            </div>
                          </div>
                        </div>
                      </div>
                    </motion.div>
                  )
                })}
              </div>

              {/* Charts Section */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {/* Issues Distribution Chart */}
                <div className="bg-slate-800 border border-slate-700 rounded-lg p-6">
                  <h3 className="text-emerald-400 font-medium mb-4 flex items-center gap-2">
                    <BarChart3 className="h-5 w-5" />
                    Issue Distribution by Severity
                  </h3>
                  <div className="h-64">
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={severityChartData}>
                        <CartesianGrid strokeDasharray="3 3" stroke="rgb(51 65 85)" opacity={0.3} />
                        <XAxis dataKey="name" tick={{ fontSize: 12, fill: 'rgb(148 163 184)' }} />
                        <YAxis tick={{ fontSize: 12, fill: 'rgb(148 163 184)' }} />
                        <Bar dataKey="count" fill="rgb(16 185 129)" radius={[4, 4, 0, 0]} />
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                </div>

                {/* Top Issues */}
                <div className="bg-slate-800 border border-slate-700 rounded-lg p-6">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-emerald-400 font-medium flex items-center gap-2">
                      <AlertTriangle className="h-5 w-5" />
                      Critical Issues
                    </h3>
                    <button className="text-emerald-400 text-sm hover:text-emerald-300 transition-colors">
                      View all issues
                    </button>
                  </div>
                  <div className="space-y-3">
                    {topIssues.map((issue, index) => (
                      <div key={issue.id} className="flex items-center justify-between p-3 bg-slate-700/50 rounded-lg border border-slate-600/50">
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
                          <div className="min-w-0">
                            <div className="font-medium text-slate-200 truncate">{issue.title}</div>
                            <div className="text-xs text-slate-400">{issue.category}</div>
                          </div>
                        </div>
                        <div className="text-sm font-semibold text-slate-200">
                          {issue.severity === 'high' ? '47' : issue.severity === 'medium' ? '23' : '12'}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </TabsContent>

            {/* ...existing code for other tabs... */}
          </Tabs>
        </motion.div>

        <Footer />
      </div>
    </div>
  )
}