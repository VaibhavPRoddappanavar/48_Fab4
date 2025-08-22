// ai-redteam-quick.js - Fast Critical Vulnerability Scanner
import "dotenv/config";
import fs from "fs";
import axios from "axios";
import * as cheerio from "cheerio";
import { GoogleGenerativeAI } from "@google/generative-ai";

// ------------------------------
// Config (optimized for speed)
// ------------------------------
const REQ_TIMEOUT_MS = 3000; // Reduced timeout
const UA =
  "Mozilla/5.0 (compatible; AI-RedTeam-Quick/1.0; +https://example.com/hackathon)";
const MAX_BODY_SAMPLE = 500; // Smaller sample for speed

// Safety guard
const LEGAL_NOTE = `
⚠️ QUICK SCAN MODE: Only scan targets you own or have explicit permission for.
This is a fast scan focusing on critical vulnerabilities only.
`;

// ------------------------------
// Helpers
// ------------------------------
function sleep(ms) {
  return new Promise((r) => setTimeout(r, ms));
}

// Axios instance (faster config)
const http = axios.create({
  timeout: REQ_TIMEOUT_MS,
  headers: { "User-Agent": UA },
  validateStatus: () => true,
});

// Clean JSON extraction from LLM
function extractJsonBlock(text) {
  const fence = text.match(/```json([\s\S]*?)```/i);
  if (fence) return fence[1].trim();
  const firstBrace = text.indexOf("{");
  const lastBrace = text.lastIndexOf("}");
  if (firstBrace !== -1 && lastBrace !== -1 && lastBrace > firstBrace) {
    return text.slice(firstBrace, lastBrace + 1);
  }
  throw new Error("LLM did not return JSON.");
}

// Quick fallback classifier (fast critical tests only)
function quickFallbackPlan(urls) {
  const plan = {};
  for (const url of urls) {
    const tests = new Set(["headers_quick"]); // Always check critical headers

    // API endpoints - focus on access control
    if (/\/api\/|\/rest\//i.test(url)) {
      tests.add("idor_quick");
      tests.add("cors_quick");
    }

    // Parameters - focus on injection
    if (url.includes("?")) {
      tests.add("sqli_quick");
      tests.add("xss_quick");
    }

    // Auth endpoints
    if (/login|signup|register|auth/i.test(url)) {
      tests.add("csrf_quick");
    }

    // Search endpoints
    if (/search|query|filter/i.test(url)) {
      tests.add("sqli_quick");
      tests.add("xss_quick");
    }

    plan[url] = Array.from(tests);
  }
  return plan;
}

// ------------------------------
// AI plan (Quick mode)
// ------------------------------
async function aiPlanQuickTests(urls) {
  const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
  const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });

  const system = `
You are a speed-focused security auditor for QUICK SCAN mode.
Choose ONLY fast, critical tests from: ["sqli_quick","xss_quick","idor_quick","csrf_quick","cors_quick","headers_quick"].
Rules:
- Focus on HIGH-IMPACT, FAST vulnerabilities only
- API endpoints: idor_quick, cors_quick
- Search/params: sqli_quick, xss_quick  
- Auth: csrf_quick
- Always: headers_quick
Return STRICT JSON mapping url -> string[] with NO extra text.
`;

  const prompt = `${system}\nURLs:\n${JSON.stringify(
    urls,
    null,
    2
  )}\nJSON only.`;

  try {
    const result = await model.generateContent(prompt);
    const text = result.response.text();
    const raw = extractJsonBlock(text);
    const json = JSON.parse(raw);
    for (const u of urls) if (!json[u]) json[u] = ["headers_quick"];
    return json;
  } catch (e) {
    console.warn("⚠️ Gemini plan failed, using quick fallback:", e.message);
    return quickFallbackPlan(urls);
  }
}

// ------------------------------
// Quick fingerprinting
// ------------------------------
async function quickFingerprint(url) {
  const fp = {
    url,
    status: null,
    server: null,
    errorHints: [],
  };

  try {
    const res = await http.get(url);
    fp.status = res.status;
    if (res.headers["server"]) fp.server = res.headers["server"];

    const body =
      typeof res.data === "string"
        ? res.data.slice(0, MAX_BODY_SAMPLE)
        : JSON.stringify(res.data).slice(0, MAX_BODY_SAMPLE);

    if (/exception|traceback|stack trace|error:|sql syntax/i.test(body))
      fp.errorHints.push("Error leak detected");
  } catch (err) {
    fp.errorHints.push("Request failed: " + err.message);
  }
  return fp;
}

