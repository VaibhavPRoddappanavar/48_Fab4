import jsPDF from 'jspdf';
import autoTable, { UserOptions } from 'jspdf-autotable';

// Extend jsPDF with autoTable
interface jsPDFWithAutoTable extends jsPDF {
  autoTable: (options: UserOptions) => jsPDF;
}

// Define types for the actual audit report data structure
interface SecurityFinding {
  route: string;
  attack: string;
  evidence: string;
  severity: 'high' | 'medium' | 'low' | 'critical';
  solution: {
    solution: string;
    remediation_steps: string[];
    code_snippet: string;
    resource_links: Array<{
      type: string;
      title: string;
      url: string;
      youtube_id?: string;
    }>;
    cwe_cve: string;
    priority: string;
    estimated_effort: string;
    confidence: string;
    waf_rules: string[];
    notes: string;
  };
}

interface HealthcheckResult {
  category: string;
  check: string;
  status: 'pass' | 'fail' | 'warning';
  message: string;
  details?: any;
}

interface CrawlerResults {
  quickCheck: {
    generatedAt: string;
    pages: string[];
    apiEndpoints: string[];
  };
  deepCheck?: {
    generatedAt: string;
    pages: string[];
    apiEndpoints: string[];
  };
  totalPages: number;
  totalEndpoints: number;
}

interface AuditReportData {
  url: string;
  timestamp: string;
  crawlerResults: CrawlerResults;
  securityFindings: SecurityFinding[];
  healthcheckResults: HealthcheckResult[];
  summary?: {
    riskLevel: string;
    scores: {
      overall: number;
      security: number;
      performance: number;
      accessibility: number;
      seo: number;
    };
    stats: {
      totalFindings: number;
      criticalFindings: number;
      highFindings: number;
      mediumFindings: number;
      lowFindings: number;
      pagesScanned: number;
      endpointsFound: number;
    };
  };
}

const addFooter = (doc: jsPDF) => {
  const pageCount = (doc as any).internal.pages.length - 1;
  const mutedColor = '#94A3B8'; // slate-400

  for (let i = 1; i <= pageCount; i++) {
    doc.setPage(i);
    doc.setFontSize(10);
    doc.setTextColor(mutedColor);
    doc.text(`Page ${i} of ${pageCount}`, doc.internal.pageSize.getWidth() - 35, doc.internal.pageSize.getHeight() - 10);
    doc.text('WebAudit AI - Security Report', 14, doc.internal.pageSize.getHeight() - 10);
  }
};

const getSeverityColor = (severity: string): string => {
  switch (severity.toLowerCase()) {
    case 'critical': return '#DC2626'; // red-600
    case 'high': return '#EA580C'; // orange-600
    case 'medium': return '#D97706'; // amber-600
    case 'low': return '#65A30D'; // lime-600
    default: return '#6B7280'; // gray-500
  }
};

const addGradientBackground = (doc: jsPDF) => {
  // Create a subtle gradient effect with rectangles
  const pageWidth = doc.internal.pageSize.getWidth();
  const pageHeight = doc.internal.pageSize.getHeight();
  
  doc.setFillColor('#0F172A'); // slate-900
  doc.rect(0, 0, pageWidth, pageHeight, 'F');
  
  // Add some accent shapes for visual appeal
  doc.setFillColor('#1E293B'); // slate-800
  doc.circle(pageWidth - 50, 50, 30, 'F');
  doc.circle(50, pageHeight - 50, 25, 'F');
  
  // Add subtle accent circles with lower opacity color
  doc.setFillColor('#065F46'); // darker emerald for opacity effect
  doc.circle(pageWidth - 100, pageHeight - 100, 40, 'F');
  doc.circle(100, 100, 35, 'F');
};

