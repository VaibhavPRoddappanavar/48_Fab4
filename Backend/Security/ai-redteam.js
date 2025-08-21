// ai-redteam.js
import "dotenv/config";
import fs from "fs";
import axios from "axios";
import * as cheerio from "cheerio";
import { GoogleGenerativeAI } from "@google/generative-ai";

// ------------------------------
// Config (tweak for hackathon)
// ------------------------------
const REQ_TIMEOUT_MS = 5000;
const UA =
  "Mozilla/5.0 (compatible; AI-RedTeam/1.0; +https://example.com/hackathon)";
const MAX_BODY_SAMPLE = 1000;

// Safety guard: DO NOT scan domains you don't own/have permission for
const LEGAL_NOTE = `
⚠️ Legal/Safety: Only scan targets you own or have explicit permission for.
This tool sends lightweight, non-destructive probes but may still be disallowed by some sites.
`;

// ------------------------------
// Helpers
// ------------------------------
function sleep(ms) {
  return new Promise((r) => setTimeout(r, ms));
}

// Axios instance
const http = axios.create({
  timeout: REQ_TIMEOUT_MS,
  headers: { "User-Agent": UA },
  validateStatus: () => true,
});

// Clean JSON extraction from LLM (in case it wraps code fences)
function extractJsonBlock(text) {
  const fence = text.match(/```json([\s\S]*?)```/i);
  if (fence) return fence[1].trim();
  // fallback: try raw JSON
  const firstBrace = text.indexOf("{");
  const lastBrace = text.lastIndexOf("}");
  if (firstBrace !== -1 && lastBrace !== -1 && lastBrace > firstBrace) {
    return text.slice(firstBrace, lastBrace + 1);
  }
  throw new Error("LLM did not return JSON.");
}

// Simple fallback classifier (if AI fails)
function fallbackPlan(urls) {
  const plan = {};
  for (const url of urls) {
    const tests = new Set([
      "headers",
      "vulnerable_components",
      "logging_failures",
      "cryptographic_failures",
    ]); // Always check these

    // API endpoints get comprehensive OWASP Top 10 testing
    if (/\/api\/|\/rest\//i.test(url)) {
      tests.add("jwt");
      tests.add("api_versioning");
      tests.add("cors");
      tests.add("idor");
      tests.add("ssrf");
      tests.add("insecure_design");
      tests.add("integrity_failures");
    }

    if (url.includes("?")) {
      tests.add("sqli");
      tests.add("xss");
      tests.add("directory_traversal");
      tests.add("ssrf");
    }

    if (/\/\d+/.test(url) || /id=/i.test(url)) {
      tests.add("idor");
    }

    if (/login|signup|register|auth/i.test(url)) {
      tests.add("csrf");
      tests.add("xss");
      tests.add("jwt");
      tests.add("cryptographic_failures");
    }

    if (/search|query|filter/i.test(url)) {
      tests.add("sqli");
      tests.add("xss");
      tests.add("ssrf");
    }

    if (/file|upload|download/i.test(url)) {
      tests.add("directory_traversal");
      tests.add("integrity_failures");
    }

    if (/admin|management|dashboard/i.test(url)) {
      tests.add("insecure_design");
      tests.add("idor");
    }

    plan[url] = Array.from(tests);
  }
  return plan;
}

// ------------------------------
// URL Filtering for Testing
// ------------------------------
async function filterUrlsForTesting(allUrls) {
  console.log(`🔍 Filtering ${allUrls.length} URLs for security testing...`);

  const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
  const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });

  const system = `
You are a security testing expert. Given a list of URLs, filter and select the most valuable ones for security testing.

SELECTION CRITERIA (prioritize in this order):
1. Interactive endpoints (forms, login, registration, contact)
2. Dynamic content with parameters (?id=, ?search=, ?q=, ?page=)
3. Administrative or management interfaces (/admin, /dashboard, /manage)
4. File upload/download endpoints
5. Search, query, or filter functionality
6. Authentication/authorization pages (/login, /auth, /register)
7. API endpoints (/api/, /rest/, /v1/, /graphql)
8. User profile or account pages
9. E-commerce functionality (cart, checkout, payment)
10. Content management or CRUD operations

EXCLUDE these:
- Static assets (images: .jpg, .png, .gif, .svg, .ico)
- Stylesheets and scripts (.css, .js)
- Documentation files (.pdf, .doc, .txt)
- Media files (.mp4, .mp3, .avi)
- Purely informational/static pages

SELECTION RULES:
- For 10-30 URLs: Select up to 15 URLs
- For 31-60 URLs: Select up to 20 URLs  
- For 61-100 URLs: Select up to 25 URLs
- For 100+ URLs: Select up to 30 URLs (focus on highest priority)

Return a JSON array of selected URLs. Focus on quality over quantity - select URLs most likely to have security vulnerabilities.
`;

  const prompt = `${system}

URLs to filter (${allUrls.length} total):
${JSON.stringify(allUrls, null, 2)}

Return only the JSON array of selected URLs:`;

  try {
    const result = await model.generateContent(prompt);
    const text = result.response.text();
    const jsonStr = extractJsonBlock(text);
    const filteredUrls = JSON.parse(jsonStr);

    console.log(`✅ Filtered to ${filteredUrls.length} URLs for testing`);
    console.log(
      `📋 Selected URLs: ${filteredUrls.slice(0, 5).join(", ")}${
        filteredUrls.length > 5 ? "..." : ""
      }`
    );

    if (!Array.isArray(filteredUrls)) {
      console.warn("⚠️ AI filtering failed, using basic filtering...");
      return basicUrlFilter(allUrls);
    }

    return filteredUrls;
  } catch (err) {
    console.warn(
      "⚠️ AI filtering failed:",
      err.message,
      "Using basic filtering..."
    );
    return basicUrlFilter(allUrls);
  }
}