// ------------------------------
// Quick Probes (Fast & Critical Only)
// ------------------------------

// Quick SQL Injection (1-2 payloads only)
async function probeSQLiQuick(url) {
  const findings = [];
  const criticalPayloads = ["%27", "%27%20OR%201=1--"]; // Only most critical

  try {
    for (const payload of criticalPayloads) {
      const injUrl = url + (url.includes("?") ? "&" : "?") + "q=" + payload;
      const res = await http.get(injUrl);
      const body =
        typeof res.data === "string" ? res.data : JSON.stringify(res.data);

      if (/(sql syntax|mysql|postgres|sqlite|ORA-|ODBC)/i.test(body)) {
        findings.push({
          route: url,
          attack: "sqli",
          payload: injUrl,
          evidence: "SQL error signature detected",
          severity: "critical",
        });
        break; // Stop on first hit for speed
      }
    }
  } catch (_) {}
  return findings;
}

// Quick XSS (simple reflection test)
async function probeXSSQuick(url) {
  const findings = [];
  try {
    const token = "XSS_" + Math.random().toString(36).slice(2, 6);
    const testUrl = url + (url.includes("?") ? "&" : "?") + "q=" + token;
    const res = await http.get(testUrl);
    const body =
      typeof res.data === "string" ? res.data : JSON.stringify(res.data);

    if (body.includes(token)) {
      findings.push({
        route: url,
        attack: "xss",
        payload: testUrl,
        evidence: "Reflected input detected",
        severity: "high",
      });
    }
  } catch (_) {}
  return findings;
}

// Quick IDOR (single parameter test)
async function probeIDORQuick(url) {
  const findings = [];
  try {
    const testUrl = url + (url.includes("?") ? "&" : "?") + "id=1";
    const testUrl2 = url + (url.includes("?") ? "&" : "?") + "id=2";

    const [res1, res2] = await Promise.all([
      http.get(testUrl),
      http.get(testUrl2),
    ]);
    if (res1.status === 200 && res2.status === 200) {
      const body1 =
        typeof res1.data === "string" ? res1.data : JSON.stringify(res1.data);
      const body2 =
        typeof res2.data === "string" ? res2.data : JSON.stringify(res2.data);

      if (body1 !== body2 && body1.length > 50 && body2.length > 50) {
        findings.push({
          route: url,
          attack: "idor",
          payload: `${testUrl} vs ${testUrl2}`,
          evidence: "ID parameter allows access to different resources",
          severity: "critical",
        });
      }
    }
  } catch (_) {}
  return findings;
}

// Quick CSRF (basic form check)
async function probeCSRFQuick(url) {
  const findings = [];
  try {
    const res = await http.get(url);
    const ct = res.headers["content-type"] || "";
    if (!/html/i.test(ct)) return findings;

    const $ = cheerio.load(res.data);
    const hasPostForm = $('form[method="post"], form:not([method])').length > 0;
    if (!hasPostForm) return findings;

    const hasToken =
      $('input[name="csrf"], input[name="csrfToken"], input[name="_csrf"]')
        .length > 0;
    if (!hasToken) {
      findings.push({
        route: url,
        attack: "csrf",
        evidence: "POST form without CSRF token",
        severity: "high",
      });
    }
  } catch (_) {}
  return findings;
}

// Quick CORS (simple preflight check)
async function probeCORSQuick(url) {
  const findings = [];
  try {
    const res = await http.options(url, {
      headers: {
        Origin: "http://evil.example",
        "Access-Control-Request-Method": "GET",
      },
    });
    const aco = res.headers["access-control-allow-origin"];
    if (aco === "*") {
      findings.push({
        route: url,
        attack: "cors",
        evidence: "CORS allows any origin (*)",
        severity: "medium",
      });
    }
  } catch (_) {}
  return findings;
}

// Quick Headers (critical security headers only)
async function probeHeadersQuick(url) {
  const findings = [];
  try {
    const res = await http.get(url);
    const h = res.headers;
    const critical = [];

    if (!h["content-security-policy"]) critical.push("CSP");
    if (!h["x-frame-options"]) critical.push("X-Frame-Options");

    // Info disclosure
    if (h["server"] && !/cloudflare|nginx/i.test(h["server"])) {
      critical.push(`Server: ${h["server"]}`);
    }

    if (critical.length) {
      findings.push({
        route: url,
        attack: "headers",
        evidence: "Critical headers missing: " + critical.join(", "),
        severity: critical.length > 2 ? "high" : "medium",
      });
    }
  } catch (_) {}
  return findings;
}

