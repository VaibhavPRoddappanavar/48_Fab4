// api-routes.js - Express API Routes for Security Audit
import express from "express";
import cors from "cors";
import { AuditOrchestrator } from "./audit-orchestrator.js";
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

    // Run audit asynchronously
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

// Async audit runner
async function runAuditAsync(auditId, url, scanType) {
  try {
    const orchestrator = new AuditOrchestrator();

    // Update progress
    auditResults.set(auditId, {
      ...auditResults.get(auditId),
      progress: "Preparing URL for security testing...",
    });

    const result = await orchestrator.runSingleUrlAudit(url, scanType);

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

    auditResults.set(auditId, {
      ...auditResults.get(auditId),
      status: "failed",
      endTime: new Date().toISOString(),
      error: error.message,
      progress: `Failed: ${error.message}`,
    });
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
