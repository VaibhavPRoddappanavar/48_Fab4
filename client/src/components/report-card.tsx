import { useState } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { ChevronDown, ChevronUp, AlertTriangle, Bug, Lightbulb } from "lucide-react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible"
import { SeverityBadge, SeverityLevel } from "@/components/severity-badge"
import { cn } from "@/lib/utils"

export interface ReportIssue {
  id: string
  title: string
  description: string
  severity: SeverityLevel
  category: string
  aiSuggestion?: string
  technicalFix?: string
  nonTechnicalFix?: string
}

interface ReportCardProps {
  issue: ReportIssue
  className?: string
}

const severityIcons = {
  high: AlertTriangle,
  medium: Bug,
  low: Bug,
  info: Lightbulb
}

export function ReportCard({ issue, className }: ReportCardProps) {
  const [isOpen, setIsOpen] = useState(false)
  const Icon = severityIcons[issue.severity]

  return (
    <Card className={cn("shadow-card-hover", className)}>
      <Collapsible open={isOpen} onOpenChange={setIsOpen}>
        <CollapsibleTrigger asChild>
          <CardHeader className="cursor-pointer hover:bg-muted/50 transition-colors">
            <div className="flex items-start justify-between">
              <div className="flex items-start space-x-3">
                <Icon className={cn(
                  "h-5 w-5 mt-0.5 flex-shrink-0",
                  issue.severity === "high" && "text-severity-high",
                  issue.severity === "medium" && "text-severity-medium", 
                  issue.severity === "low" && "text-severity-low",
                  issue.severity === "info" && "text-severity-info"
                )} />
                <div className="flex-1 min-w-0">
                  <CardTitle className="text-base leading-6">{issue.title}</CardTitle>
                  <CardDescription className="text-sm mt-1">
                    {issue.description}
                  </CardDescription>
                </div>
              </div>
              
              <div className="flex items-center space-x-2 flex-shrink-0">
                <SeverityBadge severity={issue.severity} />
                <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                  {isOpen ? (
                    <ChevronUp className="h-4 w-4" />
                  ) : (
                    <ChevronDown className="h-4 w-4" />
                  )}
                </Button>
              </div>
            </div>
          </CardHeader>
        </CollapsibleTrigger>

        <CollapsibleContent>
          <AnimatePresence>
            {isOpen && (
              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: "auto", opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                transition={{ duration: 0.3, ease: "easeInOut" }}
              >
                <CardContent className="pt-0">
                  {issue.aiSuggestion && (
                    <div className="mb-4 p-4 bg-primary/5 border-l-4 border-primary rounded-r-lg">
                      <div className="flex items-start space-x-2">
                        <Lightbulb className="h-4 w-4 text-primary mt-0.5 flex-shrink-0" />
                        <div>
                          <h4 className="font-medium text-primary mb-1">AI Suggestion</h4>
                          <p className="text-sm text-muted-foreground">
                            {issue.aiSuggestion}
                          </p>
                        </div>
                      </div>
                    </div>
                  )}

                  {issue.technicalFix && (
                    <div className="mb-4">
                      <h4 className="font-medium mb-2">Technical Fix</h4>
                      <div className="bg-muted p-3 rounded-md text-sm font-mono">
                        {issue.technicalFix}
                      </div>
                    </div>
                  )}

                  {issue.nonTechnicalFix && (
                    <div>
                      <h4 className="font-medium mb-2">Non-Technical Solution</h4>
                      <p className="text-sm text-muted-foreground">
                        {issue.nonTechnicalFix}
                      </p>
                    </div>
                  )}
                </CardContent>
              </motion.div>
            )}
          </AnimatePresence>
        </CollapsibleContent>
      </Collapsible>
    </Card>
  )
}