// audit-orchestrator.js - Master Security Audit Workflow
import "dotenv/config";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import { spawn, exec } from "child_process";
import { promisify } from "util";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const execAsync = promisify(exec);

// ------------------------------
// Master Audit Orchestrator
// ------------------------------
class AuditOrchestrator {
  constructor() {
    this.results = {
      url: null,
      timestamp: new Date().toISOString(),
      crawlerResults: null,
      securityFindings: null,
      securityFingerprints: null,
      healthCheck: null,
      scores: {
        security: 0,
        health: 0,
        overall: 0,
      },
      summary: null,
      executionTime: 0,
    };
  }

  // Run a command and return output
  async runCommand(command, workingDir = __dirname) {
    return new Promise((resolve, reject) => {
      exec(
        command,
        { cwd: workingDir, maxBuffer: 1024 * 1024 * 10 },
        (error, stdout, stderr) => {
          if (error) {
            console.error(`Command failed: ${command}`);
            console.error(`Error: ${error.message}`);
            reject(error);
          } else {
            resolve({ stdout, stderr });
          }
        }
      );
    });
  }

  // Step 1: Run crawler to discover URLs for security testing
  async runCrawler(url) {
    console.log(
      `🕷️ Step 1: Crawling ${url} to discover pages and endpoints...`
    );

    try {
      const command = `node crawler_fixed.js "${url}"`;
      const result = await this.runCommand(command);

      console.log("✅ Crawler completed successfully");

      // Read crawler results
      const quickCheck = JSON.parse(
        fs.readFileSync("forquickcheck.json", "utf8")
      );
      const deepCheck = JSON.parse(
        fs.readFileSync("fordeepcheck.json", "utf8")
      );

      this.results.crawlerResults = {
        quickCheck: quickCheck,
        deepCheck: deepCheck,
        totalPages: quickCheck.pages?.length || 0,
        totalEndpoints: quickCheck.apiEndpoints?.length || 0,
      };

      console.log(
        `   📊 Discovered: ${this.results.crawlerResults.totalPages} pages, ${this.results.crawlerResults.totalEndpoints} API endpoints`
      );

      return this.results.crawlerResults;
    } catch (error) {
      console.error("❌ Crawler failed:", error.message);
      throw new Error(`Crawler failed: ${error.message}`);
    }
  }

  // Step 2: Run security scans (quick or deep)
  async runSecurityScan(scanType = "quick") {
    console.log(`🔒 Step 2: Running ${scanType} security scan...`);

    try {
      const inputFile =
        scanType === "quick" ? "forquickcheck.json" : "fordeepcheck.json";
      const command = `node Security/ai-redteam-${scanType}.js "${inputFile}"`;

      const result = await this.runCommand(command);
      console.log(`✅ ${scanType} security scan completed`);

      // Read security results
      const findings = JSON.parse(
        fs.readFileSync(`Security/findings-${scanType}.json`, "utf8")
      );
      const fingerprints = JSON.parse(
        fs.readFileSync(`Security/fingerprints-${scanType}.json`, "utf8")
      );

      this.results.securityFindings = findings;
      this.results.securityFingerprints = fingerprints;

      console.log(`   🎯 Found: ${findings.length} security findings`);

      return { findings, fingerprints };
    } catch (error) {
      console.error(`❌ Security scan (${scanType}) failed:`, error.message);
      throw new Error(`Security scan failed: ${error.message}`);
    }
  }

  // Step 3: Run health check on base URL only
  async runHealthCheck(baseUrl) {
    console.log(
      `🏥 Step 3: Running comprehensive health check on base URL: ${baseUrl}...`
    );
    console.log(
      "   ℹ️  Note: Health check analyzes performance, accessibility, SEO, etc. on base URL only"
    );

    try {
      const command = `node Healthcheck/healthcheck.js "${baseUrl}"`;
      const result = await this.runCommand(command);

      console.log("✅ Health check completed");

      // Find and read health check result
      const hostname = new URL(baseUrl).hostname.replace(/\./g, "_");
      const healthFile = `Healthcheck/healthcheck_${hostname}.json`;

      if (fs.existsSync(healthFile)) {
        this.results.healthCheck = JSON.parse(
          fs.readFileSync(healthFile, "utf8")
        );
        console.log(
          `   💊 Health score: ${this.results.healthCheck.overallScore}/100 (base URL analysis)`
        );
      } else {
        throw new Error("Health check file not found");
      }

      return this.results.healthCheck;
    } catch (error) {
      console.error("❌ Health check failed:", error.message);
      throw new Error(`Health check failed: ${error.message}`);
    }
  }