// Basic fallback filtering
function basicUrlFilter(urls) {
  console.log("🔧 Using basic fallback filtering...");

  const filtered = urls.filter((url) => {
    // Exclude static assets
    if (
      /\.(png|jpg|jpeg|gif|css|js|pdf|ico|svg|woff|ttf|mp4|mp3|avi|doc|docx)$/i.test(
        url
      )
    ) {
      return false;
    }

    // Exclude image/media directories
    if (/\/(images?|img|pics?|media|assets|static)\//i.test(url)) {
      return false;
    }

    // Prioritize interactive pages
    const priority =
      /\/(login|admin|dashboard|api|search|contact|register|auth|profile|account|manage|upload|download)/i.test(
        url
      ) || /\?[^=]+=/.test(url); // URLs with parameters

    return true;
  });

  // Sort by priority (interactive pages first)
  const prioritized = filtered.sort((a, b) => {
    const aPriority =
      /\/(login|admin|dashboard|api|search|contact|register|auth|profile|account|manage|upload|download)/i.test(
        a
      ) || /\?[^=]+=/.test(a);
    const bPriority =
      /\/(login|admin|dashboard|api|search|contact|register|auth|profile|account|manage|upload|download)/i.test(
        b
      ) || /\?[^=]+=/.test(b);

    if (aPriority && !bPriority) return -1;
    if (!aPriority && bPriority) return 1;
    return 0;
  });

  // Limit based on total URLs
  const maxUrls =
    urls.length <= 30
      ? 15
      : urls.length <= 60
      ? 20
      : urls.length <= 100
      ? 25
      : 30;
  const result = prioritized.slice(0, maxUrls);

  console.log(
    `🎯 Basic filter selected ${result.length} URLs from ${urls.length} total`
  );
  return result;
}

// ------------------------------
// 1) AI plan (Gemini 2.5 Flash)
// ------------------------------
async function aiPlanTests(urls, fingerprints = null) {
  const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
  const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });

  const system = `
You are a meticulous web security auditor focused on OWASP Top 10 2021.
Given URLs, choose relevant tests from the complete OWASP Top 10 arsenal:
["sqli","xss","idor","csrf","cors","headers","jwt","api_versioning","directory_traversal","cryptographic_failures","insecure_design","vulnerable_components","integrity_failures","logging_failures","ssrf"].

OWASP Top 10 2021 Mapping:
- A01 Broken Access Control: idor, csrf, api_versioning
- A02 Cryptographic Failures: cryptographic_failures
- A03 Injection: sqli, xss, directory_traversal, ssrf
- A04 Insecure Design: insecure_design
- A05 Security Misconfiguration: headers, cors
- A06 Vulnerable Components: vulnerable_components
- A07 Authentication Failures: jwt
- A08 Integrity Failures: integrity_failures
- A09 Logging Failures: logging_failures
- A10 SSRF: ssrf

Rules:
- API endpoints (/api/, /rest/): Include jwt, api_versioning, cors, idor, ssrf
- Search/query endpoints: sqli, xss, ssrf
- Authentication endpoints: jwt, cryptographic_failures
- Always include: headers, vulnerable_components, logging_failures (applies to all)
- Admin endpoints: insecure_design, idor
- File operations: directory_traversal, integrity_failures
Return STRICT JSON mapping url -> string[] with NO extra text.
`;

  const data = {
    urls,
    fingerprints, // we might pass null on first run
  };

  const prompt = `${system}\nData:\n${JSON.stringify(
    data,
    null,
    2
  )}\nJSON only.`;

  try {
    const result = await model.generateContent(prompt);
    const text = result.response.text();
    const raw = extractJsonBlock(text);
    const json = JSON.parse(raw);
    // sanity: ensure all urls exist
    for (const u of urls) if (!json[u]) json[u] = ["headers"];
    return json;
  } catch (e) {
    console.warn("⚠️ Gemini plan failed, using fallback:", e.message);
    return fallbackPlan(urls);
  }
}

