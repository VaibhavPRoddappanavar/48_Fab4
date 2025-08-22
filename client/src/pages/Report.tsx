import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { Navigation } from "@/components/navigation";
import { Footer } from "@/components/footer";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import { 
  Shield, 
  AlertTriangle, 
  CheckCircle, 
  Globe, 
  Zap, 
  Eye, 
  Bot, 
  Download,
  Clock,
  Target,
  TrendingUp,
  Activity,
  Code,
  ExternalLink,
  ChevronRight,
  ChevronDown,
  Star,
  Award,
  BookOpen,
  Video,
  FileText,
  AlertCircle,
  Info,
  Lock,
  Server,
  Database,
  Smartphone,
  Search,
  Settings,
  BarChart3,
  PieChart,
  Gauge
} from "lucide-react";
import { Button } from "@/components/ui/button";

// Enhanced Score Circle Component with better animations
const ScoreCircle = ({ score, label, size = "lg" }) => {
  const radius = size === "lg" ? 60 : size === "md" ? 45 : 35;
  const strokeWidth = size === "lg" ? 8 : size === "md" ? 6 : 4;
  const normalizedRadius = radius - strokeWidth * 2;
  const circumference = normalizedRadius * 2 * Math.PI;
  const strokeDasharray = `${circumference} ${circumference}`;
  const strokeDashoffset = circumference - (score / 100) * circumference;

  const getScoreColor = (score) => {
    if (score >= 90) return "#10b981"; // green-500
    if (score >= 70) return "#f59e0b"; // yellow-500
    if (score >= 50) return "#f97316"; // orange-500
    return "#ef4444"; // red-500
  };

  const getScoreGlow = (score) => {
    if (score >= 90) return "drop-shadow-[0_0_20px_rgba(16,185,129,0.5)]";
    if (score >= 70) return "drop-shadow-[0_0_20px_rgba(245,158,11,0.5)]";
    if (score >= 50) return "drop-shadow-[0_0_20px_rgba(249,115,22,0.5)]";
    return "drop-shadow-[0_0_20px_rgba(239,68,68,0.5)]";
  };

  return (
    <div className="relative">
      <svg
        height={radius * 2}
        width={radius * 2}
        className={`transform -rotate-90 ${getScoreGlow(score)}`}
      >
        {/* Background circle */}
        <circle
          stroke="rgb(71 85 105 / 0.2)"
          fill="transparent"
          strokeWidth={strokeWidth}
          r={normalizedRadius}
          cx={radius}
          cy={radius}
        />
        {/* Progress circle with glow */}
        <motion.circle
          stroke={getScoreColor(score)}
          fill="transparent"
          strokeWidth={strokeWidth}
          strokeLinecap="round"
          r={normalizedRadius}
          cx={radius}
          cy={radius}
          style={{
            strokeDasharray,
            filter: `drop-shadow(0 0 8px ${getScoreColor(score)})`,
          }}
          initial={{ strokeDashoffset: circumference }}
          animate={{ strokeDashoffset }}
          transition={{ duration: 2, ease: "easeInOut", delay: 0.5 }}
        />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <motion.span 
          className={`text-2xl font-bold text-white ${size === "lg" ? "text-3xl" : "text-xl"}`}
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ duration: 0.5, delay: 1 }}
          style={{ textShadow: `0 0 10px ${getScoreColor(score)}` }}
        >
          {score}
        </motion.span>
        <span className="text-xs text-slate-400">{label}</span>
      </div>
    </div>
  );
};

// Animated Progress Bar Component
const AnimatedProgressBar = ({ value, max, label, color = "primary" }) => {
  const percentage = (value / max) * 100;
  
  const colorClasses = {
    primary: "bg-primary",
    red: "bg-red-500",
    orange: "bg-orange-500", 
    yellow: "bg-yellow-500",
    green: "bg-green-500",
    blue: "bg-blue-500"
  };

  return (
    <div className="space-y-2">
      <div className="flex justify-between items-center">
        <span className="text-sm font-medium text-slate-300">{label}</span>
        <span className="text-sm text-slate-400">{value}/{max}</span>
      </div>
      <div className="w-full bg-slate-800 rounded-full h-2 overflow-hidden">
        <motion.div
          className={`h-full ${colorClasses[color]} shadow-lg`}
          style={{ 
            boxShadow: `0 0 10px ${color === 'primary' ? '#10b981' : 
                       color === 'red' ? '#ef4444' :
                       color === 'orange' ? '#f97316' :
                       color === 'yellow' ? '#f59e0b' :
                       color === 'green' ? '#10b981' : '#3b82f6'}`
          }}
          initial={{ width: 0 }}
          animate={{ width: `${percentage}%` }}
          transition={{ duration: 1.5, delay: 0.5, ease: "easeOut" }}
        />
      </div>
    </div>
  );
};