// Execute quick probes
async function runQuickProbes(url, tests) {
  const tasks = [];
  const set = new Set(tests);

  if (set.has("sqli_quick")) tasks.push(probeSQLiQuick(url));
  if (set.has("xss_quick")) tasks.push(probeXSSQuick(url));
  if (set.has("idor_quick")) tasks.push(probeIDORQuick(url));
  if (set.has("csrf_quick")) tasks.push(probeCSRFQuick(url));
  if (set.has("cors_quick")) tasks.push(probeCORSQuick(url));
  if (set.has("headers_quick")) tasks.push(probeHeadersQuick(url));

  const results = await Promise.all(tasks);
  return results.flat();
}

// ------------------------------
// Solution Generation (Quick Mode)
// ------------------------------
function generateUserPrompt(finding) {
  const payloadJson = finding.payload
    ? JSON.stringify(finding.payload)
    : "null";

  return `You are a cybersecurity expert. Analyze this vulnerability finding and return ONLY a valid JSON object with remediation guidance. No explanations, no markdown, no code blocks - just pure JSON.

VULNERABILITY FINDING:
Route: ${finding.route}
Attack Type: ${finding.attack}
Payload: ${payloadJson}
Evidence: ${finding.evidence}
Severity: ${finding.severity}

REQUIRED: Return ONLY this JSON structure (no other text):

{
  "solution": "Brief 1-sentence fix description",
  "remediation_steps": [
    "Step 1: Specific action to take",
    "Step 2: Another specific action",
    "Step 3: Verification step"
  ],
  "code_snippet": "Actual code/config example or null",
  "resource_links": [
    {
      "type": "doc",
      "title": "OWASP Documentation Title",
      "url": "https://owasp.org/relevant-page",
      "youtube_id": null
    },
    {
      "type": "blog", 
      "title": "Security Blog Article Title",
      "url": "https://example.com/security-guide",
      "youtube_id": null
    },
    {
      "type": "youtube",
      "title": "YouTube Tutorial Title", 
      "url": "https://youtube.com/watch?v=VIDEO_ID",
      "youtube_id": "VIDEO_ID"
    }
  ],
  "cwe_cve": "CWE-XXX or CVE-YYYY-XXXXX if applicable, else null",
  "priority": "P0",
  "estimated_effort": "low",
  "confidence": "high",
  "waf_rules": ["ModSecurity rule example"],
  "notes": "Additional context or null"
}

Rules:
- For headers attacks: Include nginx add_header or Node.js helmet examples
- For XSS: Include input validation and CSP examples  
- For SQLi: Include parameterized query examples
- Always include real working code snippets
- YouTube links must be real security tutorial videos
- Priority: P0=critical, P1=high, P2=medium, P3=low
- Effort: low=<1day, med=1-3days, high=>3days

RESPOND WITH ONLY THE JSON OBJECT:`;
}

function getDefaultCodeSnippet(attackType) {
  const snippets = {
    headers: `// Node.js Express with Helmet
const helmet = require('helmet');
app.use(helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      styleSrc: ["'self'", "'unsafe-inline'"]
    }
  },
  hsts: { maxAge: 31536000, includeSubDomains: true }
}));

// Nginx configuration
add_header X-Frame-Options "SAMEORIGIN" always;
add_header X-Content-Type-Options "nosniff" always;
add_header Strict-Transport-Security "max-age=31536000; includeSubDomains" always;`,

    xss: `// Input validation and sanitization
const validator = require('validator');
const xss = require('xss');

function sanitizeInput(input) {
  return xss(validator.escape(input));
}

// CSP Header
"Content-Security-Policy": "default-src 'self'; script-src 'self'"`,

    sqli: `// Parameterized queries (Node.js + MySQL)
const query = 'SELECT * FROM users WHERE id = ? AND name = ?';
db.query(query, [userId, userName], (err, results) => {
  // Handle results safely
});

// Prepared statements (PHP)
$stmt = $pdo->prepare('SELECT * FROM users WHERE id = ? AND name = ?');
$stmt->execute([$userId, $userName]);`,

    cors: `// Express.js CORS configuration
const cors = require('cors');
app.use(cors({
  origin: ['https://trustedsite.com'],
  credentials: true,
  optionsSuccessStatus: 200
}));`,

    csrf: `// Express.js CSRF protection
const csrf = require('csurf');
const csrfProtection = csrf({ cookie: true });
app.use(csrfProtection);

// Include token in forms
<input type="hidden" name="_csrf" value="{{csrfToken}}">`,
  };

  return snippets[attackType] || null;
}