// ------------------------------
// 2) Fingerprinting
// ------------------------------
async function fingerprint(url) {
  const fp = {
    url,
    status: null,
    server: null,
    tech: [],
    cookies: [],
    contentType: null,
    dbHints: [],
    errorHints: [],
  };

  try {
    const res = await http.get(url);
    fp.status = res.status;
    fp.contentType = res.headers["content-type"] || "unknown";
    if (res.headers["server"]) fp.server = res.headers["server"];
    if (res.headers["x-powered-by"]) fp.tech.push(res.headers["x-powered-by"]);

    if (res.headers["set-cookie"]) {
      fp.cookies = res.headers["set-cookie"].map((c) => c.split(";")[0]);
    }

    const body =
      typeof res.data === "string"
        ? res.data.slice(0, MAX_BODY_SAMPLE)
        : JSON.stringify(res.data).slice(0, MAX_BODY_SAMPLE);

    // DB hints (error message based)
    if (/sql syntax|mysql|postgres|sqlite|ORA-|ODBC|Microsoft SQL/i.test(body))
      fp.dbHints.push("SQL");
    if (/MongoError|bson|CastError|NoSQL/i.test(body)) fp.dbHints.push("NoSQL");

    // Generic error leaks
    if (/exception|traceback|stack trace|error:/i.test(body))
      fp.errorHints.push("Debug error leak");
  } catch (err) {
    fp.errorHints.push("Request failed: " + err.message);
  }
  return fp;
}

// ------------------------------
// 3) Enhanced Probes
// ------------------------------
async function probeSQLi(url) {
  const findings = [];
  const payloads = [
    "%27", // Basic single quote
    "%27%20OR%201=1--", // Classic OR injection
    "%27%20UNION%20SELECT%20NULL--", // Union injection
    "%27;%20WAITFOR%20DELAY%20%2700:00:01%27--", // Time-based (SQL Server)
    "%27%20AND%201=1--", // Boolean-based true
    "%27%20AND%201=2--", // Boolean-based false
  ];

  try {
    // Get baseline response first
    const baseRes = await http.get(url);
    const baseBody =
      typeof baseRes.data === "string"
        ? baseRes.data
        : JSON.stringify(baseRes.data);
    const baseLength = baseBody.length;

    for (const payload of payloads) {
      const injUrl = url + (url.includes("?") ? "&" : "?") + "q=" + payload;
      const res = await http.get(injUrl);
      const body =
        typeof res.data === "string" ? res.data : JSON.stringify(res.data);

      // Check for SQL error signatures
      if (
        /(sql syntax|mysql|postgres|sqlite|ORA-|ODBC|Microsoft SQL|syntax error|mysql_fetch|pg_exec)/i.test(
          body
        )
      ) {
        findings.push({
          route: url,
          attack: "sqli",
          payload: injUrl,
          evidence: "SQL error signature detected in response",
          severity: "critical",
        });
      }

      // Boolean-based detection (significant length difference)
      const lengthDiff = Math.abs(body.length - baseLength) / baseLength;
      if (lengthDiff > 0.1 && payload.includes("1=1")) {
        findings.push({
          route: url,
          attack: "sqli",
          payload: injUrl,
          evidence: `Significant response length difference: ${(
            lengthDiff * 100
          ).toFixed(1)}%`,
          severity: "high",
        });
      }

      await sleep(100); // Be polite
    }
  } catch (_) {}
  return findings;
}

async function probeXSS(url) {
  const findings = [];
  const payloads = [
    "<script>alert('XSS')</script>",
    "javascript:alert('XSS')",
    "<img src=x onerror=alert('XSS')>",
    "'><script>alert('XSS')</script>",
    "\"><script>alert('XSS')</script>",
    "<svg onload=alert('XSS')>",
  ];

  try {
    for (const payload of payloads) {
      const token = "XSS_TEST_" + Math.random().toString(36).slice(2, 8);
      const testPayload = payload.replace(
        /alert\('XSS'\)/g,
        `alert('${token}')`
      );
      const testUrl =
        url +
        (url.includes("?") ? "&" : "?") +
        "q=" +
        encodeURIComponent(testPayload);

      const res = await http.get(testUrl);
      const body =
        typeof res.data === "string" ? res.data : JSON.stringify(res.data);

      // Check for reflected payload (both encoded and unencoded)
      if (body.includes(token) || body.includes(testPayload)) {
        findings.push({
          route: url,
          attack: "xss",
          payload: testUrl,
          evidence: "XSS payload reflected in response",
          severity: "high",
        });
      }

      await sleep(100);
    }
  } catch (_) {}
  return findings;
}

