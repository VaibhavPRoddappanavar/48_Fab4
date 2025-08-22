// api-routes.js - Express API Routes for Security Audit
import express from "express";
import cors from "cors";
import { testSingleUrlWorkflow } from "./test-workflow.js";
import { generateAuditPDF, savePDFToFile } from "./pdf-generator.js";
import fs from "fs";
import path from "path";

const router = express.Router();

// Enable CORS for all routes
router.use(cors());

// In-memory storage for audit results (in production, use Redis/Database)
const auditResults = new Map();

// POST /api/audit - Start complete audit
router.post("/audit", async (req, res) => {
  try {
    const { url, scanType = "quick" } = req.body;

    if (!url) {
      return res.status(400).json({
        success: false,
        error: "URL is required",
        message: "Please provide a valid URL to audit",
      });
    }

    // Validate URL format
    try {
      new URL(url);
    } catch (error) {
      return res.status(400).json({
        success: false,
        error: "Invalid URL format",
        message: "Please provide a valid URL (e.g., https://example.com)",
      });
    }

    // Validate scan type
    if (!["quick", "deep"].includes(scanType)) {
      return res.status(400).json({
        success: false,
        error: "Invalid scan type",
        message: "Scan type must be 'quick' or 'deep'",
      });
    }

    console.log(`🚀 Starting ${scanType} audit for: ${url}`);

    // Generate audit ID
    const auditId = `audit_${Date.now()}_${Math.random()
      .toString(36)
      .substr(2, 9)}`;

    // Store initial status
    auditResults.set(auditId, {
      status: "running",
      url,
      scanType,
      startTime: new Date().toISOString(),
      progress: "Initializing audit pipeline...",
    });

    // Return audit ID immediately (non-blocking)
    res.json({
      success: true,
      auditId,
      message: `${scanType} audit started for ${url}`,
      estimatedTime: scanType === "quick" ? "2-3 minutes" : "5-10 minutes",
      statusEndpoint: `/api/audit/${auditId}/status`,
      resultEndpoint: `/api/audit/${auditId}/results`,
    });

    // Run audit asynchronously using the test workflow
    runAuditAsync(auditId, url, scanType);
  } catch (error) {
    console.error("Audit start error:", error);
    res.status(500).json({
      success: false,
      error: error.message,
      message: "Failed to start audit",
    });
  }
});

// Async audit runner using test-workflow.js
async function runAuditAsync(auditId, url, scanType) {
  try {
    console.log(`🚀 Starting ${scanType} audit for: ${url} (ID: ${auditId})`);

    // Update progress
    auditResults.set(auditId, {
      ...auditResults.get(auditId),
      progress: "Preparing URL for security testing...",
    });

    console.log(
      `📝 Audit ${auditId} progress updated: Preparing URL for security testing...`
    );

    // Use the test workflow function
    console.log(
      `🔧 Calling testSingleUrlWorkflow with URL: ${url}, scanType: ${scanType}`
    );
    const result = await testSingleUrlWorkflow(url, scanType);

    console.log(
      `📊 Test workflow completed for ${auditId}:`,
      result.success ? "SUCCESS" : "FAILED"
    );

    // Store final results
    auditResults.set(auditId, {
      status: result.success ? "completed" : "failed",
      url,
      scanType,
      startTime: auditResults.get(auditId).startTime,
      endTime: new Date().toISOString(),
      result: result.success ? result.results : null,
      summary: result.success ? result.summary : null,
      error: result.success ? null : result.error,
      reportFile: result.reportFile || null,
      progress: result.success
        ? "Audit completed successfully"
        : `Failed: ${result.error}`,
    });

    console.log(`✅ Audit ${auditId} completed successfully`);
  } catch (error) {
    console.error(`❌ Audit ${auditId} failed:`, error);
    console.error(`❌ Error stack:`, error.stack);

    // Ensure the audit record still exists in memory with error state
    const existingAudit = auditResults.get(auditId);
    if (existingAudit) {
      auditResults.set(auditId, {
        ...existingAudit,
        status: "failed",
        endTime: new Date().toISOString(),
        error: error.message || "Unknown error occurred",
        progress: `Failed: ${error.message || "Unknown error occurred"}`,
      });
    } else {
      console.error(
        `❌ Critical: Audit ${auditId} not found in memory during error handling`
      );
    }
  }
}

// GET /api/audit/:id/status - Check audit status
router.get("/audit/:id/status", (req, res) => {
  const auditId = req.params.id;
  const audit = auditResults.get(auditId);

  if (!audit) {
    return res.status(404).json({
      success: false,
      error: "Audit not found",
      message: "Invalid audit ID or audit expired",
    });
  }

  const response = {
    success: true,
    auditId,
    status: audit.status,
    url: audit.url,
    scanType: audit.scanType,
    startTime: audit.startTime,
    progress: audit.progress,
  };

  if (audit.endTime) {
    response.endTime = audit.endTime;

    // Calculate duration
    const duration = new Date(audit.endTime) - new Date(audit.startTime);
    response.duration = `${(duration / 1000).toFixed(1)}s`;
  }

  if (audit.error) {
    response.error = audit.error;
  }

  res.json(response);
});