export const generateAdvancedAuditPdf = (reportData: AuditReportData) => {
  const doc = new jsPDF() as jsPDFWithAutoTable;

  // Colors
  const primaryColor = '#10B981'; // emerald-500
  const textColor = '#FFFFFF';
  const mutedColor = '#94A3B8'; // slate-400
  const backgroundColor = '#0F172A'; // slate-900
  const cardColor = '#1E293B'; // slate-800
  const borderColor = '#334155'; // slate-700
  const accentColor = '#3B82F6'; // blue-500

  // Fonts
  const font = 'Helvetica';

  // --- COVER PAGE ---
  addGradientBackground(doc);

  // Main Title
  doc.setFont(font, 'bold');
  doc.setFontSize(42);
  doc.setTextColor(textColor);
  doc.text('WebAudit AI', doc.internal.pageSize.getWidth() / 2, 80, { align: 'center' });

  doc.setFontSize(28);
  doc.setTextColor(primaryColor);
  doc.text('Security Audit Report', doc.internal.pageSize.getWidth() / 2, 100, { align: 'center' });

  // Decorative line
  doc.setDrawColor(primaryColor);
  doc.setLineWidth(2);
  doc.line(50, 110, doc.internal.pageSize.getWidth() - 50, 110);

  // URL in a fancy box
  doc.setDrawColor(borderColor);
  doc.setFillColor(cardColor);
  doc.roundedRect(30, 130, doc.internal.pageSize.getWidth() - 60, 25, 5, 5, 'FD');
  
  doc.setFontSize(16);
  doc.setFont(font, 'normal');
  doc.setTextColor(textColor);
  doc.text(`Target: ${reportData.url}`, doc.internal.pageSize.getWidth() / 2, 147, { align: 'center' });

  // Scan info
  doc.setFontSize(12);
  doc.setTextColor(mutedColor);
  const scanDate = new Date(reportData.timestamp).toLocaleString();
  doc.text(`Scan Date: ${scanDate}`, doc.internal.pageSize.getWidth() / 2, 175, { align: 'center' });

  // Risk level badge (if available)
  if (reportData.summary?.riskLevel) {
    const riskColor = reportData.summary.riskLevel.toLowerCase() === 'high' ? '#DC2626' : 
                     reportData.summary.riskLevel.toLowerCase() === 'medium' ? '#D97706' : '#65A30D';
    
    doc.setFillColor(riskColor);
    doc.roundedRect(doc.internal.pageSize.getWidth() / 2 - 25, 190, 50, 15, 3, 3, 'F');
    doc.setFontSize(10);
    doc.setTextColor('#FFFFFF');
    doc.setFont(font, 'bold');
    doc.text(`RISK: ${reportData.summary.riskLevel.toUpperCase()}`, doc.internal.pageSize.getWidth() / 2, 200, { align: 'center' });
  }

  // Footer branding
  doc.setFontSize(10);
  doc.setTextColor(mutedColor);
  doc.text('Powered by Advanced AI Security Analysis', doc.internal.pageSize.getWidth() / 2, 250, { align: 'center' });

  // --- EXECUTIVE SUMMARY PAGE ---
  doc.addPage();
  addGradientBackground(doc);

  doc.setFontSize(24);
  doc.setFont(font, 'bold');
  doc.setTextColor(textColor);
  doc.text('Executive Summary', 20, 30);

  let yPos = 50;

  if (reportData.summary) {
    // Overall Score Card
    doc.setDrawColor(primaryColor);
    doc.setLineWidth(2);
    doc.setFillColor(cardColor);
    doc.roundedRect(20, yPos, doc.internal.pageSize.getWidth() - 40, 40, 5, 5, 'FD');
    
    doc.setFontSize(18);
    doc.setTextColor(textColor);
    doc.text('Overall Security Score', 30, yPos + 20);
    
    doc.setFontSize(36);
    doc.setFont(font, 'bold');
    doc.setTextColor(primaryColor);
    doc.text(`${reportData.summary.scores.overall}/100`, doc.internal.pageSize.getWidth() - 80, yPos + 25);
    
    yPos += 60;

    // Statistics Grid
    const stats = [
      { label: 'Total Findings', value: reportData.summary.stats.totalFindings, color: accentColor },
      { label: 'Critical Issues', value: reportData.summary.stats.criticalFindings, color: '#DC2626' },
      { label: 'High Risk', value: reportData.summary.stats.highFindings, color: '#EA580C' },
      { label: 'Medium Risk', value: reportData.summary.stats.mediumFindings, color: '#D97706' },
      { label: 'Pages Scanned', value: reportData.summary.stats.pagesScanned, color: primaryColor },
      { label: 'Endpoints Found', value: reportData.summary.stats.endpointsFound, color: primaryColor }
    ];

    const cardWidth = (doc.internal.pageSize.getWidth() - 60) / 3;
    const cardHeight = 30;
    let cardX = 20;
    let cardY = yPos;

    stats.forEach((stat, index) => {
      if (index > 0 && index % 3 === 0) {
        cardY += cardHeight + 10;
        cardX = 20;
      }

      doc.setFillColor(cardColor);
      doc.setDrawColor(stat.color);
      doc.setLineWidth(1);
      doc.roundedRect(cardX, cardY, cardWidth, cardHeight, 3, 3, 'FD');
      
      doc.setFontSize(10);
      doc.setTextColor(mutedColor);
      doc.text(stat.label, cardX + 5, cardY + 12);
      
      doc.setFontSize(16);
      doc.setTextColor(stat.color);
      doc.setFont(font, 'bold');
      doc.text(String(stat.value), cardX + cardWidth - 10, cardY + 22, { align: 'right' });
      
      cardX += cardWidth + 10;
    });

    yPos = cardY + cardHeight + 20;
  }

  // Scan Overview
  doc.setFontSize(16);
  doc.setFont(font, 'bold');
  doc.setTextColor(textColor);
  doc.text('Scan Overview', 20, yPos);
  yPos += 15;

  doc.setFontSize(11);
  doc.setFont(font, 'normal');
  doc.setTextColor(mutedColor);
  doc.text(`• Pages Discovered: ${reportData.crawlerResults.totalPages}`, 25, yPos);
  yPos += 10;
  doc.text(`• API Endpoints Found: ${reportData.crawlerResults.totalEndpoints}`, 25, yPos);
  yPos += 10;
  doc.text(`• Security Checks Performed: ${reportData.securityFindings.length}`, 25, yPos);
  yPos += 10;
  doc.text(`• Health Checks Completed: ${reportData.healthcheckResults.length}`, 25, yPos);

  // --- SECURITY FINDINGS PAGES ---
  if (reportData.securityFindings.length > 0) {
    doc.addPage();
    addGradientBackground(doc);

    doc.setFontSize(24);
    doc.setFont(font, 'bold');
    doc.setTextColor(textColor);
    doc.text('Security Findings', 20, 30);

    // Group findings by severity
    const findingsBySeverity = reportData.securityFindings.reduce((acc, finding) => {
      if (!acc[finding.severity]) acc[finding.severity] = [];
      acc[finding.severity].push(finding);
      return acc;
    }, {} as Record<string, SecurityFinding[]>);

    yPos = 50;

    Object.entries(findingsBySeverity).forEach(([severity, findings]) => {
      // Severity header
      doc.setFillColor(getSeverityColor(severity));
      doc.roundedRect(20, yPos, doc.internal.pageSize.getWidth() - 40, 15, 3, 3, 'F');
      
      doc.setFontSize(12);
      doc.setTextColor('#FFFFFF');
      doc.setFont(font, 'bold');
      doc.text(`${severity.toUpperCase()} SEVERITY (${findings.length} issues)`, 25, yPos + 10);
      
      yPos += 25;

      findings.forEach((finding, index) => {
        if (yPos > 250) {
          doc.addPage();
          addGradientBackground(doc);
          yPos = 30;
        }

        // Finding card
        doc.setFillColor(cardColor);
        doc.setDrawColor(borderColor);
        doc.roundedRect(20, yPos, doc.internal.pageSize.getWidth() - 40, 35, 3, 3, 'FD');
        
        doc.setFontSize(11);
        doc.setTextColor(textColor);
        doc.setFont(font, 'bold');
        doc.text(`${finding.attack.toUpperCase()} - ${finding.route}`, 25, yPos + 12);
        
        doc.setFontSize(9);
        doc.setTextColor(mutedColor);
        doc.setFont(font, 'normal');
        const evidenceText = finding.evidence.length > 80 ? 
          finding.evidence.substring(0, 80) + '...' : finding.evidence;
        doc.text(`Evidence: ${evidenceText}`, 25, yPos + 22);
        
        doc.text(`CWE: ${finding.solution.cwe_cve} | Priority: ${finding.solution.priority} | Effort: ${finding.solution.estimated_effort}`, 25, yPos + 30);
        
        yPos += 45;
      });

      yPos += 10;
    });
  }

  // --- DETAILED REMEDIATION PAGE ---
  if (reportData.securityFindings.length > 0) {
    doc.addPage();
    addGradientBackground(doc);

    doc.setFontSize(24);
    doc.setFont(font, 'bold');
    doc.setTextColor(textColor);
    doc.text('Remediation Guide', 20, 30);

    yPos = 50;
    
    reportData.securityFindings.slice(0, 3).forEach((finding, index) => {
      if (yPos > 220) {
        doc.addPage();
        addGradientBackground(doc);
        yPos = 30;
      }

      // Issue header
      doc.setFillColor(getSeverityColor(finding.severity));
      doc.roundedRect(20, yPos, doc.internal.pageSize.getWidth() - 40, 12, 3, 3, 'F');
      
      doc.setFontSize(10);
      doc.setTextColor('#FFFFFF');
      doc.setFont(font, 'bold');
      doc.text(`${finding.attack.toUpperCase()} REMEDIATION`, 25, yPos + 8);
      
      yPos += 20;

      // Solution
      doc.setFontSize(10);
      doc.setTextColor(textColor);
      doc.setFont(font, 'bold');
      doc.text('Solution:', 25, yPos);
      yPos += 8;

      doc.setFontSize(9);
      doc.setFont(font, 'normal');
      doc.setTextColor(mutedColor);
      const solutionLines = doc.splitTextToSize(finding.solution.solution, doc.internal.pageSize.getWidth() - 50);
      doc.text(solutionLines, 25, yPos);
      yPos += solutionLines.length * 5 + 5;

      // Remediation steps
      doc.setFontSize(10);
      doc.setTextColor(textColor);
      doc.setFont(font, 'bold');
      doc.text('Steps:', 25, yPos);
      yPos += 8;

      finding.solution.remediation_steps.slice(0, 3).forEach((step, stepIndex) => {
        doc.setFontSize(9);
        doc.setFont(font, 'normal');
        doc.setTextColor(mutedColor);
        const stepText = `${stepIndex + 1}. ${step}`;
        const stepLines = doc.splitTextToSize(stepText, doc.internal.pageSize.getWidth() - 50);
        doc.text(stepLines, 25, yPos);
        yPos += stepLines.length * 5 + 2;
      });

      yPos += 15;
    });
  }

  // --- CRAWLER RESULTS PAGE ---
  doc.addPage();
  addGradientBackground(doc);

  doc.setFontSize(24);
  doc.setFont(font, 'bold');
  doc.setTextColor(textColor);
  doc.text('Discovery Results', 20, 30);

  yPos = 50;

  // Pages discovered
  doc.setFontSize(16);
  doc.setTextColor(primaryColor);
  doc.text('Pages Discovered', 20, yPos);
  yPos += 15;

  const pages = reportData.crawlerResults.quickCheck.pages.slice(0, 10);
  pages.forEach((page, index) => {
    if (yPos > 250) {
      doc.addPage();
      addGradientBackground(doc);
      yPos = 30;
    }

    doc.setFontSize(9);
    doc.setTextColor(mutedColor);
    doc.text(`• ${page}`, 25, yPos);
    yPos += 8;
  });

  if (reportData.crawlerResults.quickCheck.pages.length > 10) {
    doc.text(`... and ${reportData.crawlerResults.quickCheck.pages.length - 10} more pages`, 25, yPos);
    yPos += 10;
  }

  yPos += 10;

  // API Endpoints
  doc.setFontSize(16);
  doc.setTextColor(primaryColor);
  doc.text('API Endpoints', 20, yPos);
  yPos += 15;

  const endpoints = reportData.crawlerResults.quickCheck.apiEndpoints.slice(0, 8);
  endpoints.forEach((endpoint, index) => {
    if (yPos > 250) {
      doc.addPage();
      addGradientBackground(doc);
      yPos = 30;
    }

    doc.setFontSize(9);
    doc.setTextColor(mutedColor);
    doc.text(`• ${endpoint}`, 25, yPos);
    yPos += 8;
  });

  if (reportData.crawlerResults.quickCheck.apiEndpoints.length > 8) {
    doc.text(`... and ${reportData.crawlerResults.quickCheck.apiEndpoints.length - 8} more endpoints`, 25, yPos);
  }

  addFooter(doc);

  // Generate filename
  const urlDomain = reportData.url.replace(/https?:\/\//, '').replace(/\//g, '_');
  const timestamp = new Date().toISOString().split('T')[0];
  
  doc.save(`WebAudit-AI-Report-${urlDomain}-${timestamp}.pdf`);
};

// Legacy function for backward compatibility
export const generatePdf = (reportData: any) => {
  // Convert legacy format to new format if needed
  if (reportData.scanUrl && reportData.categories) {
    // This is the old format, create a minimal audit report
    const auditData: AuditReportData = {
      url: reportData.scanUrl,
      timestamp: reportData.scanTime || new Date().toISOString(),
      crawlerResults: {
        quickCheck: {
          generatedAt: new Date().toISOString(),
          pages: [],
          apiEndpoints: []
        },
        totalPages: 0,
        totalEndpoints: 0
      },
      securityFindings: [],
      healthcheckResults: []
    };

    // Convert categories to security findings
    Object.entries(reportData.categories).forEach(([category, data]: [string, any]) => {
      data.issues?.forEach((issue: any) => {
        auditData.securityFindings.push({
          route: reportData.scanUrl,
          attack: category,
          evidence: issue.description || 'No evidence provided',
          severity: issue.severity || 'medium',
          solution: {
            solution: issue.title || 'No solution provided',
            remediation_steps: ['Review and fix the identified issue'],
            code_snippet: '',
            resource_links: [],
            cwe_cve: 'CWE-0',
            priority: 'P2',
            estimated_effort: 'low',
            confidence: 'medium',
            waf_rules: [],
            notes: 'Converted from legacy format'
          }
        });
      });
    });

    generateAdvancedAuditPdf(auditData);
  } else {
    // Assume it's already in the new format
    generateAdvancedAuditPdf(reportData);
  }
};