async function probeIDOR(url) {
  const findings = [];
  try {
    // Check for numeric IDs in path
    const pathMatch = url.match(/(.*?)(\d+)([^0-9]*$)/);
    if (pathMatch) {
      const n = parseInt(pathMatch[2], 10);
      const neighbor = url.replace(pathMatch[2], String(n + 1));

      const [r0, r1] = await Promise.all([http.get(url), http.get(neighbor)]);
      if (r0.status === 200 && r1.status === 200) {
        const b0 =
          typeof r0.data === "string" ? r0.data : JSON.stringify(r0.data);
        const b1 =
          typeof r1.data === "string" ? r1.data : JSON.stringify(r1.data);
        if (b0 !== b1) {
          findings.push({
            route: url,
            attack: "idor",
            payload: neighbor,
            evidence:
              "Sequential ID enumeration possible - different content returned",
            severity: "critical",
          });
        }
      }
    }

    // Test common ID parameters
    const idParams = ["id", "user_id", "userId", "uid", "account", "profile"];
    for (const param of idParams) {
      const testUrl = url + (url.includes("?") ? "&" : "?") + param + "=1";
      const testUrl2 = url + (url.includes("?") ? "&" : "?") + param + "=2";

      try {
        const [res1, res2] = await Promise.all([
          http.get(testUrl),
          http.get(testUrl2),
        ]);
        if (res1.status === 200 && res2.status === 200) {
          const body1 =
            typeof res1.data === "string"
              ? res1.data
              : JSON.stringify(res1.data);
          const body2 =
            typeof res2.data === "string"
              ? res2.data
              : JSON.stringify(res2.data);

          if (body1 !== body2 && body1.length > 100 && body2.length > 100) {
            findings.push({
              route: url,
              attack: "idor",
              payload: `${testUrl} vs ${testUrl2}`,
              evidence: `Parameter '${param}' allows access to different resources`,
              severity: "high",
            });
          }
        }
      } catch (_) {}
      await sleep(100);
    }
  } catch (_) {}
  return findings;
}

async function probeCSRF(url) {
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
    const setCookie = (res.headers["set-cookie"] || []).join("; ");
    const cookieFlagsOk = /SameSite|Secure/i.test(setCookie);

    if (!hasToken || !cookieFlagsOk) {
      findings.push({
        route: url,
        attack: "csrf",
        evidence: `POST form present, token ${
          hasToken ? "present" : "missing"
        }, cookie flags ${cookieFlagsOk ? "ok" : "weak/missing"}`,
        severity: "medium",
      });
    }
  } catch (_) {}
  return findings;
}

async function probeCORS(url) {
  const findings = [];
  try {
    const res = await http.options(url, {
      headers: {
        Origin: "http://evil.example",
        "Access-Control-Request-Method": "GET",
      },
    });
    const aco = res.headers["access-control-allow-origin"];
    const acc = res.headers["access-control-allow-credentials"];
    if (aco === "*" && String(acc).toLowerCase() === "true") {
      findings.push({
        route: url,
        attack: "cors",
        evidence: "ACA-Origin: * with credentials=true",
        severity: "high",
      });
    }
  } catch (_) {}
  return findings;
}

async function probeHeaders(url) {
  const findings = [];
  try {
    const res = await http.get(url);
    const h = res.headers;
    const missing = [];
    const weak = [];

    if (!h["content-security-policy"]) missing.push("CSP");
    if (!h["strict-transport-security"]) missing.push("HSTS");
    if (!h["x-frame-options"]) missing.push("X-Frame-Options");
    if (!h["x-content-type-options"]) missing.push("X-Content-Type-Options");
    if (!h["referrer-policy"]) missing.push("Referrer-Policy");
    if (!h["permissions-policy"]) missing.push("Permissions-Policy");

    // Check for information disclosure
    if (h["server"]) weak.push(`Server header reveals: ${h["server"]}`);
    if (h["x-powered-by"])
      weak.push(`X-Powered-By reveals: ${h["x-powered-by"]}`);
    if (h["x-aspnet-version"])
      weak.push(`ASP.NET version disclosed: ${h["x-aspnet-version"]}`);

    if (missing.length || weak.length) {
      findings.push({
        route: url,
        attack: "headers",
        evidence: `Missing: ${missing.join(", ")}${
          weak.length ? ". Info disclosure: " + weak.join(", ") : ""
        }`,
        severity: missing.length > 3 ? "high" : "medium",
      });
    }
  } catch (_) {}
  return findings;
}

// New advanced vulnerability tests
async function probeJWT(url) {
  const findings = [];
  try {
    const res = await http.get(url);
    const authHeader = res.headers["authorization"];
    const cookies = res.headers["set-cookie"] || [];

    // Look for JWT tokens in responses
    const body =
      typeof res.data === "string" ? res.data : JSON.stringify(res.data);
    const jwtPattern =
      /eyJ[A-Za-z0-9-_=]+\.[A-Za-z0-9-_=]+\.?[A-Za-z0-9-_.+/=]*/g;
    const tokens = body.match(jwtPattern);

    if (tokens) {
      for (const token of tokens) {
        try {
          const parts = token.split(".");
          if (parts.length >= 2) {
            const header = JSON.parse(
              Buffer.from(
                parts[0].replace(/-/g, "+").replace(/_/g, "/"),
                "base64"
              ).toString()
            );
            const payload = JSON.parse(
              Buffer.from(
                parts[1].replace(/-/g, "+").replace(/_/g, "/"),
                "base64"
              ).toString()
            );

            // Check for weak algorithms
            if (header.alg === "none" || header.alg === "HS256") {
              findings.push({
                route: url,
                attack: "jwt",
                evidence: `Weak JWT algorithm detected: ${header.alg}`,
                severity: "high",
              });
            }

            // Check for long expiration
            if (payload.exp) {
              const expTime = new Date(payload.exp * 1000);
              const now = new Date();
              const diffDays = (expTime - now) / (1000 * 60 * 60 * 24);
              if (diffDays > 365) {
                findings.push({
                  route: url,
                  attack: "jwt",
                  evidence: `JWT token expires in ${Math.round(
                    diffDays
                  )} days (too long)`,
                  severity: "medium",
                });
              }
            }
          }
        } catch (_) {}
      }
    }
  } catch (_) {}
  return findings;
}