function Report() {
  const { auditId } = useParams();
  const [auditData, setAuditData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [expandedSections, setExpandedSections] = useState({
    security: true,
    performance: false,
    accessibility: false,
    seo: false,
    bestPractices: false
  });

  useEffect(() => {
    const fetchResults = async () => {
      try {
        const response = await fetch(`http://localhost:5000/api/audit/${auditId}/results`);
        
        if (!response.ok) {
          throw new Error("Failed to fetch audit results");
        }

        const data = await response.json();
        
        if (data.success) {
          setAuditData(data);
        } else {
          setError(data.message || "Failed to load audit results");
        }
        
        setLoading(false);
      } catch (err) {
        setError(err.message);
        setLoading(false);
      }
    };

    if (auditId) {
      fetchResults();
    }
  }, [auditId]);

  const getSeverityColor = (severity) => {
    switch (severity?.toLowerCase()) {
      case 'critical': return 'bg-red-500';
      case 'high': return 'bg-orange-500';
      case 'medium': return 'bg-yellow-500';
      case 'low': return 'bg-blue-500';
      default: return 'bg-gray-500';
    }
  };

  const toggleSection = (section) => {
    setExpandedSections(prev => ({
      ...prev,
      [section]: !prev[section]
    }));
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background text-foreground flex flex-col">
        <Navigation />
        <div className="flex-1 flex items-center justify-center">
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center"
          >
            <div className="relative mb-8">
              <div className="w-32 h-32 rounded-full border-4 border-slate-700 border-t-primary animate-spin mx-auto"></div>
              <div className="absolute inset-0 flex items-center justify-center">
                <Shield className="h-8 w-8 text-primary" />
              </div>
            </div>
            <motion.h1 
              className="text-3xl font-bold mb-4 bg-gradient-to-r from-primary to-primary-variant bg-clip-text text-transparent"
              animate={{ opacity: [0.5, 1, 0.5] }}
              transition={{ duration: 2, repeat: Infinity }}
            >
              Analyzing Report...
            </motion.h1>
            <Progress value={50} className="w-64 mx-auto" />
          </motion.div>
        </div>
        <Footer />
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-background text-foreground flex flex-col">
        <Navigation />
        <div className="flex-1 flex items-center justify-center">
          <motion.div 
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="text-center"
          >
            <div className="relative mb-6">
              <div className="w-24 h-24 bg-red-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
                <AlertTriangle className="h-12 w-12 text-red-500" />
              </div>
            </div>
            <h1 className="text-3xl font-bold mb-4 text-red-500">Report Not Found</h1>
            <p className="text-lg text-slate-400 mb-6">{error}</p>
            <Button onClick={() => window.location.href = '/scan'} className="bg-primary hover:bg-primary/90">
              Start New Scan
            </Button>
          </motion.div>
        </div>
        <Footer />
      </div>
    );
  }

  if (!auditData || !auditData.results) {
    return (
      <div className="min-h-screen bg-background text-foreground flex flex-col">
        <Navigation />
        <div className="flex-1 flex items-center justify-center">
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-center"
          >
            <Globe className="h-16 w-16 text-slate-500 mx-auto mb-4" />
            <h1 className="text-3xl font-bold mb-4">No Report Data</h1>
            <p className="text-lg text-slate-400">Unable to load audit results.</p>
          </motion.div>
        </div>
        <Footer />
      </div>
    );
  }

  const { results, summary, metadata } = auditData;
  const { securityFindings = [], healthCheck = {} } = results;
  
  // Extract all data properly from the JSON
  const performanceData = healthCheck?.metrics?.performance || {};
  const accessibilityData = healthCheck?.metrics?.accessibility || {};
  const seoData = healthCheck?.metrics?.seo || {};
  const bestPracticesData = healthCheck?.metrics?.bestPractices || {};
  const pwaData = healthCheck?.metrics?.pwa || {};
  const issueBreakdown = healthCheck?.issueBreakdown || {};
  
  // Additional data not yet displayed
  const crawlerResults = results?.crawlerResults || auditData?.crawlerResults || {};
  const securityFingerprints = results?.securityFingerprints || auditData?.securityFingerprints || [];
  const executionTime = auditData?.executionTime;
  const reportGenerated = auditData?.reportGenerated;

  return (
    <div className="min-h-screen bg-background text-foreground">
      <Navigation />
      
      <div className="pt-24 pb-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          
          {/* Header Section with Download Button */}
          <motion.div
            initial={{ opacity: 0, y: -30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="text-center mb-16 relative"
          >
            {/* Download Button - Top Right - Updated for PDF */}
            <div className="absolute top-0 right-0">
              <Button 
                size="lg"
                onClick={() => window.open(`http://localhost:5000/api/audit/${auditId}/download-pdf`, '_blank')}
                className="bg-gradient-to-r from-primary to-primary-variant hover:from-primary/90 hover:to-primary-variant/90 text-white font-semibold px-6 py-3 transition-all duration-300 transform hover:scale-105 shadow-lg hover:shadow-xl"
              >
                <Download className="h-5 w-5 mr-2" />
                Download Report PDF
              </Button>
            </div>

            <div className="relative inline-block mb-6">
              <h1 className="text-5xl lg:text-6xl font-bold bg-gradient-to-r from-primary via-primary-variant to-primary bg-clip-text text-transparent">
                Security Audit Report
              </h1>
              
            </div>
            
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.3, duration: 0.6 }}
              className="max-w-4xl mx-auto"
            >
              <p className="text-xl text-slate-300 mb-6">
                Comprehensive security analysis for{" "}
                <span className="font-semibold text-white bg-primary/20 px-3 py-1 rounded-lg border border-primary/30">
                  {metadata?.url}
                </span>
              </p>
              
              <div className="flex items-center justify-center gap-8 text-sm text-slate-400 flex-wrap">
                <div className="flex items-center gap-2">
                  <Target className="h-4 w-4 text-primary" />
                  <span>Scan: {metadata?.scanType}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Clock className="h-4 w-4 text-primary" />
                  <span>Duration: {metadata?.duration}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Activity className="h-4 w-4 text-primary" />
                  <span>Completed: {new Date(metadata?.endTime).toLocaleString()}</span>
                </div>
              </div>
            </motion.div>
          </motion.div>

          {/* Enhanced Main Score Dashboard */}
          <motion.div
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="mb-16"
          >
            <Card className="relative bg-gradient-to-br from-slate-900/95 via-slate-800/70 to-slate-900/95 border border-slate-700/60 backdrop-blur-xl overflow-hidden shadow-2xl">
              {/* Enhanced Background Effects */}
              <div className="absolute inset-0 bg-gradient-to-br from-primary/8 via-transparent to-primary-variant/8" />
              <div className="absolute -top-40 -right-40 w-80 h-80 bg-gradient-to-br from-primary/15 to-transparent rounded-full blur-3xl animate-pulse" />
              <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-gradient-to-tr from-primary-variant/10 to-transparent rounded-full blur-3xl" />
              
              <CardHeader className="relative pb-8">
                <CardTitle className="flex items-center gap-4 text-3xl">
                  <div className="w-12 h-12 bg-gradient-to-r from-primary to-primary-variant rounded-xl flex items-center justify-center shadow-lg">
                    <Shield className="h-7 w-7 text-white" />
                  </div>
                  <span className="bg-gradient-to-r from-white to-slate-200 bg-clip-text text-transparent">
                    Overall Security Assessment
                  </span>
                </CardTitle>
              </CardHeader>
              
              <CardContent className="relative space-y-8">
                {/* Main Score Grid - Enhanced */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mb-8">
                  
                  {/* Overall Score - Enhanced */}
                  <motion.div 
                    initial={{ scale: 0, rotate: -180 }}
                    animate={{ scale: 1, rotate: 0 }}
                    transition={{ delay: 0.5, duration: 0.8, type: "spring" }}
                    className="text-center relative"
                  >
                    <div className="relative">
                      <div className="absolute -inset-4 bg-gradient-to-r from-primary/20 via-primary-variant/20 to-primary/20 rounded-full blur-xl animate-pulse" />
                      <ScoreCircle 
                        score={summary?.scores?.overall || 0} 
                        label="Overall" 
                        size="lg" 
                      />
                    </div>
                    <div className="mt-6 space-y-3">
                      <p className="text-sm font-medium text-slate-300">Overall Security Score</p>
                      <div className="flex items-center justify-center gap-2">
                        <Award className="h-5 w-5 text-primary animate-pulse" />
                        <Badge 
                          variant={summary?.riskLevel === 'CRITICAL' ? 'destructive' : 
                                 summary?.riskLevel === 'HIGH' ? 'default' : 'secondary'}
                          className="text-sm py-1 px-3 font-semibold shadow-lg"
                        >
                          {summary?.riskLevel || 'Unknown'} Risk
                        </Badge>
                      </div>
                    </div>
                  </motion.div>

                  {/* Security & Health Scores */}
                  <motion.div 
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ delay: 0.7, duration: 0.6 }}
                    className="space-y-6"
                  >
                    <div className="text-center">
                      <ScoreCircle 
                        score={summary?.scores?.security || 0} 
                        label="Security" 
                        size="md" 
                      />
                      <div className="mt-4 space-y-2">
                        <p className="text-sm text-slate-400">Security Analysis</p>
                        <div className="flex items-center justify-center gap-2">
                          <Lock className="h-4 w-4 text-red-400" />
                          <span className="text-sm font-medium text-red-300">
                            {summary?.stats?.totalFindings || 0} Issues Found
                          </span>
                        </div>
                      </div>
                    </div>
                    
                    <div className="text-center">
                      <ScoreCircle 
                        score={summary?.scores?.health || 0} 
                        label="Health" 
                        size="md" 
                      />
                      <div className="mt-4 space-y-2">
                        <p className="text-sm text-slate-400">Website Health</p>
                        <div className="flex items-center justify-center gap-2">
                          <TrendingUp className="h-4 w-4 text-green-400" />
                          <span className="text-sm font-medium text-green-300">
                            Performance & Quality
                          </span>
                        </div>
                      </div>
                    </div>
                  </motion.div>

                  {/* Enhanced Stats Dashboard */}
                  <motion.div
                    initial={{ opacity: 0, x: 30 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 1.0, duration: 0.6 }}
                    className="space-y-6"
                  >
                    {/* Stats Cards */}
                    <div className="bg-gradient-to-br from-slate-800/60 to-slate-900/60 rounded-2xl p-6 border border-slate-700/40 backdrop-blur-sm shadow-xl">
                      <div className="flex items-center gap-3 mb-4">
                        <div className="w-8 h-8 bg-gradient-to-r from-blue-500 to-cyan-500 rounded-lg flex items-center justify-center">
                          <BarChart3 className="h-5 w-5 text-white" />
                        </div>
                        <h4 className="font-semibold text-white">Scan Statistics</h4>
                      </div>
                      
                      <div className="space-y-4">
                        <AnimatedProgressBar 
                          value={summary?.stats?.pagesScanned || 0}
                          max={Math.max(summary?.stats?.pagesScanned || 1, 10)}
                          label="Pages Scanned"
                          color="blue"
                        />
                        <AnimatedProgressBar 
                          value={summary?.stats?.endpointsFound || 0}
                          max={Math.max(summary?.stats?.endpointsFound || 1, 20)}
                          label="API Endpoints"
                          color="green"
                        />
                        <AnimatedProgressBar 
                          value={summary?.stats?.criticalIssues || 0}
                          max={Math.max(summary?.stats?.criticalIssues || 1, 5)}
                          label="Critical Issues"
                          color="red"
                        />
                      </div>
                    </div>

                    {/* Risk Level Indicator */}
                    <div className="bg-gradient-to-br from-slate-800/60 to-slate-900/60 rounded-2xl p-6 border border-slate-700/40 backdrop-blur-sm shadow-xl">
                      <div className="flex items-center gap-3 mb-4">
                        <div className="w-8 h-8 bg-gradient-to-r from-purple-500 to-pink-500 rounded-lg flex items-center justify-center">
                          <Gauge className="h-5 w-5 text-white" />
                        </div>
                        <h4 className="font-semibold text-white">Risk Assessment</h4>
                      </div>
                      
                      <div className="text-center space-y-3">
                        <div className="text-3xl font-bold bg-gradient-to-r from-primary to-primary-variant bg-clip-text text-transparent">
                          {summary?.riskLevel || 'UNKNOWN'}
                        </div>
                        <p className="text-sm text-slate-400">Security Risk Level</p>
                        
                        {/* Risk Level Visualization */}
                        <div className="flex items-center justify-between mt-4 px-2">
                          <div className={`w-3 h-3 rounded-full ${summary?.riskLevel === 'LOW' ? 'bg-green-500 shadow-lg shadow-green-500/50' : 'bg-slate-600'}`} />
                          <div className={`w-3 h-3 rounded-full ${summary?.riskLevel === 'MEDIUM' ? 'bg-yellow-500 shadow-lg shadow-yellow-500/50' : 'bg-slate-600'}`} />
                          <div className={`w-3 h-3 rounded-full ${summary?.riskLevel === 'HIGH' ? 'bg-orange-500 shadow-lg shadow-orange-500/50' : 'bg-slate-600'}`} />
                          <div className={`w-3 h-3 rounded-full ${summary?.riskLevel === 'CRITICAL' ? 'bg-red-500 shadow-lg shadow-red-500/50' : 'bg-slate-600'}`} />
                        </div>
                        <div className="flex items-center justify-between text-xs text-slate-500 px-1">
                          <span>Low</span>
                          <span>Medium</span>
                          <span>High</span>
                          <span>Critical</span>
                        </div>
                      </div>
                    </div>
                  </motion.div>
                </div>

                {/* Additional Metrics Row */}
                <motion.div 
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 1.2, duration: 0.6 }}
                  className="grid grid-cols-2 md:grid-cols-4 gap-4"
                >
                  <div className="bg-slate-800/40 rounded-xl p-4 border border-slate-700/30 text-center">
                    <div className="text-2xl font-bold text-primary mb-1">{summary?.scores?.performance || 0}</div>
                    <div className="text-xs text-slate-400">Performance</div>
                  </div>
                  <div className="bg-slate-800/40 rounded-xl p-4 border border-slate-700/30 text-center">
                    <div className="text-2xl font-bold text-blue-400 mb-1">{summary?.scores?.accessibility || 0}</div>
                    <div className="text-xs text-slate-400">Accessibility</div>
                  </div>
                  <div className="bg-slate-800/40 rounded-xl p-4 border border-slate-700/30 text-center">
                    <div className="text-2xl font-bold text-green-400 mb-1">{summary?.scores?.seo || 0}</div>
                    <div className="text-xs text-slate-400">SEO Score</div>
                  </div>
                  <div className="bg-slate-800/40 rounded-xl p-4 border border-slate-700/30 text-center">
                    <div className="text-2xl font-bold text-purple-400 mb-1">{summary?.scores?.bestPractices || 0}</div>
                    <div className="text-xs text-slate-400">Best Practices</div>
                  </div>
                </motion.div>
              </CardContent>
            </Card>
          </motion.div>

          {/* Detailed Analysis Sections */}
          <div className="space-y-8">

            {/* Security Vulnerabilities Section - Collapsible */}
            <motion.div
              initial={{ opacity: 0, y: 40 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.4 }}
            >
              <Collapsible 
                open={expandedSections.security} 
                onOpenChange={() => toggleSection('security')}
              >
                <Card className="relative bg-gradient-to-br from-slate-900/90 via-slate-800/60 to-slate-900/90 border border-slate-700/50 backdrop-blur-xl overflow-hidden">
                  <div className="absolute inset-0 bg-gradient-to-br from-red-500/5 via-transparent to-orange-500/5" />
                  
                  <CollapsibleTrigger className="w-full">
                    <CardHeader className="relative">
                      <CardTitle className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 bg-gradient-to-r from-red-500 to-red-600 rounded-xl flex items-center justify-center">
                            <AlertTriangle className="h-6 w-6 text-white" />
                          </div>
                          Security Vulnerabilities
                          <Badge variant="outline" className="ml-2">
                            {securityFindings.length} Found
                          </Badge>
                        </div>
                        <ChevronDown className={`h-6 w-6 text-slate-400 transition-transform duration-200 ${expandedSections.security ? 'rotate-180' : ''}`} />
                      </CardTitle>
                    </CardHeader>
                  </CollapsibleTrigger>
                  
                  <CollapsibleContent>
                    <CardContent className="relative">
                      <AnimatePresence>
                        {securityFindings.length === 0 ? (
                          <motion.div
                            initial={{ opacity: 0, scale: 0.9 }}
                            animate={{ opacity: 1, scale: 1 }}
                            className="text-center py-12"
                          >
                            <div className="w-20 h-20 bg-green-500/20 rounded-full flex items-center justify-center mx-auto mb-6">
                              <CheckCircle className="h-10 w-10 text-green-500" />
                            </div>
                            <h3 className="text-2xl font-bold text-green-500 mb-2">All Clear!</h3>
                            <p className="text-slate-400 max-w-md mx-auto">
                              No security vulnerabilities detected in your website. Great job maintaining security best practices!
                            </p>
                          </motion.div>
                        ) : (
                          <div className="space-y-4">
                            <Accordion type="single" collapsible className="w-full space-y-4">
                              {securityFindings.map((finding, index) => (
                                <motion.div
                                  key={index}
                                  initial={{ opacity: 0, y: 20 }}
                                  animate={{ opacity: 1, y: 0 }}
                                  transition={{ delay: index * 0.1 }}
                                >
                                  <AccordionItem 
                                    value={`item-${index}`}
                                    className="bg-slate-800/50 border border-slate-700/50 rounded-xl px-6 py-2 backdrop-blur-sm hover:bg-slate-800/70 transition-all duration-300"
                                  >
                                    <AccordionTrigger className="text-left hover:no-underline">
                                      <div className="flex items-center justify-between w-full pr-4">
                                        <div className="flex items-center gap-4">
                                          <div className={`w-3 h-3 rounded-full ${getSeverityColor(finding.severity)} shadow-lg`}></div>
                                          <div>
                                            <h4 className="font-semibold text-white text-lg">
                                              {finding.attack?.toUpperCase() || finding.type || 'Security Issue'}
                                            </h4>
                                            <p className="text-sm text-slate-400 mt-1">
                                              {finding.route?.substring(0, 60)}...
                                            </p>
                                          </div>
                                        </div>
                                        <SeverityBadge severity={finding.severity} />
                                      </div>
                                    </AccordionTrigger>
                                    
                                    <AccordionContent className="pt-6 pb-4">
                                      <div className="space-y-6">
                                        
                                        {/* Vulnerability Details */}
                                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                                          <div className="space-y-4">
                                            <div className="bg-slate-900/50 rounded-lg p-4 border border-slate-700/30">
                                              <h5 className="font-semibold text-white mb-2 flex items-center gap-2">
                                                <Globe className="h-4 w-4 text-primary" />
                                                Affected Route
                                              </h5>
                                              <code className="text-sm text-slate-300 bg-slate-800 px-3 py-2 rounded block break-all">
                                                {finding.route}
                                              </code>
                                            </div>
                                            
                                            {finding.evidence && (
                                              <div className="bg-slate-900/50 rounded-lg p-4 border border-slate-700/30">
                                                <h5 className="font-semibold text-white mb-2 flex items-center gap-2">
                                                  <Eye className="h-4 w-4 text-primary" />
                                                  Evidence Found
                                                </h5>
                                                <p className="text-sm text-slate-300">{finding.evidence}</p>
                                              </div>
                                            )}
                                            
                                            {finding.payload && (
                                              <div className="bg-slate-900/50 rounded-lg p-4 border border-slate-700/30">
                                                <h5 className="font-semibold text-white mb-2 flex items-center gap-2">
                                                  <Code className="h-4 w-4 text-primary" />
                                                  Test Payload
                                                </h5>
                                                <code className="text-sm text-slate-300 bg-slate-800 px-3 py-2 rounded block break-all overflow-x-auto">
                                                  {finding.payload}
                                                </code>
                                              </div>
                                            )}
                                          </div>

                                          {/* AI Solution */}
                                          {finding.solution && (
                                            <div className="bg-gradient-to-br from-blue-950/50 to-blue-900/30 rounded-xl p-6 border border-blue-800/50">
                                              <div className="flex items-center gap-3 mb-4">
                                                <div className="w-8 h-8 bg-gradient-to-r from-blue-500 to-blue-600 rounded-lg flex items-center justify-center">
                                                  <Bot className="h-5 w-5 text-white" />
                                                </div>
                                                <h4 className="font-semibold text-blue-100 text-lg">
                                                  AI-Generated Solution
                                                </h4>
                                              </div>
                                              
                                              <p className="text-blue-200 mb-4 leading-relaxed">
                                                {finding.solution.solution}
                                              </p>
                                              
                                              {finding.solution.remediation_steps && (
                                                <div className="mb-4">
                                                  <h5 className="font-medium text-blue-100 mb-3 flex items-center gap-2">
                                                    <CheckCircle className="h-4 w-4" />
                                                    Remediation Steps:
                                                  </h5>
                                                  <ul className="space-y-2">
                                                    {finding.solution.remediation_steps.map((step, i) => (
                                                      <li key={i} className="flex items-start gap-3 text-sm text-blue-200">
                                                        <ChevronRight className="h-4 w-4 text-blue-400 mt-0.5 flex-shrink-0" />
                                                        <span>{step}</span>
                                                      </li>
                                                    ))}
                                                  </ul>
                                                </div>
                                              )}
                                              
                                              {finding.solution.code_snippet && (
                                                <div className="mb-4">
                                                  <h5 className="font-medium text-blue-100 mb-3 flex items-center gap-2">
                                                    <Code className="h-4 w-4" />
                                                    Code Example:
                                                  </h5>
                                                  <pre className="text-xs bg-slate-900/80 text-slate-300 p-4 rounded-lg border border-slate-700 overflow-x-auto">
                                                    <code>{finding.solution.code_snippet}</code>
                                                  </pre>
                                                </div>
                                              )}

                                              {/* Resource Links */}
                                              {finding.solution.resource_links && finding.solution.resource_links.length > 0 && (
                                                <div className="mb-4">
                                                  <h5 className="font-medium text-blue-100 mb-3 flex items-center gap-2">
                                                    <BookOpen className="h-4 w-4" />
                                                    Learn More:
                                                  </h5>
                                                  <div className="space-y-2">
                                                    {finding.solution.resource_links.map((link, i) => (
                                                      <a
                                                        key={i}
                                                        href={link.url}
                                                        target="_blank"
                                                        rel="noopener noreferrer"
                                                        className="flex items-center gap-2 text-sm text-blue-300 hover:text-blue-200 transition-colors group"
                                                      >
                                                        {link.type === 'youtube' ? (
                                                          <Video className="h-4 w-4" />
                                                        ) : link.type === 'blog' ? (
                                                          <FileText className="h-4 w-4" />
                                                        ) : (
                                                          <BookOpen className="h-4 w-4" />
                                                        )}
                                                        <span>{link.title}</span>
                                                        <ExternalLink className="h-3 w-3 opacity-0 group-hover:opacity-100 transition-opacity" />
                                                      </a>
                                                    ))}
                                                  </div>
                                                </div>
                                              )}
                                              
                                              {/* Metadata */}
                                              <div className="flex flex-wrap gap-4 text-xs text-blue-300 pt-4 border-t border-blue-800/50">
                                                {finding.solution.priority && (
                                                  <span className="flex items-center gap-1">
                                                    <Star className="h-3 w-3" />
                                                    <strong>Priority:</strong> {finding.solution.priority}
                                                  </span>
                                                )}
                                                {finding.solution.estimated_effort && (
                                                  <span className="flex items-center gap-1">
                                                    <Clock className="h-3 w-3" />
                                                    <strong>Effort:</strong> {finding.solution.estimated_effort}
                                                  </span>
                                                )}
                                                {finding.solution.confidence && (
                                                  <span className="flex items-center gap-1">
                                                    <Target className="h-3 w-3" />
                                                    <strong>Confidence:</strong> {finding.solution.confidence}
                                                  </span>
                                                )}
                                              </div>
                                            </div>
                                          )}
                                        </div>
                                      </div>
                                    </AccordionContent>
                                  </AccordionItem>
                                </motion.div>
                              ))}
                            </Accordion>
                          </div>
                        )}
                      </AnimatePresence>
                    </CardContent>
                  </CollapsibleContent>
                </Card>
              </Collapsible>
            </motion.div>

            {/* Website Health Analysis Sections */}
            {healthCheck.scores && (
              <>
                {/* Performance Section */}
                <motion.div
                  initial={{ opacity: 0, y: 40 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.8, delay: 0.6 }}
                >
                  <Collapsible 
                    open={expandedSections.performance} 
                    onOpenChange={() => toggleSection('performance')}
                  >
                    <Card className="relative bg-gradient-to-br from-slate-900/90 via-slate-800/60 to-slate-900/90 border border-slate-700/50 backdrop-blur-xl overflow-hidden">
                      <div className="absolute inset-0 bg-gradient-to-br from-orange-500/5 via-transparent to-yellow-500/5" />
                      
                      <CollapsibleTrigger className="w-full">
                        <CardHeader className="relative">
                          <CardTitle className="flex items-center justify-between">
                            <div className="flex items-center gap-3">
                              <div className="w-10 h-10 bg-gradient-to-r from-orange-500 to-yellow-500 rounded-xl flex items-center justify-center">
                                <Zap className="h-6 w-6 text-white" />
                              </div>
                              Performance Analysis
                              <ScoreCircle 
                                score={healthCheck.scores.performance || 0} 
                                label="" 
                                size="sm" 
                              />
                            </div>
                            <ChevronDown className={`h-6 w-6 text-slate-400 transition-transform duration-200 ${expandedSections.performance ? 'rotate-180' : ''}`} />
                          </CardTitle>
                        </CardHeader>
                      </CollapsibleTrigger>
                      
                      <CollapsibleContent>
                        <CardContent className="relative space-y-6">
                          {/* Performance Metrics */}
                          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                            {performanceData.metrics && (
                              <>
                                <div className="bg-slate-800/50 p-4 rounded-lg border border-slate-700/30">
                                  <h4 className="font-semibold text-white mb-2 flex items-center gap-2">
                                    <Clock className="h-4 w-4 text-orange-400" />
                                    Load Times
                                  </h4>
                                  <div className="space-y-2 text-sm">
                                    <div className="flex justify-between">
                                      <span className="text-slate-400">DOM Content Loaded:</span>
                                      <span className="text-white">{performanceData.metrics.domContentLoaded}ms</span>
                                    </div>
                                    <div className="flex justify-between">
                                      <span className="text-slate-400">Load Complete:</span>
                                      <span className="text-white">{performanceData.metrics.loadComplete}ms</span>
                                    </div>
                                    <div className="flex justify-between">
                                      <span className="text-slate-400">First Paint:</span>
                                      <span className="text-white">{performanceData.metrics.firstPaint}ms</span>
                                    </div>
                                  </div>
                                </div>

                                <div className="bg-slate-800/50 p-4 rounded-lg border border-slate-700/30">
                                  <h4 className="font-semibold text-white mb-2 flex items-center gap-2">
                                    <BarChart3 className="h-4 w-4 text-orange-400" />
                                    Core Web Vitals
                                  </h4>
                                  <div className="space-y-2 text-sm">
                                    <div className="flex justify-between">
                                      <span className="text-slate-400">FCP:</span>
                                      <span className="text-white">{performanceData.metrics.firstContentfulPaint}ms</span>
                                    </div>
                                    <div className="flex justify-between">
                                      <span className="text-slate-400">TTI:</span>
                                      <span className="text-white">{Math.round(performanceData.metrics.timeToInteractive)}ms</span>
                                    </div>
                                    <div className="flex justify-between">
                                      <span className="text-slate-400">DNS Lookup:</span>
                                      <span className="text-white">{Math.round(performanceData.metrics.dnsLookup)}ms</span>
                                    </div>
                                  </div>
                                </div>

                                <div className="bg-slate-800/50 p-4 rounded-lg border border-slate-700/30">
                                  <h4 className="font-semibold text-white mb-2 flex items-center gap-2">
                                    <Server className="h-4 w-4 text-orange-400" />
                                    Network
                                  </h4>
                                  <div className="space-y-2 text-sm">
                                    <div className="flex justify-between">
                                      <span className="text-slate-400">TCP Connect:</span>
                                      <span className="text-white">{performanceData.metrics.tcpConnect}ms</span>
                                    </div>
                                    <div className="flex justify-between">
                                      <span className="text-slate-400">SSL Handshake:</span>
                                      <span className="text-white">{performanceData.metrics.sslHandshake}ms</span>
                                    </div>
                                    <div className="flex justify-between">
                                      <span className="text-slate-400">TTFB:</span>
                                      <span className="text-white">{performanceData.metrics.timeToFirstByte}ms</span>
                                    </div>
                                  </div>
                                </div>
                              </>
                            )}
                          </div>

                          {/* Performance Issues */}
                          {issueBreakdown.performance?.issues && (
                            <div className="space-y-4">
                              <h4 className="font-semibold text-white text-lg">Performance Issues</h4>
                              {issueBreakdown.performance.issues.map((issue, index) => (
                                <div key={index} className="bg-slate-800/50 p-4 rounded-lg border border-slate-700/30">
                                  <div className="flex items-start gap-3">
                                    <div className={`w-3 h-3 rounded-full ${getSeverityColor(issue.severity)}`}></div>
                                    <div>
                                      <h5 className="font-medium text-white">{issue.description}</h5>
                                      {issue.currentValue && (
                                        <p className="text-sm text-slate-400 mt-1">
                                          Current: {issue.currentValue}{issue.unit} | Target: {issue.targetValue}{issue.unit}
                                        </p>
                                      )}
                                    </div>
                                  </div>
                                </div>
                              ))}
                            </div>
                          )}

                          {/* Performance Recommendations */}
                          {issueBreakdown.performance?.recommendations && (
                            <div className="space-y-4">
                              <h4 className="font-semibold text-white text-lg">Performance Recommendations</h4>
                              <div className="bg-gradient-to-br from-green-950/50 to-green-900/30 rounded-xl p-6 border border-green-800/50">
                                <div className="flex items-center gap-3 mb-4">
                                  <div className="w-8 h-8 bg-gradient-to-r from-green-500 to-green-600 rounded-lg flex items-center justify-center">
                                    <TrendingUp className="h-5 w-5 text-white" />
                                  </div>
                                  <h4 className="font-semibold text-green-100 text-lg">
                                    Optimization Suggestions
                                  </h4>
                                </div>
                                
                                <ul className="space-y-3">
                                  {issueBreakdown.performance.recommendations.map((rec, i) => (
                                    <li key={i} className="flex items-start gap-3 text-sm text-green-200">
                                      <ChevronRight className="h-4 w-4 text-green-400 mt-0.5 flex-shrink-0" />
                                      <span>{rec}</span>
                                    </li>
                                  ))}
                                </ul>
                              </div>
                            </div>
                          )}

                          {/* Performance Opportunities */}
                          {performanceData.opportunities && (
                            <div className="space-y-4">
                              <h4 className="font-semibold text-white text-lg">Performance Opportunities</h4>
                              {performanceData.opportunities.map((opportunity, index) => (
                                <div key={index} className="bg-slate-800/50 p-4 rounded-lg border border-slate-700/30">
                                  <div className="flex items-start gap-3">
                                    <div className="w-3 h-3 rounded-full mt-1 bg-blue-500"></div>
                                    <div>
                                      <h5 className="font-medium text-white">{opportunity.description}</h5>
                                      <p className="text-sm text-slate-400 mt-1">{opportunity.suggestion}</p>
                                    </div>
                                  </div>
                                </div>
                              ))}
                            </div>
                          )}
                        </CardContent>
                      </CollapsibleContent>
                    </Card>
                  </Collapsible>
                </motion.div>

                {/* Accessibility Section */}
                <motion.div
                  initial={{ opacity: 0, y: 40 }}
                  animate={{ opacity: 1, y: 0 }}
                                <div key={index} className="bg-slate-800/50 p-4 rounded-lg border border-slate-700/30">
                                  <div className="flex items-start gap-3">
                                    <div className={`w-3 h-3 rounded-full mt-1 ${getSeverityColor(issue.severity)}`}></div>
                                    <div>
                                      <h5 className="font-medium text-white">{issue.description}</h5>
                                      {issue.count && (
                                        <p className="text-sm text-slate-400 mt-1">
                                          Found: {issue.count} instances
                                        </p>
                                      )}
                                    </div>
                                  </div>
                                </div>
                              ))}
                              
                              {/* Recommendations */}
                              {issueBreakdown.accessibility?.recommendations && (
                                <div className="mt-4">
                                  <h5 className="font-medium text-white mb-3">Recommendations:</h5>
                                  <ul className="space-y-2">
                                    {issueBreakdown.accessibility.recommendations.map((rec, i) => (
                                      <li key={i} className="flex items-start gap-3 text-sm text-slate-300">
                                        <ChevronRight className="h-4 w-4 text-blue-400 mt-0.5 flex-shrink-0" />
                                        <span>{rec}</span>
                                      </li>
                                    ))}
                                  </ul>
                                </div>
                              )}
                            </div>
                          )}
                        </CardContent>
                      </CollapsibleContent>
                    </Card>
                  </Collapsible>
                </motion.div>

                {/* SEO Section */}
                <motion.div
                  initial={{ opacity: 0, y: 40 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.8, delay: 0.8 }}
                >
                  <Collapsible 
                    open={expandedSections.seo} 
                    onOpenChange={() => toggleSection('seo')}
                  >
                    <Card className="relative bg-gradient-to-br from-slate-900/90 via-slate-800/60 to-slate-900/90 border border-slate-700/50 backdrop-blur-xl overflow-hidden">
                      <div className="absolute inset-0 bg-gradient-to-br from-green-500/5 via-transparent to-emerald-500/5" />
                      
                      <CollapsibleTrigger className="w-full">
                        <CardHeader className="relative">
                          <CardTitle className="flex items-center justify-between">
                            <div className="flex items-center gap-3">
                              <div className="w-10 h-10 bg-gradient-to-r from-green-500 to-emerald-500 rounded-xl flex items-center justify-center">
                                <Search className="h-6 w-6 text-white" />
                              </div>
                              SEO Analysis
                              <ScoreCircle 
                                score={healthCheck.scores.seo || 0} 
                                label="" 
                                size="sm" 
                              />
                            </div>
                            <ChevronDown className={`h-6 w-6 text-slate-400 transition-transform duration-200 ${expandedSections.seo ? 'rotate-180' : ''}`} />
                          </CardTitle>
                        </CardHeader>
                      </CollapsibleTrigger>
                      
                      <CollapsibleContent>
                        <CardContent className="relative space-y-6">
                          {/* SEO Data */}
                          {seoData.data && (
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                              <div className="bg-slate-800/50 p-4 rounded-lg border border-slate-700/30">
                                <h4 className="font-semibold text-white mb-3">Page Information</h4>
                                <div className="space-y-2 text-sm">
                                  <div className="flex justify-between">
                                    <span className="text-slate-400">Title:</span>
                                    <span className="text-white">{seoData.data.title}</span>
                                  </div>
                                  <div className="flex justify-between">
                                    <span className="text-slate-400">Title Length:</span>
                                    <span className="text-white">{seoData.data.titleLength} chars</span>
                                  </div>
                                  <div className="flex justify-between">
                                    <span className="text-slate-400">Meta Description:</span>
                                    <span className="text-white">{seoData.data.metaDescriptionLength || 0} chars</span>
                                  </div>
                                  <div className="flex justify-between">
                                    <span className="text-slate-400">Language:</span>
                                    <span className="text-white">{seoData.data.language || 'Not set'}</span>
                                  </div>
                                </div>
                              </div>

                              <div className="bg-slate-800/50 p-4 rounded-lg border border-slate-700/30">
                                <h4 className="font-semibold text-white mb-3">Structure</h4>
                                <div className="space-y-2 text-sm">
                                  <div className="flex justify-between">
                                    <span className="text-slate-400">H1 Count:</span>
                                    <span className="text-white">{seoData.data.h1Count}</span>
                                  </div>
                                  {seoData.data.headingStructure && (
                                    <div className="mt-3">
                                      <span className="text-slate-400 block mb-2">Heading Structure:</span>
                                      <div className="grid grid-cols-3 gap-2 text-xs">
                                        {Object.entries(seoData.data.headingStructure).map(([tag, count]) => (
                                          <div key={tag} className="flex justify-between">
                                            <span className="text-slate-500">{tag.toUpperCase()}:</span>
                                            <span className="text-white">{count}</span>
                                          </div>
                                        ))}
                                      </div>
                                    </div>
                                  )}
                                </div>
                              </div>
                            </div>
                          )}

                          {/* SEO Issues */}
                          {issueBreakdown.seo?.issues && (
                            <div className="space-y-4">
                              <h4 className="font-semibold text-white text-lg">SEO Issues</h4>
                              {issueBreakdown.seo.issues.map((issue, index) => (
                                <div key={index} className="bg-slate-800/50 p-4 rounded-lg border border-slate-700/30">
                                  <div className="flex items-start gap-3">
                                    <div className={`w-3 h-3 rounded-full mt-1 ${getSeverityColor(issue.severity)}`}></div>
                                    <div>
                                      <h5 className="font-medium text-white">{issue.description}</h5>
                                    </div>
                                  </div>
                                </div>
                              ))}
                              
                              {/* SEO Recommendations */}
                              {issueBreakdown.seo?.recommendations && (
                                <div className="mt-4">
                                  <h5 className="font-medium text-white mb-3">SEO Recommendations:</h5>
                                  <ul className="space-y-2">
                                    {issueBreakdown.seo.recommendations.map((rec, i) => (
                                      <li key={i} className="flex items-start gap-3 text-sm text-slate-300">
                                        <ChevronRight className="h-4 w-4 text-green-400 mt-0.5 flex-shrink-0" />
                                        <span>{rec}</span>
                                      </li>
                                    ))}
                                  </ul>
                                </div>
                              )}
                            </div>
                          )}
                        </CardContent>
                      </CollapsibleContent>
                    </Card>
                  </Collapsible>
                </motion.div>

                {/* Best Practices Section */}
                <motion.div
                  initial={{ opacity: 0, y: 40 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.8, delay: 0.9 }}
                >
                  <Collapsible 
                    open={expandedSections.bestPractices} 
                    onOpenChange={() => toggleSection('bestPractices')}
                  >
                    <Card className="relative bg-gradient-to-br from-slate-900/90 via-slate-800/60 to-slate-900/90 border border-slate-700/50 backdrop-blur-xl overflow-hidden">
                      <div className="absolute inset-0 bg-gradient-to-br from-purple-500/5 via-transparent to-pink-500/5" />
                      
                      <CollapsibleTrigger className="w-full">
                        <CardHeader className="relative">
                          <CardTitle className="flex items-center justify-between">
                            <div className="flex items-center gap-3">
                              <div className="w-10 h-10 bg-gradient-to-r from-purple-500 to-pink-500 rounded-xl flex items-center justify-center">
                                <Settings className="h-6 w-6 text-white" />
                              </div>
                              Best Practices Analysis
                              <ScoreCircle 
                                score={healthCheck.scores.bestPractices || 0} 
                                label="" 
                                size="sm" 
                              />
                            </div>
                            <ChevronDown className={`h-6 w-6 text-slate-400 transition-transform duration-200 ${expandedSections.bestPractices ? 'rotate-180' : ''}`} />
                          </CardTitle>
                        </CardHeader>
                      </CollapsibleTrigger>
                      
                      <CollapsibleContent>
                        <CardContent className="relative space-y-6">
                          {/* Best Practices Summary */}
                          {bestPracticesData.summary && (
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                              <div className="bg-slate-800/50 p-4 rounded-lg border border-slate-700/30">
                                <h4 className="font-semibold text-white mb-2">Elements</h4>
                                <div className="text-2xl font-bold text-purple-400">
                                  {bestPracticesData.summary.totalElements}
                                </div>
                                <p className="text-xs text-slate-400">Total</p>
                              </div>

                              <div className="bg-slate-800/50 p-4 rounded-lg border border-slate-700/30">
                                <h4 className="font-semibold text-white mb-2">Scripts</h4>
                                <div className="text-2xl font-bold text-purple-400">
                                  {bestPracticesData.summary.totalScripts}
                                </div>
                                <p className="text-xs text-slate-400">External</p>
                              </div>

                              <div className="bg-slate-800/50 p-4 rounded-lg border border-slate-700/30">
                                <h4 className="font-semibold text-white mb-2">Images</h4>
                                <div className="text-2xl font-bold text-purple-400">
                                  {bestPracticesData.summary.totalImages}
                                </div>
                                <p className="text-xs text-slate-400">Total</p>
                              </div>

                              <div className="bg-slate-800/50 p-4 rounded-lg border border-slate-700/30">
                                <h4 className="font-semibold text-white mb-2">Viewport</h4>
                                <div className="text-2xl font-bold text-purple-400">
                                  {bestPracticesData.summary.hasViewport ? '✓' : '✗'}
                                </div>
                                <p className="text-xs text-slate-400">Meta Tag</p>
                              </div>
                            </div>
                          )}

                          {/* Best Practices Issues */}
                          {issueBreakdown.bestPractices?.issues && (
                            <div className="space-y-4">
                              <h4 className="font-semibold text-white text-lg">Best Practices Issues</h4>
                              {issueBreakdown.bestPractices.issues.map((issue, index) => (
                                <div key={index} className="bg-slate-800/50 p-4 rounded-lg border border-slate-700/30">
                                  <div className="flex items-start gap-3">
                                    <div className={`w-3 h-3 rounded-full mt-1 ${getSeverityColor(issue.severity)}`}></div>
                                    <div>
                                      <h5 className="font-medium text-white">{issue.description}</h5>
                                    </div>
                                  </div>
                                </div>
                              ))}
                            </div>
                          )}
                        </CardContent>
                      </CollapsibleContent>
                    </Card>
                  </Collapsible>
                </motion.div>

                {/* PWA Section - MISSING SECTION */}
                {healthCheck.scores.pwa && (
                  <motion.div
                    initial={{ opacity: 0, y: 40 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.8, delay: 1.0 }}
                  >
                    <Collapsible 
                      open={expandedSections.pwa} 
                      onOpenChange={() => toggleSection('pwa')}
                    >
                      <Card className="relative bg-gradient-to-br from-slate-900/90 via-slate-800/60 to-slate-900/90 border border-slate-700/50 backdrop-blur-xl overflow-hidden">
                        <div className="absolute inset-0 bg-gradient-to-br from-indigo-500/5 via-transparent to-cyan-500/5" />
                        
                        <CollapsibleTrigger className="w-full">
                          <CardHeader className="relative">
                            <CardTitle className="flex items-center justify-between">
                              <div className="flex items-center gap-3">
                                <div className="w-10 h-10 bg-gradient-to-r from-indigo-500 to-cyan-500 rounded-xl flex items-center justify-center">
                                  <Smartphone className="h-6 w-6 text-white" />
                                </div>
                                PWA Analysis
                                <ScoreCircle 
                                  score={healthCheck.scores.pwa || 0} 
                                  label="" 
                                  size="sm" 
                                />
                              </div>
                              <ChevronDown className={`h-6 w-6 text-slate-400 transition-transform duration-200 ${expandedSections.pwa ? 'rotate-180' : ''}`} />
                            </CardTitle>
                          </CardHeader>
                        </CollapsibleTrigger>
                        
                        <CollapsibleContent>
                          <CardContent className="relative space-y-6">
                            {/* PWA Features */}
                            {pwaData.features && (
                              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                                <div className="bg-slate-800/50 p-4 rounded-lg border border-slate-700/30">
                                  <h4 className="font-semibold text-white mb-2">Service Worker</h4>
                                  <div className={`text-2xl font-bold ${pwaData.features.hasServiceWorker ? 'text-green-400' : 'text-red-400'}`}>
                                    {pwaData.features.hasServiceWorker ? '✓' : '✗'}
                                  </div>
                                  <p className="text-xs text-slate-400">Registered</p>
                                </div>

                                <div className="bg-slate-800/50 p-4 rounded-lg border border-slate-700/30">
                                  <h4 className="font-semibold text-white mb-2">Web Manifest</h4>
                                  <div className={`text-2xl font-bold ${pwaData.features.hasManifest ? 'text-green-400' : 'text-red-400'}`}>
                                    {pwaData.features.hasManifest ? '✓' : '✗'}
                                  </div>
                                  <p className="text-xs text-slate-400">Available</p>
                                </div>

                                <div className="bg-slate-800/50 p-4 rounded-lg border border-slate-700/30">
                                  <h4 className="font-semibold text-white mb-2">Installable</h4>
                                  <div className={`text-2xl font-bold ${pwaData.features.installable ? 'text-green-400' : 'text-red-400'}`}>
                                    {pwaData.features.installable ? '✓' : '✗'}
                                  </div>
                                  <p className="text-xs text-slate-400">App-like</p>
                                </div>

                                <div className="bg-slate-800/50 p-4 rounded-lg border border-slate-700/30">
                                  <h4 className="font-semibold text-white mb-2">Responsive</h4>
                                  <div className={`text-2xl font-bold ${pwaData.features.isResponsive ? 'text-green-400' : 'text-red-400'}`}>
                                    {pwaData.features.isResponsive ? '✓' : '✗'}
                                  </div>
                                  <p className="text-xs text-slate-400">Design</p>
                                </div>

                                <div className="bg-slate-800/50 p-4 rounded-lg border border-slate-700/30">
                                  <h4 className="font-semibold text-white mb-2">Offline</h4>
                                  <div className={`text-2xl font-bold ${pwaData.features.worksOffline ? 'text-green-400' : 'text-red-400'}`}>
                                    {pwaData.features.worksOffline ? '✓' : '✗'}
                                  </div>
                                  <p className="text-xs text-slate-400">Support</p>
                                </div>

                                {pwaData.viewport && (
                                  <div className="bg-slate-800/50 p-4 rounded-lg border border-slate-700/30">
                                    <h4 className="font-semibold text-white mb-2">Viewport</h4>
                                    <div className="text-sm text-indigo-400">
                                      {pwaData.viewport}
                                    </div>
                                    <p className="text-xs text-slate-400">Meta Tag</p>
                                  </div>
                                )}
                              </div>
                            )}

                            {/* PWA Issues */}
                            {issueBreakdown.pwa?.issues && (
                              <div className="space-y-4">
                                <h4 className="font-semibold text-white text-lg">PWA Issues</h4>
                                {issueBreakdown.pwa.issues.map((issue, index) => (
                                  <div key={index} className="bg-slate-800/50 p-4 rounded-lg border border-slate-700/30">
                                    <div className="flex items-start gap-3">
                                      <div className={`w-3 h-3 rounded-full mt-1 ${getSeverityColor(issue.severity)}`}></div>
                                      <div>
                                        <h5 className="font-medium text-white">{issue.description}</h5>
                                      </div>
                                    </div>
                                  </div>
                                ))}
                                
                                {/* PWA Recommendations */}
                                {issueBreakdown.pwa?.recommendations && (
                                  <div className="mt-4">
                                    <h5 className="font-medium text-white mb-3">PWA Recommendations:</h5>
                                    <ul className="space-y-2">
                                      {issueBreakdown.pwa.recommendations.map((rec, i) => (
                                        <li key={i} className="flex items-start gap-3 text-sm text-slate-300">
                                          <ChevronRight className="h-4 w-4 text-indigo-400 mt-0.5 flex-shrink-0" />
                                          <span>{rec}</span>
                                        </li>
                                      ))}
                                    </ul>
                                  </div>
                                )}
                              </div>
                            )}
                          </CardContent>
                        </CollapsibleContent>
                      </Card>
                    </Collapsible>
                  </motion.div>
                )}
              </>
            )}

          </div>

        </div>
      </div>

      <Footer />
    </div>
  );
}

export default Report;