function getDefaultResourceLinks(attackType) {
  const links = {
    headers: [
      {
        type: "doc",
        title: "OWASP Secure Headers Project",
        url: "https://owasp.org/www-project-secure-headers/",
        youtube_id: null,
      },
      {
        type: "blog",
        title: "Security Headers Best Practices",
        url: "https://securityheaders.com/",
        youtube_id: null,
      },
      {
        type: "youtube",
        title: "Web Security Headers Explained",
        url: "https://www.youtube.com/watch?v=zEV3HOuM_Vw",
        youtube_id: "zEV3HOuM_Vw",
      },
    ],
    xss: [
      {
        type: "doc",
        title: "OWASP XSS Prevention",
        url: "https://owasp.org/www-community/xss-filter-evasion-cheatsheet",
        youtube_id: null,
      },
      {
        type: "blog",
        title: "XSS Prevention Guide",
        url: "https://cheatsheetseries.owasp.org/cheatsheets/Cross_Site_Scripting_Prevention_Cheat_Sheet.html",
        youtube_id: null,
      },
      {
        type: "youtube",
        title: "Cross-Site Scripting Explained",
        url: "https://www.youtube.com/watch?v=EoaDgUgS6QA",
        youtube_id: "EoaDgUgS6QA",
      },
    ],
    sqli: [
      {
        type: "doc",
        title: "OWASP SQL Injection Prevention",
        url: "https://owasp.org/www-community/attacks/SQL_Injection",
        youtube_id: null,
      },
      {
        type: "blog",
        title: "SQL Injection Prevention Cheat Sheet",
        url: "https://cheatsheetseries.owasp.org/cheatsheets/SQL_Injection_Prevention_Cheat_Sheet.html",
        youtube_id: null,
      },
      {
        type: "youtube",
        title: "SQL Injection Explained",
        url: "https://www.youtube.com/watch?v=ciNHn38EyRc",
        youtube_id: "ciNHn38EyRc",
      },
    ],
  };

  return (
    links[attackType] || [
      {
        type: "doc",
        title: "OWASP Top 10",
        url: "https://owasp.org/Top10/",
        youtube_id: null,
      },
      {
        type: "blog",
        title: "Web Security Guide",
        url: "https://developer.mozilla.org/en-US/docs/Web/Security",
        youtube_id: null,
      },
      {
        type: "youtube",
        title: "Web Security Fundamentals",
        url: "https://www.youtube.com/watch?v=WlmKwIe9z1Q",
        youtube_id: "WlmKwIe9z1Q",
      },
    ]
  );
}

function getCWEForAttack(attackType) {
  const cweMapping = {
    headers: "CWE-16",
    xss: "CWE-79",
    sqli: "CWE-89",
    cors: "CWE-942",
    csrf: "CWE-352",
    idor: "CWE-639",
    ssrf: "CWE-918",
    logging_failures: "CWE-778",
  };

  return cweMapping[attackType] || null;
}

function getDefaultSolution(finding) {
  const attackType = finding.attack;
  const solutions = {
    headers: {
      solution:
        "Implement comprehensive security headers to protect against common web vulnerabilities",
      remediation_steps: [
        "Configure Content Security Policy (CSP) to prevent XSS attacks",
        "Enable HTTP Strict Transport Security (HSTS) for HTTPS enforcement",
        "Add X-Frame-Options to prevent clickjacking attacks",
        "Set X-Content-Type-Options to prevent MIME type sniffing",
      ],
    },
    xss: {
      solution:
        "Implement input validation, output encoding, and Content Security Policy",
      remediation_steps: [
        "Validate and sanitize all user inputs on both client and server side",
        "Implement proper output encoding based on context (HTML, JavaScript, CSS)",
        "Deploy Content Security Policy (CSP) headers to restrict script execution",
        "Use prepared statements and avoid dynamic HTML generation",
      ],
    },
    sqli: {
      solution:
        "Use parameterized queries and input validation to prevent SQL injection",
      remediation_steps: [
        "Replace dynamic SQL with parameterized queries or prepared statements",
        "Validate and sanitize all user inputs before database operations",
        "Implement least privilege database access controls",
        "Use stored procedures with proper input validation",
      ],
    },
  };

  const defaultSol = solutions[attackType] || {
    solution:
      "Review and implement appropriate security controls for this vulnerability",
    remediation_steps: [
      "Analyze the specific vulnerability details",
      "Research best practices for this attack type",
      "Implement appropriate security controls",
      "Test and validate the fix effectiveness",
    ],
  };

  return {
    solution: defaultSol.solution,
    remediation_steps: defaultSol.remediation_steps,
    code_snippet: getDefaultCodeSnippet(attackType),
    resource_links: getDefaultResourceLinks(attackType),
    cwe_cve: getCWEForAttack(attackType),
    priority:
      finding.severity === "high" || finding.severity === "critical"
        ? "P0"
        : "P1",
    estimated_effort: "med",
    confidence: "high",
    waf_rules: [],
    notes: "Auto-generated solution based on vulnerability type",
  };
}