  // Calculate security score based on findings
  calculateSecurityScore(findings) {
    if (!findings || findings.length === 0) {
      return 100; // Perfect score if no vulnerabilities
    }

    let totalDeduction = 0;
    const severityWeights = {
      critical: 25, // Each critical = -25 points
      high: 15, // Each high = -15 points
      medium: 8, // Each medium = -8 points
      low: 3, // Each low = -3 points
    };

    // Count findings by severity
    const severityCounts = { critical: 0, high: 0, medium: 0, low: 0 };
    findings.forEach((finding) => {
      const severity = finding.severity?.toLowerCase() || "low";
      if (severityCounts.hasOwnProperty(severity)) {
        severityCounts[severity]++;
      }
    });

    // Calculate deductions
    Object.entries(severityCounts).forEach(([severity, count]) => {
      totalDeduction += count * severityWeights[severity];
    });

    // Security score (never below 0)
    const securityScore = Math.max(0, 100 - totalDeduction);

    console.log(`   🔒 Security Analysis:`);
    console.log(
      `      Critical: ${severityCounts.critical} (-${
        severityCounts.critical * severityWeights.critical
      } pts)`
    );
    console.log(
      `      High: ${severityCounts.high} (-${
        severityCounts.high * severityWeights.high
      } pts)`
    );
    console.log(
      `      Medium: ${severityCounts.medium} (-${
        severityCounts.medium * severityWeights.medium
      } pts)`
    );
    console.log(
      `      Low: ${severityCounts.low} (-${
        severityCounts.low * severityWeights.low
      } pts)`
    );
    console.log(`      Security Score: ${securityScore}/100`);

    return {
      score: securityScore,
      breakdown: severityCounts,
      totalFindings: findings.length,
      deductions: totalDeduction,
    };
  }

  // Calculate overall score combining security and health
  calculateOverallScore(securityScore, healthScore) {
    // Weighted average: Security 60%, Health 40%
    const securityWeight = 0.6;
    const healthWeight = 0.4;

    const overallScore = Math.round(
      securityScore * securityWeight + healthScore * healthWeight
    );

    console.log(`   🎯 Overall Score Calculation:`);
    console.log(
      `      Security: ${securityScore}/100 (weight: ${securityWeight * 100}%)`
    );
    console.log(
      `      Health: ${healthScore}/100 (weight: ${healthWeight * 100}%)`
    );
    console.log(`      Overall: ${overallScore}/100`);

    return overallScore;
  }

  // Generate comprehensive summary
  generateSummary() {
    const security = this.results.scores.security;
    const health = this.results.scores.health;
    const overall = this.results.scores.overall;

    // Determine risk level
    let riskLevel, riskColor, recommendation;
    if (overall >= 90) {
      riskLevel = "LOW";
      riskColor = "🟢";
      recommendation =
        "Well secured! Monitor regularly and keep dependencies updated.";
    } else if (overall >= 75) {
      riskLevel = "MEDIUM";
      riskColor = "🟡";
      recommendation = "Good security posture with some areas for improvement.";
    } else if (overall >= 50) {
      riskLevel = "HIGH";
      riskColor = "🟠";
      recommendation =
        "Multiple security issues detected. Address critical and high severity findings immediately.";
    } else {
      riskLevel = "CRITICAL";
      riskColor = "🔴";
      recommendation =
        "Significant security vulnerabilities detected. Immediate action required.";
    }

    // Count critical issues
    const criticalIssues =
      this.results.securityFindings?.filter(
        (f) => f.severity === "critical" || f.severity === "high"
      ) || [];

    const summary = {
      riskLevel,
      riskColor,
      recommendation,
      scores: {
        overall,
        security: security.score || security,
        health,
      },
      stats: {
        totalFindings: this.results.securityFindings?.length || 0,
        criticalIssues: criticalIssues.length,
        pagesScanned: this.results.crawlerResults?.totalPages || 0,
        endpointsFound: this.results.crawlerResults?.totalEndpoints || 0,
      },
      topIssues: criticalIssues.slice(0, 5).map((issue) => ({
        type: issue.attack,
        route: issue.route,
        severity: issue.severity,
        evidence: issue.evidence,
        solution:
          issue.solution?.solution || "Review and implement security controls",
      })),
    };

    this.results.summary = summary;
    return summary;
  }

  // Save comprehensive audit report
  async saveAuditReport() {
    const hostname = new URL(this.results.url).hostname.replace(/\./g, "_");
    const reportFile = `audit-report-${hostname}.json`;

    const report = {
      ...this.results,
      reportGenerated: new Date().toISOString(),
      version: "1.0.0",
    };

    fs.writeFileSync(reportFile, JSON.stringify(report, null, 2));
    console.log(`\n📄 Comprehensive audit report saved: ${reportFile}`);
    return reportFile;
  }