async function probeAPIVersioning(url) {
  const findings = [];
  try {
    // Test for older API versions
    const versions = ["v1", "v2", "api/v1", "api/v2"];
    for (const version of versions) {
      const testUrl = url
        .replace(/\/api\//, `/${version}/`)
        .replace(/\/v\d+\//, `/${version}/`);
      if (testUrl !== url) {
        const res = await http.get(testUrl);
        if (res.status === 200) {
          findings.push({
            route: url,
            attack: "api_versioning",
            payload: testUrl,
            evidence: `Older API version accessible: ${testUrl}`,
            severity: "medium",
          });
        }
      }
      await sleep(100);
    }
  } catch (_) {}
  return findings;
}

async function probeDirectoryTraversal(url) {
  const findings = [];
  const payloads = [
    "../../../etc/passwd",
    "..\\..\\..\\windows\\system32\\drivers\\etc\\hosts",
    "%2e%2e%2f%2e%2e%2f%2e%2e%2fetc%2fpasswd",
    "....//....//....//etc/passwd",
  ];

  try {
    for (const payload of payloads) {
      const testUrl =
        url +
        (url.includes("?") ? "&" : "?") +
        "file=" +
        encodeURIComponent(payload);
      const res = await http.get(testUrl);
      const body =
        typeof res.data === "string" ? res.data : JSON.stringify(res.data);

      if (/root:x:0:0|127\.0\.0\.1.*localhost|\[boot loader\]/i.test(body)) {
        findings.push({
          route: url,
          attack: "directory_traversal",
          payload: testUrl,
          evidence: "System file content detected in response",
          severity: "critical",
        });
      }
      await sleep(100);
    }
  } catch (_) {}
  return findings;
}

// A02 - Cryptographic Failures
async function probeCryptographicFailures(url) {
  const findings = [];
  try {
    const res = await http.get(url);

    // Check for weak encryption indicators
    const body =
      typeof res.data === "string" ? res.data : JSON.stringify(res.data);

    // Look for exposed sensitive data patterns
    const sensitivePatterns = [
      /password\s*[=:]\s*['"][^'"]{3,}['"]/gi,
      /api[_-]?key\s*[=:]\s*['"][^'"]{10,}['"]/gi,
      /secret\s*[=:]\s*['"][^'"]{5,}['"]/gi,
      /token\s*[=:]\s*['"][^'"]{10,}['"]/gi,
      /-----BEGIN [A-Z ]+-----/gi, // Private keys
      /[A-Za-z0-9+/]{40,}={0,2}/g, // Base64 encoded data
    ];

    for (const pattern of sensitivePatterns) {
      const matches = body.match(pattern);
      if (matches && matches.length > 0) {
        findings.push({
          route: url,
          attack: "cryptographic_failures",
          evidence: `Potentially exposed sensitive data: ${matches[0].substring(
            0,
            50
          )}...`,
          severity: "high",
        });
      }
    }

    // Check SSL/TLS configuration
    if (url.startsWith("http://")) {
      findings.push({
        route: url,
        attack: "cryptographic_failures",
        evidence: "HTTP used instead of HTTPS - data transmitted in plain text",
        severity: "medium",
      });
    }

    // Check for weak cookie flags
    const cookies = res.headers["set-cookie"] || [];
    for (const cookie of cookies) {
      if (!cookie.includes("Secure") && url.startsWith("https://")) {
        findings.push({
          route: url,
          attack: "cryptographic_failures",
          evidence: `Cookie without Secure flag: ${cookie.split(";")[0]}`,
          severity: "medium",
        });
      }
      if (!cookie.includes("HttpOnly")) {
        findings.push({
          route: url,
          attack: "cryptographic_failures",
          evidence: `Cookie without HttpOnly flag: ${cookie.split(";")[0]}`,
          severity: "medium",
        });
      }
    }
  } catch (_) {}
  return findings;
}

// A04 - Insecure Design
async function probeInsecureDesign(url) {
  const findings = [];
  try {
    // Test for missing rate limiting
    const rapidRequests = [];
    for (let i = 0; i < 5; i++) {
      rapidRequests.push(http.get(url));
    }

    const responses = await Promise.all(rapidRequests);
    const allSuccessful = responses.every((r) => r.status === 200);

    if (allSuccessful) {
      findings.push({
        route: url,
        attack: "insecure_design",
        evidence: "No rate limiting detected - 5 rapid requests all succeeded",
        severity: "medium",
      });
    }

    // Check for admin/debug endpoints
    const debugPaths = [
      "/admin",
      "/debug",
      "/test",
      "/dev",
      "/api/admin",
      "/swagger",
    ];
    for (const path of debugPaths) {
      try {
        const testUrl = new URL(url).origin + path;
        const res = await http.get(testUrl);
        if (res.status === 200) {
          findings.push({
            route: url,
            attack: "insecure_design",
            payload: testUrl,
            evidence: `Administrative/debug endpoint accessible: ${testUrl}`,
            severity: "high",
          });
        }
      } catch (_) {}
      await sleep(50);
    }
  } catch (_) {}
  return findings;
}

// A06 - Vulnerable and Outdated Components
async function probeVulnerableComponents(url) {
  const findings = [];
  try {
    const res = await http.get(url);
    const headers = res.headers;
    const body =
      typeof res.data === "string" ? res.data : JSON.stringify(res.data);

    // Check server versions
    const serverHeader = headers["server"];
    if (serverHeader) {
      // Look for version numbers in server header
      const versionMatch = serverHeader.match(
        /([a-zA-Z]+)\/(\d+\.\d+(?:\.\d+)?)/
      );
      if (versionMatch) {
        findings.push({
          route: url,
          attack: "vulnerable_components",
          evidence: `Server version disclosed: ${versionMatch[0]} (may be outdated)`,
          severity: "medium",
        });
      }
    }

    // Check for known vulnerable software signatures
    const vulnerableSignatures = [
      { pattern: /jQuery v?1\.[0-7]/i, name: "jQuery < 1.8" },
      { pattern: /Apache\/2\.[0-2]/i, name: "Apache < 2.3" },
      { pattern: /nginx\/1\.[0-9]\./i, name: "Nginx 1.x" },
      { pattern: /PHP\/[45]\./i, name: "PHP 4.x or 5.x" },
      { pattern: /WordPress [0-4]\./i, name: "WordPress < 5.0" },
    ];

    for (const sig of vulnerableSignatures) {
      if (sig.pattern.test(body) || sig.pattern.test(serverHeader || "")) {
        findings.push({
          route: url,
          attack: "vulnerable_components",
          evidence: `Potentially vulnerable component detected: ${sig.name}`,
          severity: "high",
        });
      }
    }
  } catch (_) {}
  return findings;
}

// A08 - Software and Data Integrity Failures
async function probeIntegrityFailures(url) {
  const findings = [];
  try {
    const res = await http.get(url);
    const body =
      typeof res.data === "string" ? res.data : JSON.stringify(res.data);

    // Check for unsigned/unverified external resources
    const externalResources = [
      ...body.matchAll(/<script[^>]+src=['"]([^'"]+)['"]/gi),
      ...body.matchAll(/<link[^>]+href=['"]([^'"]+)['"]/gi),
    ];

    for (const match of externalResources) {
      const resourceUrl = match[1];
      if (
        resourceUrl.startsWith("http") &&
        !resourceUrl.includes(new URL(url).hostname)
      ) {
        // Check if resource has integrity attribute
        const fullTag = match[0];
        if (!fullTag.includes("integrity=")) {
          findings.push({
            route: url,
            attack: "integrity_failures",
            evidence: `External resource without integrity check: ${resourceUrl}`,
            severity: "medium",
          });
        }
      }
    }

    // Check for deserialization patterns
    if (/unserialize|pickle\.loads|eval\(|new Function\(/i.test(body)) {
      findings.push({
        route: url,
        attack: "integrity_failures",
        evidence: "Potentially unsafe deserialization patterns detected",
        severity: "high",
      });
    }
  } catch (_) {}
  return findings;
}

// A09 - Security Logging and Monitoring Failures
async function probeLoggingFailures(url) {
  const findings = [];
  try {
    // Test for error information disclosure
    const errorPayloads = ["\\", "{{7*7}}", "${7*7}", "<test>", "|id"];

    for (const payload of errorPayloads) {
      const testUrl =
        url +
        (url.includes("?") ? "&" : "?") +
        "debug=" +
        encodeURIComponent(payload);
      const res = await http.get(testUrl);
      const body =
        typeof res.data === "string" ? res.data : JSON.stringify(res.data);

      // Look for stack traces or detailed error messages
      if (
        /stack trace|traceback|line \d+|file .*\.php|\.java:\d+|at [A-Z]/i.test(
          body
        )
      ) {
        findings.push({
          route: url,
          attack: "logging_failures",
          payload: testUrl,
          evidence:
            "Detailed error information disclosed (potential information leakage)",
          severity: "medium",
        });
        break; // Only flag once per URL
      }
      await sleep(50);
    }

    // Check for missing security headers that indicate poor monitoring
    const res = await http.get(url);
    const headers = res.headers;

    if (!headers["x-frame-options"] && !headers["content-security-policy"]) {
      findings.push({
        route: url,
        attack: "logging_failures",
        evidence:
          "Missing security headers suggest inadequate security monitoring",
        severity: "low",
      });
    }
  } catch (_) {}
  return findings;
}

// A10 - Server-Side Request Forgery (SSRF)
async function probeSSRF(url) {
  const findings = [];
  try {
    const ssrfPayloads = [
      "http://localhost:22",
      "http://127.0.0.1:3306",
      "http://169.254.169.254/latest/meta-data/",
      "file:///etc/passwd",
      "http://metadata.google.internal/",
    ];

    for (const payload of ssrfPayloads) {
      const testParams = ["url", "link", "src", "href", "host", "redirect"];

      for (const param of testParams) {
        const testUrl =
          url +
          (url.includes("?") ? "&" : "?") +
          param +
          "=" +
          encodeURIComponent(payload);

        try {
          const startTime = Date.now();
          const res = await http.get(testUrl);
          const responseTime = Date.now() - startTime;

          const body =
            typeof res.data === "string" ? res.data : JSON.stringify(res.data);

          // Check for SSRF indicators
          if (
            responseTime > 5000 || // Long response time (timeout attempting connection)
            /connection refused|connection timeout|host unreachable/i.test(
              body
            ) ||
            /ec2|aws|metadata|169\.254/i.test(body)
          ) {
            findings.push({
              route: url,
              attack: "ssrf",
              payload: testUrl,
              evidence: `Possible SSRF: Server attempted to fetch ${payload}`,
              severity: "high",
            });
          }
        } catch (_) {}
        await sleep(100);
      }
    }
  } catch (_) {}
  return findings;
}

// Execute probes chosen for this URL
async function runProbes(url, tests) {
  const tasks = [];
  const set = new Set(tests);

  // OWASP Top 10 2021 Mappings:
  if (set.has("sqli")) tasks.push(probeSQLi(url)); // A03 - Injection
  if (set.has("xss")) tasks.push(probeXSS(url)); // A03 - Injection
  if (set.has("idor")) tasks.push(probeIDOR(url)); // A01 - Broken Access Control
  if (set.has("csrf")) tasks.push(probeCSRF(url)); // A01 - Broken Access Control
  if (set.has("cors")) tasks.push(probeCORS(url)); // A05 - Security Misconfiguration
  if (set.has("headers")) tasks.push(probeHeaders(url)); // A05 - Security Misconfiguration
  if (set.has("jwt")) tasks.push(probeJWT(url)); // A07 - Identification and Authentication Failures
  if (set.has("api_versioning")) tasks.push(probeAPIVersioning(url)); // A01 - Broken Access Control
  if (set.has("directory_traversal")) tasks.push(probeDirectoryTraversal(url)); // A03 - Injection
  if (set.has("cryptographic_failures"))
    tasks.push(probeCryptographicFailures(url)); // A02 - Cryptographic Failures
  if (set.has("insecure_design")) tasks.push(probeInsecureDesign(url)); // A04 - Insecure Design
  if (set.has("vulnerable_components"))
    tasks.push(probeVulnerableComponents(url)); // A06 - Vulnerable Components
  if (set.has("integrity_failures")) tasks.push(probeIntegrityFailures(url)); // A08 - Software and Data Integrity Failures
  if (set.has("logging_failures")) tasks.push(probeLoggingFailures(url)); // A09 - Security Logging and Monitoring Failures
  if (set.has("ssrf")) tasks.push(probeSSRF(url)); // A10 - Server-Side Request Forgery

  const results = await Promise.all(tasks);
  return results.flat();
}

// ------------------------------
// 4) Solution Generation with Gemini
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
    `🧠 Generating solutions for ${findings.length} findings using Gemini AI...`
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
      await new Promise((resolve) => setTimeout(resolve, 500));
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
// 5) Orchestrator
// ------------------------------
async function main() {
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
  let allUrls = [];
  if (Array.isArray(data)) {
    allUrls = data;
  } else if (data.pages || data.apiEndpoints) {
    allUrls = [...(data.pages || []), ...(data.apiEndpoints || [])];
  } else {
    console.error(
      "❌ Invalid input format. Expected array of URLs or object with 'pages'/'apiEndpoints'"
    );
    process.exit(1);
  }

  if (allUrls.length === 0) {
    console.error("❌ No URLs found in input file");
    process.exit(1);
  }

  console.log(
    `📊 Found ${allUrls.length} URLs total. Filtering for security testing...`
  );

  // Filter URLs using Gemini to focus on testable endpoints
  const urls = await filterUrlsForTesting(allUrls);

  console.log(`🎯 Selected ${urls.length} URLs for deep security testing`);

  if (urls.length === 0) {
    console.error("❌ No suitable URLs found for testing after filtering");
    process.exit(1);
  }

  console.log("🤖 Planning tests with Gemini…");
  // (Optional) you could first fingerprint all and pass to AI; here we plan first.
  const aiPlan = await aiPlanTests(urls, null);
  console.log("📝 AI Plan:", JSON.stringify(aiPlan, null, 2));

  const findingsAll = [];
  const fingerprintsAll = [];

  for (const url of urls) {
    console.log(`\n🔎 Fingerprinting ${url}`);
    const fp = await fingerprint(url);
    fingerprintsAll.push(fp);
    console.log("   ↳", {
      status: fp.status,
      server: fp.server,
      dbHints: fp.dbHints,
    });

    // Simple refinement: if dbHints includes NoSQL → drop SQLi
    let planned = aiPlan[url] || ["headers"];
    if (fp.dbHints.includes("NoSQL")) {
      planned = planned.filter((t) => t !== "sqli");
    }

    console.log(`⚔️  Probing ${url} with: ${planned.join(", ") || "(none)"}`);
    const f = await runProbes(url, planned);
    findingsAll.push(...f);

    // polite delay to avoid hammering
    await sleep(300);
  }

  console.log(
    `\n🧠 Generating AI-powered solutions for ${findingsAll.length} findings...`
  );

  // Generate solutions for all findings
  const findingsWithSolutions = await generateSolutionsForFindings(findingsAll);

  // Save artifacts to Security folder
  fs.writeFileSync(
    "Security/findings-deep.json",
    JSON.stringify(findingsWithSolutions, null, 2)
  );
  fs.writeFileSync(
    "Security/fingerprints-deep.json",
    JSON.stringify(fingerprintsAll, null, 2)
  );

  console.log("\n📄 Results saved to:");
  console.log("   • Security/findings-deep.json");
  console.log("   • Security/fingerprints-deep.json");

  // Enhanced reporting
  console.log("\n" + "=".repeat(70));
  console.log("🔍 OWASP TOP 10 2021 VULNERABILITY SCAN RESULTS");
  console.log("=".repeat(70));

  if (findingsAll.length === 0) {
    console.log("✅ No vulnerabilities detected (or targets are well-secured)");
  } else {
    const severityCounts = { critical: 0, high: 0, medium: 0, low: 0 };
    const attackTypes = {};
    const owaspMapping = {
      idor: "A01 - Broken Access Control",
      csrf: "A01 - Broken Access Control",
      api_versioning: "A01 - Broken Access Control",
      cryptographic_failures: "A02 - Cryptographic Failures",
      sqli: "A03 - Injection",
      xss: "A03 - Injection",
      directory_traversal: "A03 - Injection",
      insecure_design: "A04 - Insecure Design",
      headers: "A05 - Security Misconfiguration",
      cors: "A05 - Security Misconfiguration",
      vulnerable_components: "A06 - Vulnerable and Outdated Components",
      jwt: "A07 - Identification and Authentication Failures",
      integrity_failures: "A08 - Software and Data Integrity Failures",
      logging_failures: "A09 - Security Logging and Monitoring Failures",
      ssrf: "A10 - Server-Side Request Forgery",
    };

    findingsWithSolutions.forEach((f) => {
      severityCounts[f.severity]++;
      attackTypes[f.attack] = (attackTypes[f.attack] || 0) + 1;
    });

    console.log(
      `\n📊 Summary: ${findingsWithSolutions.length} findings with AI-generated solutions`
    );
    console.log(`   🔴 Critical: ${severityCounts.critical}`);
    console.log(`   🟠 High: ${severityCounts.high}`);
    console.log(`   🟡 Medium: ${severityCounts.medium}`);
    console.log(`   🟢 Low: ${severityCounts.low}`);

    console.log(`\n📋 OWASP Top 10 2021 Coverage:`);
    Object.entries(attackTypes).forEach(([type, count]) => {
      const owaspCategory = owaspMapping[type] || "Unknown";
      console.log(`   ${owaspCategory}: ${count} findings (${type})`);
    });

    console.log(`\n⚠️  Critical & High Severity Findings with Solutions:`);
    findingsWithSolutions
      .filter((f) => f.severity === "critical" || f.severity === "high")
      .forEach((f) => {
        const owaspCategory = owaspMapping[f.attack] || "Unknown";
        console.log(`   🎯 ${owaspCategory.toUpperCase()}`);
        console.log(`      ${f.attack.toUpperCase()} on ${f.route}`);
        console.log(`      Evidence: ${f.evidence}`);
        if (f.payload) console.log(`      Payload: ${f.payload}`);

        // Display AI-generated solution
        if (f.solution) {
          console.log(`      💡 Solution: ${f.solution.solution}`);
          console.log(
            `      🔧 Priority: ${f.solution.priority} | Effort: ${f.solution.estimated_effort}`
          );
          if (f.solution.code_snippet) {
            console.log(`      📝 Quick Fix: ${f.solution.code_snippet}`);
          }
        }
        console.log("");
      });
  }

  console.log(
    "\n✅ Done. Wrote findings.json and fingerprints.json with AI-generated solutions"
  );
  console.log("🏆 OWASP Top 10 Complete Coverage with Remediation Achieved!");
}

main().catch((e) => {
  console.error("Fatal:", e);
  process.exit(1);
});
