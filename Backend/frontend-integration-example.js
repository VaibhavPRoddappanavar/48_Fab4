// frontend-integration-example.js - Example of how frontend would use the API

/**
 * Frontend Integration Guide for Single URL Security Audit API
 *
 * This example shows how your React frontend can integrate with the
 * simplified single URL security audit backend.
 *
 * Usage: Send single URL + scan type → Get comprehensive security report
 */

// Example React service function
class SecurityAuditService {
  constructor(baseURL = "http://localhost:5000/api") {
    this.baseURL = baseURL;
  }

  // Start a new security audit
  async startAudit(url, scanType = "quick") {
    const response = await fetch(`${this.baseURL}/audit`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ url, scanType }),
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    return await response.json();
  }

  // Check audit status
  async checkStatus(auditId) {
    const response = await fetch(`${this.baseURL}/audit/${auditId}/status`);

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    return await response.json();
  }

  // Get complete audit results
  async getResults(auditId) {
    const response = await fetch(`${this.baseURL}/audit/${auditId}/results`);

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    return await response.json();
  }

  // Download audit report
  async downloadReport(auditId) {
    const response = await fetch(`${this.baseURL}/audit/${auditId}/download`);

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const blob = await response.blob();
    const url = window.URL.createObjectURL(blob);

    // Create download link
    const a = document.createElement("a");
    a.href = url;
    a.download = `security-audit-report-${auditId}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);

    window.URL.revokeObjectURL(url);
  }

  // Get recent audits list
  async getRecentAudits(limit = 10) {
    const response = await fetch(`${this.baseURL}/audits?limit=${limit}`);

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    return await response.json();
  }
}

// Example React Component Usage
const ExampleReactComponent = () => {
  const [auditData, setAuditData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [progress, setProgress] = useState("");
  const [error, setError] = useState(null);

  const auditService = new SecurityAuditService();

  const startSecurityAudit = async (url, scanType) => {
    try {
      setLoading(true);
      setError(null);
      setProgress("Starting audit...");

      // Step 1: Start audit
      const startResponse = await auditService.startAudit(url, scanType);
      const auditId = startResponse.auditId;

      setProgress(startResponse.message);

      // Step 2: Poll for status
      const pollStatus = async () => {
        try {
          const statusResponse = await auditService.checkStatus(auditId);
          setProgress(statusResponse.progress);

          if (statusResponse.status === "running") {
            // Continue polling
            setTimeout(pollStatus, 3000); // Poll every 3 seconds
          } else if (statusResponse.status === "completed") {
            // Get final results
            const results = await auditService.getResults(auditId);
            setAuditData(results);
            setLoading(false);
            setProgress("Audit completed successfully!");
          } else if (statusResponse.status === "failed") {
            setError(statusResponse.error);
            setLoading(false);
            setProgress("Audit failed");
          }
        } catch (error) {
          setError(error.message);
          setLoading(false);
        }
      };

      // Start polling
      setTimeout(pollStatus, 2000);
    } catch (error) {
      setError(error.message);
      setLoading(false);
    }
  };

  return (
    <div className="security-audit-component">
      <h2>🔒 Single URL Security Audit Dashboard</h2>

      {/* Audit Form */}
      <div className="audit-form">
        <input
          type="url"
          placeholder="Enter single URL to audit (https://example.com)"
          onKeyPress={(e) => {
            if (e.key === "Enter") {
              startSecurityAudit(e.target.value, "quick");
            }
          }}
        />
        <button
          onClick={() => {
            const url = document.querySelector('input[type="url"]').value;
            startSecurityAudit(url, "quick");
          }}
          disabled={loading}
        >
          {loading ? "Running..." : "Quick Audit (2-3 min)"}
        </button>
        <button
          onClick={() => {
            const url = document.querySelector('input[type="url"]').value;
            startSecurityAudit(url, "deep");
          }}
          disabled={loading}
        >
          {loading ? "Running..." : "Deep Audit (5-10 min)"}
        </button>
      </div>

      {/* Progress Display */}
      {loading && (
        <div className="progress-section">
          <div className="loading-spinner"></div>
          <p>{progress}</p>
        </div>
      )}

      {/* Error Display */}
      {error && (
        <div className="error-section">
          <p style={{ color: "red" }}>❌ Error: {error}</p>
        </div>
      )}

      {/* Results Display */}
      {auditData && (
        <div className="results-section">
          <div className="score-cards">
            <div className="score-card overall">
              <h3>🎯 Overall Score</h3>
              <div className="score">
                {auditData.summary.scores.overall}/100
              </div>
              <div className="risk-level">{auditData.summary.riskLevel}</div>
            </div>

            <div className="score-card security">
              <h3>🔒 Security Score</h3>
              <div className="score">
                {auditData.summary.scores.security}/100
              </div>
            </div>

            <div className="score-card health">
              <h3>🏥 Health Score</h3>
              <div className="score">{auditData.summary.scores.health}/100</div>
            </div>
          </div>

          <div className="stats-summary">
            <p>📊 Total Findings: {auditData.summary.stats.totalFindings}</p>
            <p>🚨 Critical Issues: {auditData.summary.stats.criticalIssues}</p>
            <p>🎯 URL Audited: {auditData.results.url}</p>
            <p>
              ⏱️ Execution Time:{" "}
              {(auditData.results.executionTime / 1000).toFixed(1)}s
            </p>
          </div>

          <div className="recommendations">
            <h3>💡 Recommendation</h3>
            <p>{auditData.summary.recommendation}</p>
          </div>

          <div className="top-issues">
            <h3>🔝 Top Security Issues</h3>
            {auditData.summary.topIssues.map((issue, index) => (
              <div key={index} className="issue-card">
                <h4>
                  {issue.type.toUpperCase()} - {issue.severity}
                </h4>
                <p>
                  <strong>Route:</strong> {issue.route}
                </p>
                <p>
                  <strong>Evidence:</strong> {issue.evidence}
                </p>
                <p>
                  <strong>Solution:</strong> {issue.solution}
                </p>
              </div>
            ))}
          </div>

          <div className="detailed-results">
            <h3>📋 Detailed Results</h3>

            {/* Security Findings */}
            <details>
              <summary>
                🔒 Security Findings (
                {auditData.results.securityFindings?.length || 0})
              </summary>
              {auditData.results.securityFindings?.map((finding, index) => (
                <div key={index} className="finding-detail">
                  <h4>
                    {finding.attack} - {finding.severity}
                  </h4>
                  <p>
                    <strong>Route:</strong> {finding.route}
                  </p>
                  <p>
                    <strong>Evidence:</strong> {finding.evidence}
                  </p>
                  {finding.solution && (
                    <div className="solution-detail">
                      <p>
                        <strong>Solution:</strong> {finding.solution.solution}
                      </p>
                      <p>
                        <strong>Priority:</strong> {finding.solution.priority}
                      </p>
                      <p>
                        <strong>Effort:</strong>{" "}
                        {finding.solution.estimated_effort}
                      </p>
                      {finding.solution.code_snippet && (
                        <pre>
                          <code>{finding.solution.code_snippet}</code>
                        </pre>
                      )}
                    </div>
                  )}
                </div>
              ))}
            </details>

            {/* Health Check Results */}
            <details>
              <summary>🏥 Health Check Results</summary>
              <div className="health-scores">
                <p>
                  Performance:{" "}
                  {auditData.results.healthCheck?.scores.performance}/100
                </p>
                <p>
                  Accessibility:{" "}
                  {auditData.results.healthCheck?.scores.accessibility}/100
                </p>
                <p>
                  Best Practices:{" "}
                  {auditData.results.healthCheck?.scores.bestPractices}/100
                </p>
                <p>SEO: {auditData.results.healthCheck?.scores.seo}/100</p>
                <p>PWA: {auditData.results.healthCheck?.scores.pwa}/100</p>
              </div>

              {auditData.results.healthCheck?.issueBreakdown && (
                <div className="health-issues">
                  {Object.entries(
                    auditData.results.healthCheck.issueBreakdown
                  ).map(([category, data]) => (
                    <details key={category}>
                      <summary>
                        {category} Issues ({data.issues?.length || 0})
                      </summary>
                      {data.issues?.map((issue, index) => (
                        <div key={index} className="health-issue">
                          <p>
                            <strong>{issue.type}:</strong> {issue.description}
                          </p>
                          {issue.currentValue && (
                            <p>
                              Current: {issue.currentValue} {issue.unit}
                            </p>
                          )}
                          {issue.targetValue && (
                            <p>
                              Target: {issue.targetValue} {issue.unit}
                            </p>
                          )}
                        </div>
                      ))}
                      {data.recommendations?.length > 0 && (
                        <div className="recommendations">
                          <h4>Recommendations:</h4>
                          {data.recommendations.map((rec, index) => (
                            <p key={index}>• {rec}</p>
                          ))}
                        </div>
                      )}
                    </details>
                  ))}
                </div>
              )}
            </details>
          </div>

          <button
            onClick={() => auditService.downloadReport(auditData.auditId)}
            className="download-button"
          >
            📥 Download Full Report
          </button>
        </div>
      )}
    </div>
  );
};

/**
 * API Response Examples:
 *
 * 1. Start Audit Response:
 * {
 *   "success": true,
 *   "auditId": "audit_1234567890_abc123",
 *   "message": "quick audit started for https://example.com",
 *   "estimatedTime": "2-3 minutes",
 *   "statusEndpoint": "/api/audit/audit_1234567890_abc123/status",
 *   "resultEndpoint": "/api/audit/audit_1234567890_abc123/results"
 * }
 *
 * 2. Status Response:
 * {
 *   "success": true,
 *   "auditId": "audit_1234567890_abc123",
 *   "status": "running", // "running" | "completed" | "failed"
 *   "url": "https://example.com",
 *   "scanType": "quick",
 *   "startTime": "2025-01-01T12:00:00.000Z",
 *   "progress": "Running security scan..."
 * }
 *
 * 3. Results Response:
 * {
 *   "success": true,
 *   "auditId": "audit_1234567890_abc123",
 *   "results": { ... }, // Complete audit results
 *   "summary": { ... },  // Summary with scores and recommendations
 *   "reportFile": "audit-report-example_com.json",
 *   "metadata": { ... }  // Timing and metadata
 * }
 */

export { SecurityAuditService, ExampleReactComponent };