async function generateSolutionsForFindings(findings) {
  if (!process.env.GEMINI_API_KEY) {
    console.log("⚠️ No GEMINI_API_KEY found. Skipping solution generation.");
    return findings;
  }

  console.log(
    `🧠 Generating quick solutions for ${findings.length} findings using Gemini AI...`
  );

  const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
  const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash-exp" });

  const enhancedFindings = [];

  for (let i = 0; i < findings.length; i++) {
    const finding = findings[i];
    console.log(
      `[${i + 1}/${findings.length}] Generating solution for ${
        finding.attack
      } on ${finding.route}`
    );

    try {
      const prompt = generateUserPrompt(finding);
      const result = await model.generateContent(prompt);
      const response = await result.response;
      let text = response.text().trim();

      // Clean up the response - remove markdown code blocks if present
      if (text.startsWith("```json")) {
        text = text.replace(/^```json\s*/, "").replace(/\s*```$/, "");
      } else if (text.startsWith("```")) {
        text = text.replace(/^```\s*/, "").replace(/\s*```$/, "");
      }

      // Remove any leading/trailing text that's not JSON
      const jsonStart = text.indexOf("{");
      const jsonEnd = text.lastIndexOf("}");
      if (jsonStart !== -1 && jsonEnd !== -1) {
        text = text.substring(jsonStart, jsonEnd + 1);
      }

      // Parse the JSON response
      let solution = null;
      try {
        solution = JSON.parse(text);

        // Validate required fields and provide defaults if missing
        solution = {
          solution:
            solution.solution ||
            "Configure security headers and implement proper input validation",
          remediation_steps: solution.remediation_steps || [
            "Review and implement missing security headers",
            "Configure Content Security Policy (CSP)",
            "Enable HTTPS with HSTS",
            "Validate and sanitize all user inputs",
          ],
          code_snippet:
            solution.code_snippet || getDefaultCodeSnippet(finding.attack),
          resource_links:
            solution.resource_links || getDefaultResourceLinks(finding.attack),
          cwe_cve: solution.cwe_cve || getCWEForAttack(finding.attack),
          priority:
            solution.priority ||
            (finding.severity === "high" || finding.severity === "critical"
              ? "P0"
              : "P1"),
          estimated_effort: solution.estimated_effort || "med",
          confidence: solution.confidence || "high",
          waf_rules: solution.waf_rules || [],
          notes: solution.notes || null,
        };
      } catch (parseError) {
        console.log(
          `⚠️ Failed to parse solution JSON for finding ${i + 1}: ${
            parseError.message
          }`
        );
        console.log(`Raw response: ${text.substring(0, 200)}...`);
        solution = getDefaultSolution(finding);
      }

      // Combine original finding with solution
      enhancedFindings.push({
        ...finding,
        solution: solution,
      });

      // Small delay to avoid rate limiting
      await new Promise((resolve) => setTimeout(resolve, 300));
    } catch (error) {
      console.log(
        `⚠️ Error generating solution for finding ${i + 1}:`,
        error.message
      );

      // Add finding without solution on error
      enhancedFindings.push({
        ...finding,
        solution: getDefaultSolution(finding),
      });
    }
  }

  console.log(`✅ Generated solutions for ${enhancedFindings.length} findings`);
  return enhancedFindings;
}

