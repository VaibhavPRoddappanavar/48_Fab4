// pdf-generator.js - Server-side PDF generation for audit reports
import puppeteer from "puppeteer";
import fs from "fs";
import path from "path";

// Generate HTML content for the PDF report
const generateReportHTML = (reportData) => {
  // Safely handle missing data with defaults
  const safeReportData = {
    url: reportData?.url || "Unknown URL",
    timestamp: reportData?.timestamp || new Date().toISOString(),
    crawlerResults: {
      quickCheck: {
        pages: reportData?.crawlerResults?.quickCheck?.pages || [],
        apiEndpoints:
          reportData?.crawlerResults?.quickCheck?.apiEndpoints || [],
      },
      deepCheck: reportData?.crawlerResults?.deepCheck || null,
      totalPages: reportData?.crawlerResults?.totalPages || 0,
      totalEndpoints: reportData?.crawlerResults?.totalEndpoints || 0,
    },
    securityFindings: reportData?.securityFindings || [],
    securityFingerprints: reportData?.securityFingerprints || [],
    healthcheckResults: reportData?.healthcheckResults || [],
    healthCheck: reportData?.healthCheck || null,
    summary: reportData?.summary || null,
  };

  const getSeverityColor = (severity) => {
    switch (severity?.toLowerCase()) {
      case "critical":
        return "#DC2626";
      case "high":
        return "#EF4444";
      case "medium":
        return "#F59E0B";
      case "low":
        return "#10B981";
      default:
        return "#6B7280";
    }
  };

  const getScoreColor = (score) => {
    if (score >= 90) return "#10B981"; // green
    if (score >= 70) return "#F59E0B"; // yellow
    if (score >= 50) return "#EF4444"; // red
    return "#DC2626"; // dark red
  };

  const getSeverityBadge = (severity) => {
    const color = getSeverityColor(severity);
    return `<span style="background: linear-gradient(135deg, ${color}, ${color}dd); color: white; padding: 6px 14px; border-radius: 25px; font-size: 12px; font-weight: bold; text-transform: uppercase; box-shadow: 0 4px 8px rgba(0,0,0,0.2);">${
      severity || "unknown"
    }</span>`;
  };

  const getScoreBadge = (score, label) => {
    const color = getScoreColor(score);
    return `
      <div style="background: linear-gradient(135deg, rgba(15, 23, 42, 0.95), rgba(30, 41, 59, 0.95)); border: 2px solid ${color}; border-radius: 16px; padding: 20px; text-align: center; min-width: 140px; backdrop-filter: blur(10px); box-shadow: 0 8px 32px rgba(0,0,0,0.3);">
        <div style="font-size: 2.5rem; font-weight: 900; color: ${color}; margin-bottom: 8px; text-shadow: 0 0 20px ${color}50;">${score}</div>
        <div style="color: #E2E8F0; font-size: 0.9rem; font-weight: 600; text-transform: uppercase; letter-spacing: 1px;">${label}</div>
      </div>
    `;
  };

  return `
    <!DOCTYPE html>
    <html lang="en">
    <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>WebAudit AI - Premium Security Report</title>
        <style>
            @import url('https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800;900&display=swap');
            
            * {
                margin: 0;
                padding: 0;
                box-sizing: border-box;
            }
            
            body {
                font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
                line-height: 1.6;
                color: #E2E8F0;
                background: linear-gradient(135deg, #0F172A 0%, #1E293B 25%, #0F172A 50%, #1E293B 75%, #0F172A 100%);
                background-attachment: fixed;
                min-height: 100vh;
                font-weight: 400;
            }
            
            .container {
                max-width: 1000px;
                margin: 0 auto;
                padding: 40px 30px;
            }
            
            /* Cover Page Styles */
            .cover-page {
                min-height: 100vh;
                display: flex;
                flex-direction: column;
                justify-content: center;
                align-items: center;
                text-align: center;
                position: relative;
                overflow: hidden;
            }
            
            .cover-page::before {
                content: '';
                position: absolute;
                top: -50%;
                left: -50%;
                width: 200%;
                height: 200%;
                background: radial-gradient(circle, rgba(16, 185, 129, 0.1) 0%, transparent 50%);
                animation: rotate 20s linear infinite;
            }
            
            @keyframes rotate {
                0% { transform: rotate(0deg); }
                100% { transform: rotate(360deg); }
            }
            
            .logo-section {
                position: relative;
                z-index: 2;
                margin-bottom: 60px;
            }
            
            .main-title {
                font-size: 4.5rem;
                font-weight: 900;
                background: linear-gradient(135deg, #10B981, #3B82F6, #8B5CF6);
                -webkit-background-clip: text;
                -webkit-text-fill-color: transparent;
                background-clip: text;
                margin-bottom: 20px;
                text-shadow: 0 0 40px rgba(16, 185, 129, 0.3);
                letter-spacing: -2px;
            }
            
            .subtitle {
                font-size: 1.8rem;
                color: #94A3B8;
                font-weight: 300;
                margin-bottom: 40px;
                letter-spacing: 2px;
                text-transform: uppercase;
            }
            
            .cover-url-box {
                background: rgba(15, 23, 42, 0.8);
                border: 2px solid rgba(16, 185, 129, 0.3);
                border-radius: 20px;
                padding: 40px;
                margin: 40px 0;
                backdrop-filter: blur(20px);
                box-shadow: 0 25px 50px rgba(0, 0, 0, 0.5);
                position: relative;
                overflow: hidden;
            }
            
            .cover-url-box::before {
                content: '';
                position: absolute;
                top: 0;
                left: 0;
                right: 0;
                height: 1px;
                background: linear-gradient(90deg, transparent, #10B981, transparent);
            }
            
            .target-label {
                color: #10B981;
                font-size: 1.2rem;
                font-weight: 600;
                margin-bottom: 15px;
                text-transform: uppercase;
                letter-spacing: 1px;
            }
            
            .target-url {
                color: #FFFFFF;
                font-size: 1.4rem;
                font-weight: 600;
                word-break: break-all;
                margin-bottom: 20px;
            }
            
            .scan-date {
                color: #64748B;
                font-size: 1rem;
                font-weight: 400;
            }
            
            /* Section Cards */
            .section-card {
                background: rgba(15, 23, 42, 0.9);
                border: 1px solid rgba(51, 65, 85, 0.6);
                border-radius: 24px;
                padding: 40px;
                margin: 40px 0;
                backdrop-filter: blur(20px);
                box-shadow: 0 20px 40px rgba(0, 0, 0, 0.3);
                position: relative;
                overflow: hidden;
            }
            
            .section-card::before {
                content: '';
                position: absolute;
                top: 0;
                left: 0;
                right: 0;
                height: 2px;
                background: linear-gradient(90deg, #10B981, #3B82F6, #8B5CF6);
            }
            
            .section-title {
                font-size: 2.2rem;
                font-weight: 800;
                margin-bottom: 30px;
                color: #FFFFFF;
                position: relative;
                display: flex;
                align-items: center;
                gap: 15px;
            }
            
            .section-icon {
                width: 40px;
                height: 40px;
                background: linear-gradient(135deg, #10B981, #059669);
                border-radius: 12px;
                display: flex;
                align-items: center;
                justify-content: center;
                font-size: 20px;
            }
            
            /* Score Grid */
            .scores-grid {
                display: grid;
                grid-template-columns: repeat(auto-fit, minmax(160px, 1fr));
                gap: 25px;
                margin: 30px 0;
            }
            
            .overall-score {
                grid-column: 1 / -1;
                background: linear-gradient(135deg, rgba(16, 185, 129, 0.1), rgba(59, 130, 246, 0.1));
                border: 2px solid rgba(16, 185, 129, 0.3);
                border-radius: 20px;
                padding: 40px;
                text-align: center;
                backdrop-filter: blur(20px);
                box-shadow: 0 15px 35px rgba(16, 185, 129, 0.1);
            }
            
            .overall-score-value {
                font-size: 4rem;
                font-weight: 900;
                background: linear-gradient(135deg, #10B981, #3B82F6);
                -webkit-background-clip: text;
                -webkit-text-fill-color: transparent;
                background-clip: text;
                margin-bottom: 10px;
                text-shadow: 0 0 30px rgba(16, 185, 129, 0.5);
            }
            
            .overall-score-label {
                color: #94A3B8;
                font-size: 1.2rem;
                font-weight: 600;
                text-transform: uppercase;
                letter-spacing: 2px;
            }
            
            /* Stats Grid */
            .stats-grid {
                display: grid;
                grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
                gap: 20px;
                margin: 30px 0;
            }
            
            .stat-card {
                background: linear-gradient(135deg, rgba(30, 41, 59, 0.8), rgba(15, 23, 42, 0.8));
                border: 1px solid rgba(51, 65, 85, 0.5);
                border-radius: 16px;
                padding: 25px;
                text-align: center;
                backdrop-filter: blur(10px);
                box-shadow: 0 10px 25px rgba(0, 0, 0, 0.2);
                transition: all 0.3s ease;
                position: relative;
                overflow: hidden;
            }
            
            .stat-card::before {
                content: '';
                position: absolute;
                top: 0;
                left: 0;
                right: 0;
                height: 1px;
                background: linear-gradient(90deg, transparent, #10B981, transparent);
            }
            
            .stat-value {
                font-size: 2.2rem;
                font-weight: 800;
                color: #10B981;
                margin-bottom: 8px;
                text-shadow: 0 0 15px rgba(16, 185, 129, 0.3);
            }
            
            .stat-label {
                color: #94A3B8;
                font-size: 0.9rem;
                font-weight: 500;
                text-transform: uppercase;
                letter-spacing: 1px;
            }
            
            /* Findings Styles */
            .findings-container {
                margin: 30px 0;
            }
            
            .finding-item {
                background: linear-gradient(135deg, rgba(30, 41, 59, 0.9), rgba(15, 23, 42, 0.9));
                border: 1px solid rgba(51, 65, 85, 0.5);
                border-radius: 16px;
                padding: 30px;
                margin: 20px 0;
                backdrop-filter: blur(15px);
                box-shadow: 0 15px 30px rgba(0, 0, 0, 0.2);
                position: relative;
                overflow: hidden;
            }
            
            .finding-item.critical {
                border-left: 4px solid #DC2626;
                background: linear-gradient(135deg, rgba(220, 38, 38, 0.1), rgba(15, 23, 42, 0.9));
            }
            
            .finding-item.high {
                border-left: 4px solid #EF4444;
                background: linear-gradient(135deg, rgba(239, 68, 68, 0.1), rgba(15, 23, 42, 0.9));
            }
            
            .finding-item.medium {
                border-left: 4px solid #F59E0B;
                background: linear-gradient(135deg, rgba(245, 158, 11, 0.1), rgba(15, 23, 42, 0.9));
            }
            
            .finding-item.low {
                border-left: 4px solid #10B981;
                background: linear-gradient(135deg, rgba(16, 185, 129, 0.1), rgba(15, 23, 42, 0.9));
            }
            
            .finding-header {
                display: flex;
                justify-content: space-between;
                align-items: center;
                margin-bottom: 20px;
                flex-wrap: wrap;
                gap: 15px;
            }
            
            .finding-title {
                font-size: 1.3rem;
                font-weight: 700;
                color: #FFFFFF;
                text-transform: uppercase;
                letter-spacing: 1px;
            }
            
            .finding-route {
                font-size: 0.9rem;
                color: #64748B;
                font-family: 'Monaco', 'Consolas', monospace;
                background: rgba(51, 65, 85, 0.5);
                padding: 8px 12px;
                border-radius: 8px;
                margin: 10px 0;
                word-break: break-all;
            }
            
            .finding-evidence {
                color: #CBD5E1;
                margin: 15px 0;
                line-height: 1.7;
                font-size: 1rem;
            }
            
            .solution-box {
                background: linear-gradient(135deg, rgba(16, 185, 129, 0.1), rgba(6, 78, 59, 0.1));
                border: 1px solid rgba(16, 185, 129, 0.3);
                border-radius: 12px;
                padding: 25px;
                margin-top: 20px;
            }
            
            .solution-title {
                font-weight: 700;
                color: #10B981;
                font-size: 1.1rem;
                margin-bottom: 15px;
                text-transform: uppercase;
                letter-spacing: 1px;
            }
            
            .remediation-steps {
                margin-top: 20px;
            }
            
            .remediation-steps ol {
                padding-left: 25px;
                color: #CBD5E1;
            }
            
            .remediation-steps li {
                margin: 10px 0;
                line-height: 1.6;
            }
            
            .metadata-tags {
                display: flex;
                gap: 10px;
                margin-top: 15px;
                flex-wrap: wrap;
            }
            
            .metadata-tag {
                background: rgba(51, 65, 85, 0.6);
                color: #94A3B8;
                padding: 6px 12px;
                border-radius: 20px;
                font-size: 0.8rem;
                font-weight: 500;
            }
            
            /* Performance Issues */
            .issue-list {
                margin: 20px 0;
            }
            
            .issue-item {
                background: rgba(30, 41, 59, 0.6);
                border-radius: 12px;
                padding: 20px;
                margin: 15px 0;
                border-left: 3px solid #F59E0B;
            }
            
            .issue-title {
                font-weight: 600;
                color: #FFFFFF;
                margin-bottom: 8px;
            }
            
            .issue-description {
                color: #94A3B8;
                font-size: 0.95rem;
                line-height: 1.6;
            }
            
            /* Discovery Results */
            .discovery-grid {
                display: grid;
                grid-template-columns: repeat(auto-fit, minmax(350px, 1fr));
                gap: 30px;
                margin: 30px 0;
            }
            
            .discovery-section {
                background: linear-gradient(135deg, rgba(30, 41, 59, 0.8), rgba(15, 23, 42, 0.8));
                border: 1px solid rgba(51, 65, 85, 0.5);
                border-radius: 16px;
                padding: 25px;
                backdrop-filter: blur(10px);
            }
            
            .discovery-title {
                color: #10B981;
                font-size: 1.2rem;
                font-weight: 700;
                margin-bottom: 20px;
                text-transform: uppercase;
                letter-spacing: 1px;
            }
            
            .discovery-list {
                max-height: 300px;
                overflow-y: auto;
                scrollbar-width: thin;
                scrollbar-color: #10B981 rgba(51, 65, 85, 0.3);
            }
            
            .discovery-item {
                padding: 8px 0;
                border-bottom: 1px solid rgba(51, 65, 85, 0.3);
                font-family: 'Monaco', 'Consolas', monospace;
                font-size: 0.85rem;
                color: #CBD5E1;
                word-break: break-all;
            }
            
            .discovery-item:last-child {
                border-bottom: none;
            }
            
            /* Page Break */
            .page-break {
                page-break-before: always;
            }
            
            /* Footer */
            .footer {
                text-align: center;
                margin-top: 80px;
                padding: 40px;
                color: #64748B;
                border-top: 1px solid rgba(51, 65, 85, 0.3);
                background: linear-gradient(135deg, rgba(15, 23, 42, 0.8), rgba(30, 41, 59, 0.8));
                border-radius: 16px;
                backdrop-filter: blur(10px);
            }
            
            .footer-logo {
                font-size: 1.5rem;
                font-weight: 800;
                background: linear-gradient(135deg, #10B981, #3B82F6);
                -webkit-background-clip: text;
                -webkit-text-fill-color: transparent;
                background-clip: text;
                margin-bottom: 10px;
            }
            
            /* Print Styles */
            @media print {
                body {
                    background: #0F172A !important;
                    -webkit-print-color-adjust: exact;
                    color-adjust: exact;
                }
                
                .container {
                    max-width: none !important;
                    margin: 0 !important;
                    padding: 20px !important;
                }
                
                .page-break {
                    page-break-before: always !important;
                }
            }
        </style>
    </head>
    <body>
        <div class="container">
            <!-- Cover Page -->
            <div class="cover-page">
                <div class="logo-section">
                    <h1 class="main-title">WebAudit AI</h1>
                    <p class="subtitle">Premium Security Analysis Report</p>
                </div>
                
                <div class="cover-url-box">
                    <div class="target-label">🎯 Target Website</div>
                    <div class="target-url">${safeReportData.url}</div>
                    <div class="scan-date">🕒 Generated on ${new Date(
                      safeReportData.timestamp
                    ).toLocaleDateString("en-US", {
                      weekday: "long",
                      year: "numeric",
                      month: "long",
                      day: "numeric",
                      hour: "2-digit",
                      minute: "2-digit",
                      timeZoneName: "short",
                    })}</div>
                </div>
                
                <div style="margin-top: 60px; color: #64748B; font-size: 1rem;">
                    🚀 Powered by Advanced AI Security Analysis & Machine Learning
                </div>
            </div>

            <!-- Executive Summary -->
            <div class="section-card page-break">
                <h2 class="section-title">
                    <div class="section-icon">📊</div>
                    Executive Summary
                </h2>
                
                ${
                  safeReportData.healthCheck?.overallScore
                    ? `
                    <div class="overall-score">
                        <div class="overall-score-value">${safeReportData.healthCheck.overallScore}/100</div>
                        <div class="overall-score-label">Overall Health Score</div>
                    </div>
                `
                    : ""
                }
                
                ${
                  safeReportData.healthCheck?.scores
                    ? `
                    <div class="scores-grid">
                        ${Object.entries(safeReportData.healthCheck.scores)
                          .map(([key, score]) =>
                            getScoreBadge(
                              score,
                              key.charAt(0).toUpperCase() + key.slice(1)
                            )
                          )
                          .join("")}
                    </div>
                `
                    : ""
                }
                
                <div class="stats-grid">
                    <div class="stat-card">
                        <div class="stat-value">${
                          safeReportData.crawlerResults.totalPages
                        }</div>
                        <div class="stat-label">Pages Discovered</div>
                    </div>
                    <div class="stat-card">
                        <div class="stat-value">${
                          safeReportData.crawlerResults.totalEndpoints
                        }</div>
                        <div class="stat-label">API Endpoints</div>
                    </div>
                    <div class="stat-card">
                        <div class="stat-value">${
                          safeReportData.securityFindings.length
                        }</div>
                        <div class="stat-label">Security Issues</div>
                    </div>
                    <div class="stat-card">
                        <div class="stat-value">${
                          safeReportData.securityFingerprints.length
                        }</div>
                        <div class="stat-label">Fingerprints</div>
                    </div>
                </div>
                
                <div style="margin-top: 40px; padding: 25px; background: linear-gradient(135deg, rgba(16, 185, 129, 0.1), rgba(6, 78, 59, 0.1)); border-radius: 16px; border: 1px solid rgba(16, 185, 129, 0.3);">
                    <h3 style="color: #10B981; margin-bottom: 15px; font-size: 1.2rem; font-weight: 700;">🔍 Scan Overview</h3>
                    <ul style="color: #CBD5E1; line-height: 1.8; list-style: none; padding-left: 0;">
                        <li>✅ Deep crawling analysis performed</li>
                        <li>🛡️ Comprehensive security testing completed</li>
                        <li>⚡ Performance metrics analyzed</li>
                        <li>♿ Accessibility standards evaluated</li>
                        <li>📱 PWA capabilities assessed</li>
                        <li>🔍 SEO optimization reviewed</li>
                    </ul>
                </div>
            </div>

            <!-- Performance Analysis -->
            ${
              safeReportData.healthCheck?.issueBreakdown?.performance
                ? `
                <div class="section-card page-break">
                    <h2 class="section-title">
                        <div class="section-icon">⚡</div>
                        Performance Analysis
                    </h2>
                    
                    ${getScoreBadge(
                      safeReportData.healthCheck.scores.performance,
                      "Performance Score"
                    )}
                    
                    ${
                      safeReportData.healthCheck.issueBreakdown.performance
                        .issues.length > 0
                        ? `
                        <h3 style="color: #FFFFFF; margin: 30px 0 20px 0; font-size: 1.4rem;">Performance Issues</h3>
                        <div class="issue-list">
                            ${safeReportData.healthCheck.issueBreakdown.performance.issues
                              .map(
                                (issue) => `
                                <div class="issue-item">
                                    <div class="issue-title">${issue.description}</div>
                                    <div class="issue-description">
                                        Current: ${issue.currentValue}${issue.unit} | Target: ${issue.targetValue}${issue.unit}
                                    </div>
                                </div>
                            `
                              )
                              .join("")}
                        </div>
                    `
                        : ""
                    }
                    
                    ${
                      safeReportData.healthCheck.issueBreakdown.performance
                        .recommendations.length > 0
                        ? `
                        <h3 style="color: #10B981; margin: 30px 0 15px 0; font-size: 1.2rem;">🚀 Recommendations</h3>
                        <ul style="color: #CBD5E1; line-height: 1.8; padding-left: 25px;">
                            ${safeReportData.healthCheck.issueBreakdown.performance.recommendations
                              .map((rec) => `<li>${rec}</li>`)
                              .join("")}
                        </ul>
                    `
                        : ""
                    }
                </div>
            `
                : ""
            }

            <!-- Accessibility Analysis -->
            ${
              safeReportData.healthCheck?.issueBreakdown?.accessibility
                ? `
                <div class="section-card">
                    <h2 class="section-title">
                        <div class="section-icon">♿</div>
                        Accessibility Analysis
                    </h2>
                    
                    ${getScoreBadge(
                      safeReportData.healthCheck.scores.accessibility,
                      "Accessibility Score"
                    )}
                    
                    ${
                      safeReportData.healthCheck.issueBreakdown.accessibility
                        .stats
                        ? `
                        <div class="stats-grid">
                            <div class="stat-card">
                                <div class="stat-value">${safeReportData.healthCheck.issueBreakdown.accessibility.stats.totalImages}</div>
                                <div class="stat-label">Total Images</div>
                            </div>
                            <div class="stat-card">
                                <div class="stat-value">${safeReportData.healthCheck.issueBreakdown.accessibility.stats.imagesWithAlt}</div>
                                <div class="stat-label">Images with Alt Text</div>
                            </div>
                            <div class="stat-card">
                                <div class="stat-value">${safeReportData.healthCheck.issueBreakdown.accessibility.stats.totalHeadings}</div>
                                <div class="stat-label">Total Headings</div>
                            </div>
                            <div class="stat-card">
                                <div class="stat-value">${safeReportData.healthCheck.issueBreakdown.accessibility.stats.focusableElements}</div>
                                <div class="stat-label">Focusable Elements</div>
                            </div>
                        </div>
                    `
                        : ""
                    }
                    
                    ${
                      safeReportData.healthCheck.issueBreakdown.accessibility
                        .issues.length > 0
                        ? `
                        <h3 style="color: #FFFFFF; margin: 30px 0 20px 0; font-size: 1.4rem;">Accessibility Issues</h3>
                        <div class="issue-list">
                            ${safeReportData.healthCheck.issueBreakdown.accessibility.issues
                              .map(
                                (issue) => `
                                <div class="issue-item">
                                    <div class="issue-title">${
                                      issue.description
                                    }</div>
                                    <div class="issue-description">
                                        Severity: ${issue.severity.toUpperCase()} ${
                                  issue.count ? `| Count: ${issue.count}` : ""
                                }
                                    </div>
                                </div>
                            `
                              )
                              .join("")}
                        </div>
                    `
                        : ""
                    }
                </div>
            `
                : ""
            }

            <!-- SEO Analysis -->
            ${
              safeReportData.healthCheck?.issueBreakdown?.seo
                ? `
                <div class="section-card">
                    <h2 class="section-title">
                        <div class="section-icon">🔍</div>
                        SEO Analysis
                    </h2>
                    
                    ${getScoreBadge(
                      safeReportData.healthCheck.scores.seo,
                      "SEO Score"
                    )}
                    
                    ${
                      safeReportData.healthCheck.issueBreakdown.seo
                        .currentValues
                        ? `
                        <div style="background: linear-gradient(135deg, rgba(30, 41, 59, 0.8), rgba(15, 23, 42, 0.8)); border-radius: 16px; padding: 25px; margin: 30px 0; border: 1px solid rgba(51, 65, 85, 0.5);">
                            <h3 style="color: #10B981; margin-bottom: 20px; font-size: 1.2rem;">SEO Metrics</h3>
                            <div style="color: #CBD5E1; line-height: 1.8;">
                                <p><strong>Title:</strong> ${safeReportData.healthCheck.issueBreakdown.seo.currentValues.title} (${safeReportData.healthCheck.issueBreakdown.seo.currentValues.titleLength} chars)</p>
                                <p><strong>Meta Description:</strong> ${safeReportData.healthCheck.issueBreakdown.seo.currentValues.metaDescription} (${safeReportData.healthCheck.issueBreakdown.seo.currentValues.metaDescriptionLength} chars)</p>
                                <p><strong>Language:</strong> ${safeReportData.healthCheck.issueBreakdown.seo.currentValues.language}</p>
                                <p><strong>H1 Count:</strong> ${safeReportData.healthCheck.issueBreakdown.seo.currentValues.h1Count}</p>
                            </div>
                        </div>
                    `
                        : ""
                    }
                </div>
            `
                : ""
            }

            <!-- Security Findings -->
            ${
              safeReportData.securityFindings.length > 0
                ? `
                <div class="section-card page-break">
                    <h2 class="section-title">
                        <div class="section-icon">🛡️</div>
                        Security Findings
                    </h2>
                    
                    <div class="findings-container">
                        ${safeReportData.securityFindings
                          .slice(0, 10)
                          .map(
                            (finding) => `
                            <div class="finding-item ${finding.severity}">
                                <div class="finding-header">
                                    <div class="finding-title">${
                                      finding.attack
                                    }</div>
                                    ${getSeverityBadge(finding.severity)}
                                </div>
                                
                                <div class="finding-route">${
                                  finding.route
                                }</div>
                                
                                <div class="finding-evidence">
                                    <strong>Evidence:</strong> ${
                                      finding.evidence
                                    }
                                </div>
                                
                                <div class="solution-box">
                                    <div class="solution-title">💡 Solution</div>
                                    <p style="color: #CBD5E1; margin-bottom: 15px;">${
                                      finding.solution.solution
                                    }</p>
                                    
                                    <div class="remediation-steps">
                                        <strong style="color: #10B981;">🔧 Remediation Steps:</strong>
                                        <ol>
                                            ${finding.solution.remediation_steps
                                              .slice(0, 3)
                                              .map((step) => `<li>${step}</li>`)
                                              .join("")}
                                        </ol>
                                    </div>
                                    
                                    <div class="metadata-tags">
                                        <span class="metadata-tag">CWE: ${
                                          finding.solution.cwe_cve
                                        }</span>
                                        <span class="metadata-tag">Priority: ${
                                          finding.solution.priority
                                        }</span>
                                        <span class="metadata-tag">Effort: ${
                                          finding.solution.estimated_effort
                                        }</span>
                                        <span class="metadata-tag">Confidence: ${
                                          finding.solution.confidence
                                        }</span>
                                    </div>
                                </div>
                            </div>
                        `
                          )
                          .join("")}
                        
                        ${
                          safeReportData.securityFindings.length > 10
                            ? `
                            <div style="text-align: center; margin: 30px 0; padding: 20px; background: rgba(30, 41, 59, 0.6); border-radius: 12px; color: #94A3B8;">
                                ... and ${
                                  safeReportData.securityFindings.length - 10
                                } more security findings in the complete report
                            </div>
                        `
                            : ""
                        }
                    </div>
                </div>
            `
                : ""
            }

            <!-- Discovery Results -->
            <div class="section-card page-break">
                <h2 class="section-title">
                    <div class="section-icon">🔍</div>
                    Discovery Results
                </h2>
                
                <div class="discovery-grid">
                    <div class="discovery-section">
                        <div class="discovery-title">🌐 Pages Discovered (${
                          safeReportData.crawlerResults.totalPages
                        })</div>
                        <div class="discovery-list">
                            ${safeReportData.crawlerResults.quickCheck.pages
                              .slice(0, 15)
                              .map(
                                (page) =>
                                  `<div class="discovery-item">• ${page}</div>`
                              )
                              .join("")}
                            ${
                              safeReportData.crawlerResults.quickCheck.pages
                                .length > 15
                                ? `<div class="discovery-item" style="font-style: italic; color: #6B7280;">... and ${
                                    safeReportData.crawlerResults.quickCheck
                                      .pages.length - 15
                                  } more pages</div>`
                                : ""
                            }
                        </div>
                    </div>
                    
                    <div class="discovery-section">
                        <div class="discovery-title">🚀 API Endpoints (${
                          safeReportData.crawlerResults.totalEndpoints
                        })</div>
                        <div class="discovery-list">
                            ${safeReportData.crawlerResults.quickCheck.apiEndpoints
                              .slice(0, 15)
                              .map(
                                (endpoint) =>
                                  `<div class="discovery-item">• ${endpoint}</div>`
                              )
                              .join("")}
                            ${
                              safeReportData.crawlerResults.quickCheck
                                .apiEndpoints.length > 15
                                ? `<div class="discovery-item" style="font-style: italic; color: #6B7280;">... and ${
                                    safeReportData.crawlerResults.quickCheck
                                      .apiEndpoints.length - 15
                                  } more endpoints</div>`
                                : ""
                            }
                        </div>
                    </div>
                </div>
            </div>

            <!-- Footer -->
            <div class="footer">
                <div class="footer-logo">WebAudit AI</div>
                <p><strong>Advanced Security Analysis Platform</strong></p>
                <p>This comprehensive report was generated using cutting-edge AI technology and automated security testing tools.</p>
                <p>🔒 Confidential Security Assessment • Generated on ${new Date().toLocaleString()}</p>
                <p style="margin-top: 20px; font-size: 0.9rem; color: #475569;">
                    © 2025 WebAudit AI - Protecting the digital world, one scan at a time.
                </p>
            </div>
        </div>
    </body>
    </html>
  `;
};