  // Master orchestration method for single URL
  async runSingleUrlAudit(url, scanType = "quick") {
    const startTime = Date.now();
    this.results.url = url;

    console.log("🚀 Starting Complete Security Audit");
    console.log("=".repeat(60));
    console.log(`🎯 Target: ${url}`);
    console.log(`🔍 Scan Type: ${scanType.toUpperCase()}`);
    console.log(`⏰ Started: ${new Date().toLocaleString()}`);
    console.log("📋 Process:");
    console.log("   1. Crawl sub-routes for security testing");
    console.log("   2. Run security scan on discovered routes");
    console.log("   3. Run health check on base URL only");
    console.log("=".repeat(60));

    try {
      // Step 1: Crawl to discover routes for security testing
      await this.runCrawler(url);

      // Step 2: Run security scan on discovered routes
      await this.runSecurityScan(scanType);

      // Step 3: Run health check on base URL only
      await this.runHealthCheck(url);

      // Step 4: Calculate scores
      console.log("\n🧮 Step 4: Calculating comprehensive scores...");

      const securityScore = this.calculateSecurityScore(
        this.results.securityFindings
      );
      const healthScore = this.results.healthCheck?.overallScore || 0;
      const overallScore = this.calculateOverallScore(
        securityScore.score || securityScore,
        healthScore
      );

      this.results.scores = {
        security: securityScore,
        health: healthScore,
        overall: overallScore,
      };

      // Step 5: Generate summary
      console.log("\n📋 Step 5: Generating audit summary...");
      const summary = this.generateSummary();

      // Step 6: Save report
      this.results.executionTime = Date.now() - startTime;
      const reportFile = await this.saveAuditReport();

      // Final output
      console.log("\n" + "=".repeat(60));
      console.log("🎉 COMPLETE SECURITY AUDIT FINISHED");
      console.log("=".repeat(60));
      console.log(`${summary.riskColor} Risk Level: ${summary.riskLevel}`);
      console.log(`🎯 Overall Score: ${summary.scores.overall}/100`);
      console.log(
        `🔒 Security Score: ${summary.scores.security}/100 (${this.results.crawlerResults.totalPages} routes tested)`
      );
      console.log(
        `🏥 Health Score: ${summary.scores.health}/100 (base URL only)`
      );
      console.log(
        `⏱️ Execution Time: ${(this.results.executionTime / 1000).toFixed(1)}s`
      );
      console.log(`📊 Total Findings: ${summary.stats.totalFindings}`);
      console.log(`🚨 Critical Issues: ${summary.stats.criticalIssues}`);
      console.log(`📄 Routes Scanned: ${summary.stats.pagesScanned}`);
      console.log(`🔗 API Endpoints: ${summary.stats.endpointsFound}`);
      console.log(`\n💡 ${summary.recommendation}`);
      console.log("=".repeat(60));

      return {
        success: true,
        reportFile,
        results: this.results,
        summary,
      };
    } catch (error) {
      console.error("\n❌ Single URL audit failed:", error.message);
      return {
        success: false,
        error: error.message,
        partialResults: this.results,
      };
    }
  }

  // Legacy method - keep for backward compatibility
  async runCompleteAudit(url, scanType = "quick") {
    return this.runSingleUrlAudit(url, scanType);
  }
}

// CLI Usage
async function main() {
  const url = process.argv[2];
  const scanType = process.argv[3] || "quick";

  if (!url) {
    console.error("❌ Usage: node audit-orchestrator.js <URL> [quick|deep]");
    console.error(
      "   Example: node audit-orchestrator.js https://example.com quick"
    );
    process.exit(1);
  }

  console.log(`\n🔍 Initializing Single URL Security Audit for: ${url}`);

  const orchestrator = new AuditOrchestrator();
  const result = await orchestrator.runSingleUrlAudit(url, scanType);

  if (result.success) {
    console.log(
      `\n✅ Single URL audit completed successfully! Report: ${result.reportFile}`
    );
    process.exit(0);
  } else {
    console.error(`\n❌ Single URL audit failed: ${result.error}`);
    process.exit(1);
  }
}

// Export for use as module
export { AuditOrchestrator };

// Run CLI if called directly
if (import.meta.url === `file://${process.argv[1]}`) {
  main().catch((error) => {
    console.error("Fatal error:", error);
    process.exit(1);
  });
}