// ------------------------------
// Quick Orchestrator
// ------------------------------
async function main() {
  const startTime = Date.now();
  const inputFile = process.argv[2] || "urls.json";

  if (!process.env.GEMINI_API_KEY) {
    console.error("❌ Missing GEMINI_API_KEY in .env");
    process.exit(1);
  }

  if (!fs.existsSync(inputFile)) {
    console.error("❌ Input file not found:", inputFile);
    process.exit(1);
  }

  console.log(LEGAL_NOTE.trim(), "\n");

  const data = JSON.parse(fs.readFileSync(inputFile, "utf-8"));

  // Handle both old format (array) and new format (object with pages/apiEndpoints)
  let urls = [];
  if (Array.isArray(data)) {
    urls = data;
  } else if (data.pages || data.apiEndpoints) {
    urls = [...(data.pages || []), ...(data.apiEndpoints || [])];
  } else {
    console.error(
      "❌ Invalid input format. Expected array of URLs or object with 'pages'/'apiEndpoints'"
    );
    process.exit(1);
  }

  if (urls.length === 0) {
    console.error("❌ No URLs found in input file");
    process.exit(1);
  }

  console.log("🚀 Quick scan mode - Planning critical tests with Gemini…");
  const aiPlan = await aiPlanQuickTests(urls);
  console.log("📝 Quick Plan:", JSON.stringify(aiPlan, null, 2));

  const findingsAll = [];
  const fingerprintsAll = [];

  for (const url of urls) {
    console.log(`\n🔎 Quick fingerprinting ${url}`);
    const fp = await quickFingerprint(url);
    fingerprintsAll.push(fp);
    console.log("   ↳", { status: fp.status, server: fp.server });

    const planned = aiPlan[url] || ["headers_quick"];
    console.log(`⚡ Quick probing ${url} with: ${planned.join(", ")}`);
    const f = await runQuickProbes(url, planned);
    findingsAll.push(...f);

    await sleep(100); // Minimal delay
  }

  console.log(
    `\n🧠 Generating AI-powered solutions for ${findingsAll.length} findings...`
  );

  // Generate solutions for all findings
  const findingsWithSolutions = await generateSolutionsForFindings(findingsAll);

  // Save artifacts to Security folder
  fs.writeFileSync(
    "Security/findings-quick.json",
    JSON.stringify(findingsWithSolutions, null, 2)
  );
  fs.writeFileSync(
    "Security/fingerprints-quick.json",
    JSON.stringify(fingerprintsAll, null, 2)
  );

  console.log("\n📄 Results saved to:");
  console.log("   • Security/findings-quick.json");
  console.log("   • Security/fingerprints-quick.json");

  // Quick reporting
  const elapsed = (Date.now() - startTime) / 1000;
  console.log("\n" + "=".repeat(50));
  console.log("⚡ QUICK SCAN RESULTS");
  console.log("=".repeat(50));

  if (findingsWithSolutions.length === 0) {
    console.log("✅ No critical vulnerabilities detected in quick scan");
  } else {
    const severityCounts = { critical: 0, high: 0, medium: 0, low: 0 };
    findingsWithSolutions.forEach((f) => severityCounts[f.severity]++);

    console.log(
      `\n📊 Quick Summary: ${findingsWithSolutions.length} findings with solutions in ${elapsed}s`
    );
    console.log(`   🔴 Critical: ${severityCounts.critical}`);
    console.log(`   🟠 High: ${severityCounts.high}`);
    console.log(`   🟡 Medium: ${severityCounts.medium}`);

    const criticalAndHigh = findingsWithSolutions.filter(
      (f) => f.severity === "critical" || f.severity === "high"
    );
    if (criticalAndHigh.length > 0) {
      console.log(`\n🚨 CRITICAL ISSUES FOUND WITH SOLUTIONS:`);
      criticalAndHigh.slice(0, 3).forEach((f) => {
        // Show top 3 with solutions
        console.log(`   🎯 ${f.attack.toUpperCase()} on ${f.route}`);
        console.log(`      Evidence: ${f.evidence}`);
        if (f.solution) {
          console.log(`      💡 Solution: ${f.solution.solution}`);
          console.log(
            `      🔧 Priority: ${f.solution.priority} | Effort: ${f.solution.estimated_effort}`
          );
        }
        console.log("");
      });
      if (criticalAndHigh.length > 3) {
        console.log(
          `   ... and ${
            criticalAndHigh.length - 3
          } more critical issues with solutions`
        );
      }
    }
  }

  console.log(
    `\n✅ Quick scan completed in ${elapsed}s with AI-generated solutions`
  );
  console.log("📁 Files: findings-quick.json, fingerprints-quick.json");
  console.log(
    "💡 For comprehensive OWASP Top 10 analysis, run: npm run scan:deep"
  );
}

main().catch((e) => {
  console.error("Fatal:", e);
  process.exit(1);
});