// Generate PDF from HTML using Puppeteer
export const generateAuditPDF = async (reportData) => {
  let browser;
  try {
    console.log("🚀 Starting PDF generation...");

    // Launch browser
    browser = await puppeteer.launch({
      headless: "new",
      args: [
        "--no-sandbox",
        "--disable-setuid-sandbox",
        "--disable-dev-shm-usage",
        "--disable-accelerated-2d-canvas",
        "--no-first-run",
        "--no-zygote",
        "--disable-gpu",
      ],
    });

    const page = await browser.newPage();

    // Generate HTML content
    console.log("📄 Generating HTML content...");
    const htmlContent = generateReportHTML(reportData);

    // Set content and wait for it to load
    console.log("⏳ Loading HTML content in browser...");
    await page.setContent(htmlContent, {
      waitUntil: "networkidle0",
      timeout: 30000,
    });

    // Configure PDF options
    const pdfOptions = {
      format: "A4",
      printBackground: true,
      margin: {
        top: "20mm",
        right: "15mm",
        bottom: "20mm",
        left: "15mm",
      },
      displayHeaderFooter: true,
      headerTemplate: "<div></div>",
      footerTemplate: `
        <div style="font-size: 10px; color: #6B7280; width: 100%; text-align: center; margin-top: 10px;">
          <span>Page <span class="pageNumber"></span> of <span class="totalPages"></span></span>
        </div>
      `,
    };

    // Generate PDF buffer
    console.log("🎨 Generating PDF...");
    const pdfBuffer = await page.pdf(pdfOptions);

    await browser.close();
    console.log("✅ PDF generated successfully!");
    return pdfBuffer;
  } catch (error) {
    console.error("❌ PDF generation failed:", error);
    if (browser) {
      await browser.close();
    }
    throw error;
  }
};

// Helper function to save PDF to file
export const savePDFToFile = async (reportData, outputDir = "./reports") => {
  try {
    // Ensure output directory exists
    if (!fs.existsSync(outputDir)) {
      fs.mkdirSync(outputDir, { recursive: true });
    }

    // Generate PDF
    const pdfBuffer = await generateAuditPDF(reportData);

    // Create filename
    const urlDomain = reportData.url
      .replace(/https?:\/\//, "")
      .replace(/[\/\:]/g, "_");
    const timestamp = new Date().toISOString().split("T")[0];
    const filename = `WebAudit-AI-Report-${urlDomain}-${timestamp}.pdf`;
    const filePath = path.join(outputDir, filename);

    // Save to file
    fs.writeFileSync(filePath, pdfBuffer);

    return {
      success: true,
      filePath,
      filename,
      size: pdfBuffer.length,
    };
  } catch (error) {
    console.error("Error saving PDF:", error);
    return {
      success: false,
      error: error.message,
    };
  }
};
