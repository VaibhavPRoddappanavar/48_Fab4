import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
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
import { Shield, AlertTriangle, CheckCircle, Globe, Zap, Eye, Bot, Download } from "lucide-react";
import { Button } from "@/components/ui/button";

function Report() {
  const { auditId } = useParams();
  const [auditData, setAuditData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

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

  const getScoreColor = (score) => {
    if (score >= 90) return 'text-green-500';
    if (score >= 70) return 'text-yellow-500';
    return 'text-red-500';
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background text-foreground flex flex-col">
        <Navigation />
        <div className="flex-1 flex items-center justify-center">
          <div className="text-center">
            <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary mx-auto mb-4"></div>
            <h1 className="text-2xl font-bold mb-4">Loading Report...</h1>
            <Progress value={50} className="w-64 mx-auto" />
          </div>
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
          <div className="text-center">
            <AlertTriangle className="h-16 w-16 text-red-500 mx-auto mb-4" />
            <h1 className="text-3xl font-bold mb-4 text-red-500">Error Loading Report</h1>
            <p className="text-lg">{error}</p>
          </div>
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
          <div className="text-center">
            <Globe className="h-16 w-16 text-gray-500 mx-auto mb-4" />
            <h1 className="text-3xl font-bold mb-4">No Report Data</h1>
            <p className="text-lg">Unable to load audit results.</p>
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  const { results, summary, metadata } = auditData;
  const { securityFindings = [], healthCheck = {} } = results;

  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col">
      <Navigation />
      
      <div className="flex-1 py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          {/* Header */}
          <div className="text-center mb-12">
            <h1 className="text-4xl font-bold mb-4">Security Audit Report</h1>
            <p className="text-xl text-muted-foreground mb-2">
              Analysis completed for: <span className="font-semibold text-primary">{metadata?.url}</span>
            </p>
            <div className="flex items-center justify-center gap-6 text-sm text-muted-foreground">
              <span>Scan Type: {metadata?.scanType}</span>
              <span>Duration: {metadata?.duration}</span>
              <span>Completed: {new Date(metadata?.endTime).toLocaleString()}</span>
            </div>
          </div>

          {/* Overall Summary */}
          <Card className="mb-8">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Shield className="h-6 w-6" />
                Overall Security Score
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                <div className="text-center">
                  <div className={`text-4xl font-bold mb-2 ${getScoreColor(summary?.scores?.overall || 0)}`}>
                    {summary?.scores?.overall || 0}
                  </div>
                  <div className="text-sm text-muted-foreground">Overall Score</div>
                </div>
                <div className="text-center">
                  <div className={`text-4xl font-bold mb-2 ${getScoreColor(summary?.scores?.security || 0)}`}>
                    {summary?.scores?.security || 0}
                  </div>
                  <div className="text-sm text-muted-foreground">Security Score</div>
                </div>
                <div className="text-center">
                  <div className={`text-4xl font-bold mb-2 ${getScoreColor(summary?.scores?.health || 0)}`}>
                    {summary?.scores?.health || 0}
                  </div>
                  <div className="text-sm text-muted-foreground">Health Score</div>
                </div>
                <div className="text-center">
                  <Badge 
                    variant={summary?.riskLevel === 'High' ? 'destructive' : summary?.riskLevel === 'Medium' ? 'default' : 'secondary'}
                    className="text-lg py-2 px-4"
                  >
                    {summary?.riskLevel || 'Unknown'} Risk
                  </Badge>
                  <div className="text-sm text-muted-foreground mt-2">Risk Level</div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Security Findings */}
          <Card className="mb-8">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <AlertTriangle className="h-6 w-6" />
                Security Findings ({securityFindings.length})
              </CardTitle>
            </CardHeader>
            <CardContent>
              {securityFindings.length === 0 ? (
                <div className="text-center py-8">
                  <CheckCircle className="h-12 w-12 text-green-500 mx-auto mb-4" />
                  <p className="text-lg font-medium text-green-600">No security vulnerabilities detected!</p>
                  <p className="text-muted-foreground">Your website appears to be secure based on our analysis.</p>
                </div>
              ) : (
                <Accordion type="single" collapsible className="w-full">
                  {securityFindings.map((finding, index) => (
                    <AccordionItem value={`item-${index}`} key={index}>
                      <AccordionTrigger className="text-left">
                        <div className="flex items-center justify-between w-full pr-4">
                          <div className="flex items-center gap-3">
                            <div className={`w-3 h-3 rounded-full ${getSeverityColor(finding.severity)}`}></div>
                            <span className="font-medium">{finding.attack || finding.type}</span>
                          </div>
                          <Badge 
                            variant={finding.severity === 'critical' ? 'destructive' : 'secondary'}
                            className="capitalize"
                          >
                            {finding.severity}
                          </Badge>
                        </div>
                      </AccordionTrigger>
                      <AccordionContent className="pt-4">
                        <div className="space-y-4">
                          <div>
                            <strong className="text-sm">Route:</strong>
                            <p className="text-sm text-muted-foreground mt-1">{finding.route}</p>
                          </div>
                          
                          {finding.evidence && (
                            <div>
                              <strong className="text-sm">Evidence:</strong>
                              <p className="text-sm text-muted-foreground mt-1">{finding.evidence}</p>
                            </div>
                          )}
                          
                          {finding.payload && (
                            <div>
                              <strong className="text-sm">Payload:</strong>
                              <code className="text-sm bg-muted p-2 rounded block mt-1">{finding.payload}</code>
                            </div>
                          )}
                          
                          {finding.solution && (
                            <div className="bg-blue-50 dark:bg-blue-950/20 p-4 rounded-lg border border-blue-200 dark:border-blue-800">
                              <h4 className="font-semibold text-blue-900 dark:text-blue-100 mb-2 flex items-center gap-2">
                                <Bot className="h-4 w-4" />
                                AI-Generated Solution
                              </h4>
                              <p className="text-sm text-blue-800 dark:text-blue-200 mb-3">{finding.solution.solution}</p>
                              
                              {finding.solution.remediation_steps && (
                                <div>
                                  <h5 className="font-medium text-blue-900 dark:text-blue-100 mb-2">Remediation Steps:</h5>
                                  <ul className="list-disc list-inside space-y-1 text-sm text-blue-800 dark:text-blue-200">
                                    {finding.solution.remediation_steps.map((step, i) => (
                                      <li key={i}>{step}</li>
                                    ))}
                                  </ul>
                                </div>
                              )}
                              
                              {finding.solution.code_snippet && (
                                <div className="mt-3">
                                  <h5 className="font-medium text-blue-900 dark:text-blue-100 mb-2">Code Example:</h5>
                                  <pre className="text-xs bg-blue-100 dark:bg-blue-900/30 p-3 rounded border overflow-x-auto">
                                    <code>{finding.solution.code_snippet}</code>
                                  </pre>
                                </div>
                              )}
                              
                              <div className="flex gap-4 text-xs text-blue-700 dark:text-blue-300 mt-3">
                                {finding.solution.priority && (
                                  <span><strong>Priority:</strong> {finding.solution.priority}</span>
                                )}
                                {finding.solution.estimated_effort && (
                                  <span><strong>Effort:</strong> {finding.solution.estimated_effort}</span>
                                )}
                              </div>
                            </div>
                          )}
                        </div>
                      </AccordionContent>
                    </AccordionItem>
                  ))}
                </Accordion>
              )}
            </CardContent>
          </Card>

          {/* Health Check Results */}
          {healthCheck.scores && (
            <Card className="mb-8">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Zap className="h-6 w-6" />
                  Website Health Analysis
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                  <div className="text-center">
                    <div className={`text-2xl font-bold mb-2 ${getScoreColor(healthCheck.scores.performance || 0)}`}>
                      {healthCheck.scores.performance || 0}/100
                    </div>
                    <div className="text-sm text-muted-foreground flex items-center justify-center gap-1">
                      <Zap className="h-4 w-4" />
                      Performance
                    </div>
                  </div>
                  <div className="text-center">
                    <div className={`text-2xl font-bold mb-2 ${getScoreColor(healthCheck.scores.accessibility || 0)}`}>
                      {healthCheck.scores.accessibility || 0}/100
                    </div>
                    <div className="text-sm text-muted-foreground flex items-center justify-center gap-1">
                      <Eye className="h-4 w-4" />
                      Accessibility
                    </div>
                  </div>
                  <div className="text-center">
                    <div className={`text-2xl font-bold mb-2 ${getScoreColor(healthCheck.scores.bestPractices || 0)}`}>
                      {healthCheck.scores.bestPractices || 0}/100
                    </div>
                    <div className="text-sm text-muted-foreground flex items-center justify-center gap-1">
                      <CheckCircle className="h-4 w-4" />
                      Best Practices
                    </div>
                  </div>
                  <div className="text-center">
                    <div className={`text-2xl font-bold mb-2 ${getScoreColor(healthCheck.scores.seo || 0)}`}>
                      {healthCheck.scores.seo || 0}/100
                    </div>
                    <div className="text-sm text-muted-foreground flex items-center justify-center gap-1">
                      <Globe className="h-4 w-4" />
                      SEO
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Download Report */}
          <div className="text-center">
            <Button 
              onClick={() => window.open(`http://localhost:5000/api/audit/${auditId}/download`, '_blank')}
              className="bg-primary hover:bg-primary/90"
            >
              <Download className="h-4 w-4 mr-2" />
              Download Full Report (JSON)
            </Button>
          </div>
        </div>
      </div>

      <Footer />
    </div>
  );
}

export default Report;