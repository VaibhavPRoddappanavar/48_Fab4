// test-workflow.js - Test the single URL audit workflow
import { AuditOrchestrator } from "./audit-orchestrator.js";

async function testSingleUrlWorkflow(url = null, scanType = "quick") {
  console.log("🧪 Testing Single URL Security Audit Workflow");
  console.log("=".repeat(50));

  // Use provided URL or default to the demo URL
  const testUrl = url || "https://demo.owasp-juice.shop";

  console.log(`🎯 Test Target: ${testUrl}`);
  console.log(`🔍 Scan Type: ${scanType}`);
  console.log("=".repeat(50));

  try {
    const orchestrator = new AuditOrchestrator();
    const result = await orchestrator.runSingleUrlAudit(testUrl, scanType);

    if (result.success) {
      console.log("\n✅ SINGLE URL WORKFLOW TEST SUCCESSFUL!");
      console.log("📊 Test Results Summary:");
      console.log(`   Overall Score: ${result.summary.scores.overall}/100`);
      console.log(`   Security Score: ${result.summary.scores.security}/100`);
      console.log(`   Health Score: ${result.summary.scores.health}/100`);
      console.log(`   Risk Level: ${result.summary.riskLevel}`);
      console.log(`   Total Findings: ${result.summary.stats.totalFindings}`);
      console.log(`   Critical Issues: ${result.summary.stats.criticalIssues}`);
      console.log(`   Report File: ${result.reportFile}`);

      console.log("\n🔝 Top Issues Found:");
      result.summary.topIssues.slice(0, 3).forEach((issue, i) => {
        console.log(
          `   ${i + 1}. ${issue.type.toUpperCase()} - ${issue.severity}`
        );
        console.log(`      Route: ${issue.route}`);
        console.log(`      Solution: ${issue.solution}`);
      });

      return result;
    } else {
      console.log("\n❌ SINGLE URL WORKFLOW TEST FAILED!");
      console.error(`Error: ${result.error}`);
      return result;
    }
  } catch (error) {
    console.error("\n💥 SINGLE URL WORKFLOW TEST CRASHED!");
    console.error(`Fatal Error: ${error.message}`);
    return { success: false, error: error.message };
  }
}

// Export the function for use in other modules
export { testSingleUrlWorkflow };

// Run test if called directly
if (process.argv[1].endsWith("test-workflow.js")) {
  const urlArg = process.argv[2];
  const scanTypeArg = process.argv[3] || "quick";
  testSingleUrlWorkflow(urlArg, scanTypeArg).catch(console.error);
}