// GET /api/audit/:id/results - Get full audit results
router.get("/audit/:id/results", (req, res) => {
  const auditId = req.params.id;
  const audit = auditResults.get(auditId);

  if (!audit) {
    return res.status(404).json({
      success: false,
      error: "Audit not found",
      message: "Invalid audit ID or audit expired",
    });
  }

  if (audit.status === "running") {
    return res.status(202).json({
      success: false,
      message: "Audit still in progress",
      status: audit.status,
      progress: audit.progress,
    });
  }

  if (audit.status === "failed") {
    return res.status(500).json({
      success: false,
      error: audit.error,
      message: "Audit failed",
    });
  }

  // Return complete results
  res.json({
    success: true,
    auditId,
    results: audit.result,
    summary: audit.summary,
    reportFile: audit.reportFile,
    metadata: {
      url: audit.url,
      scanType: audit.scanType,
      startTime: audit.startTime,
      endTime: audit.endTime,
      duration: `${(
        (new Date(audit.endTime) - new Date(audit.startTime)) /
        1000
      ).toFixed(1)}s`,
    },
  });
});

// GET /api/audit/:id/download - Download full report
router.get("/audit/:id/download", (req, res) => {
  const auditId = req.params.id;
  const audit = auditResults.get(auditId);

  if (!audit || !audit.reportFile) {
    return res.status(404).json({
      success: false,
      error: "Report not found",
    });
  }

  const reportPath = path.resolve(audit.reportFile);

  if (!fs.existsSync(reportPath)) {
    return res.status(404).json({
      success: false,
      error: "Report file not found on disk",
    });
  }

  res.download(reportPath, `security-audit-report-${auditId}.json`);
});

// GET /api/audit/:id/download-pdf - Download report as PDF
router.get("/audit/:id/download-pdf", async (req, res) => {
  const auditId = req.params.id;
  const audit = auditResults.get(auditId);

  if (!audit) {
    return res.status(404).json({
      success: false,
      error: "Audit not found",
      message: "Invalid audit ID or audit expired",
    });
  }

  if (!audit.result) {
    return res.status(404).json({
      success: false,
      error: "Report not found or audit not completed",
      message: "Audit may still be in progress or failed",
    });
  }

  try {
    console.log(`📄 Generating PDF for audit ${auditId}`);
    console.log(`📊 Audit status: ${audit.status}`);
    console.log(`📈 Report data structure:`, {
      hasUrl: !!audit.result.url,
      hasTimestamp: !!audit.result.timestamp,
      hasCrawlerResults: !!audit.result.crawlerResults,
      hasSecurityFindings: !!audit.result.securityFindings,
      securityFindingsLength: audit.result.securityFindings?.length || 0,
      hasHealthcheckResults: !!audit.result.healthcheckResults,
      healthcheckResultsLength: audit.result.healthcheckResults?.length || 0,
    });

    // Generate PDF buffer
    const pdfBuffer = await generateAuditPDF(audit.result);

    // Set headers for PDF download
    const urlDomain = (audit.url || "unknown")
      .replace(/https?:\/\//, "")
      .replace(/[\/\:]/g, "_");
    const timestamp = new Date().toISOString().split("T")[0];
    const filename = `WebAudit-AI-Report-${urlDomain}-${timestamp}.pdf`;

    res.setHeader("Content-Type", "application/pdf");
    res.setHeader("Content-Disposition", `attachment; filename="${filename}"`);
    res.setHeader("Content-Length", pdfBuffer.length);

    // Send PDF buffer
    res.send(pdfBuffer);

    console.log(
      `✅ PDF generated successfully for audit ${auditId}, size: ${pdfBuffer.length} bytes`
    );
  } catch (error) {
    console.error(`❌ PDF generation failed for audit ${auditId}:`, error);
    console.error(`❌ Error stack:`, error.stack);
    res.status(500).json({
      success: false,
      error: "Failed to generate PDF report",
      message: error.message,
      details: process.env.NODE_ENV === "development" ? error.stack : undefined,
    });
  }
});

// GET /api/health - API health check
router.get("/health", (req, res) => {
  res.json({
    success: true,
    service: "Security Audit API",
    version: "1.0.0",
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    memory: process.memoryUsage(),
    activeAudits: Array.from(auditResults.values()).filter(
      (a) => a.status === "running"
    ).length,
    totalAudits: auditResults.size,
  });
});

// GET /api/audits - List recent audits
router.get("/audits", (req, res) => {
  const limit = parseInt(req.query.limit) || 10;
  const audits = Array.from(auditResults.entries())
    .sort((a, b) => new Date(b[1].startTime) - new Date(a[1].startTime))
    .slice(0, limit)
    .map(([id, audit]) => ({
      auditId: id,
      url: audit.url,
      scanType: audit.scanType,
      status: audit.status,
      startTime: audit.startTime,
      endTime: audit.endTime,
      summary: audit.summary
        ? {
            riskLevel: audit.summary.riskLevel,
            overallScore: audit.summary.scores.overall,
            totalFindings: audit.summary.stats.totalFindings,
          }
        : null,
    }));

  res.json({
    success: true,
    audits,
    total: auditResults.size,
  });
});

export default router;
