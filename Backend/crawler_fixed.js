import puppeteer from "puppeteer";
import { URL } from "url";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

// ES module equivalent of __dirname
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Simple breadth-first crawler using Puppeteer
// Usage: node crawler.js <startUrl> [maxPages]

async function crawl(startUrl, maxPages = 20) {
  const startDomain = new URL(startUrl).hostname;
  const browser = await puppeteer.launch({ headless: true });

  // Improved ignore list for noisy endpoints
  const IGNORED_PATTERNS = [
    /socket\.io/i,
    /websocket/i,
    /wss:\/\//i,
    /sockjs/i,
    /\/socket\//i,
    /collect/i,
    /analytics/i,
    /google-analytics/i,
    /gtag/i,
    /mixpanel/i,
    /hotjar/i,
    /matomo/i,
    /amplitude/i,
    /telemetry/i,
    /beacon/i,
    /ping/i,
  ];

  const visited = new Set();
  const discoveredPages = new Set();
  const apiEndpoints = new Set();

  // Normalize page URL (keep hash for SPA routes like #/login)
  const normalizePage = (u) => {
    try {
      const nu = new URL(u);
      // keep hash because many SPA routes use it
      // normalize trailing slashes in pathname
      if (nu.pathname !== "/" && nu.pathname.endsWith("/"))
        nu.pathname = nu.pathname.replace(/\/+$/, "");
      return nu.toString();
    } catch (e) {
      return u;
    }
  };

  // Normalize API endpoint (strip fragment)
  const normalizeEndpoint = (u) => {
    try {
      const nu = new URL(u);
      nu.hash = "";
      return nu.toString();
    } catch (e) {
      return u;
    }
  };

  const queue = [normalizePage(startUrl)];
  // Timing/config for idle detector
  const idleThreshold = 300; // ms without outstanding XHR/fetch to consider page idle
  const maxWaitPerPage = 1200; // hard max per page

  // Quick-check settings: produce a small JSON file quickly
  const quickLimitPages = 8; // write quick file after this many pages visited
  const quickTimeMs = 6000; // or after this many milliseconds since start
  const startTime = Date.now();
  let quickWritten = false;

  console.log(`🚀 Starting crawl of ${startUrl} (max ${maxPages} pages)...`);

  while (queue.length > 0 && visited.size < maxPages) {
    const url = queue.shift();
    if (visited.has(url)) continue;
    visited.add(url);
    discoveredPages.add(url);

    console.log(`🔍 Crawling page ${visited.size}/${maxPages}: ${url}`);

    let pageInstance;
    try {
      pageInstance = await browser.newPage();

      // Block non-essential resource types to speed up navigation
      await pageInstance.setRequestInterception(true);
      pageInstance.on("request", (req) => {
        const rType = req.resourceType();
        // Abort large/static resources that aren't needed
        if (["image", "stylesheet", "font", "media"].includes(rType))
          return req.abort();
        // Otherwise continue
        try {
          req.continue();
        } catch (e) {
          /* ignore if already handled */
        }
      });

      // Track outstanding XHR/fetch to implement idle detection
      let outstanding = 0;
      let lastRequestFinishedAt = Date.now();

      pageInstance.on("request", (req) => {
        const rt = req.resourceType();
        if (rt === "xhr" || rt === "fetch") {
          outstanding += 1;
        }
      });

      pageInstance.on("requestfinished", async (req) => {
        const rt = req.resourceType();
        if (rt === "xhr" || rt === "fetch") {
          outstanding = Math.max(0, outstanding - 1);
          lastRequestFinishedAt = Date.now();

          // process request/response and filter
          try {
            const reqUrl = req.url();
            if (IGNORED_PATTERNS.some((rx) => rx.test(reqUrl))) return;
            const method = req.method();
            const response = req.response();
            const headers = response ? response.headers() : {};
            const contentType =
              (headers["content-type"] || headers["Content-Type"] || "") + "";

            // Heuristic: accept endpoint if JSON response OR non-GET method OR path contains /api/ or /rest/
            const isJson = /json/i.test(contentType);
            let isApiPath = false;
            try {
              isApiPath = /\/api\/|\/rest\//i.test(new URL(reqUrl).pathname);
            } catch (e) {}

            if (isJson || method !== "GET" || isApiPath) {
              apiEndpoints.add(`${method} ${normalizeEndpoint(reqUrl)}`);
            }
          } catch (e) {
            // ignore processing errors
          }
        }
      });

      pageInstance.on("requestfailed", (req) => {
        const rt = req.resourceType();
        if (rt === "xhr" || rt === "fetch") {
          outstanding = Math.max(0, outstanding - 1);
          lastRequestFinishedAt = Date.now();
        }
      });

      // Navigate quickly: DOMContentLoaded and then wait for idle or timeout
      await pageInstance.goto(url, {
        waitUntil: "domcontentloaded",
        timeout: 30000,
      });

      const startWait = Date.now();
      while (Date.now() - startWait < maxWaitPerPage) {
        if (
          outstanding === 0 &&
          Date.now() - lastRequestFinishedAt >= idleThreshold
        )
          break;
        await pageInstance.waitForTimeout(100);
      }

      // Extract links (only same-hostname links). Keep hash for SPA routes.
      const anchors = await pageInstance.$$eval("a[href]", (nodes) =>
        nodes.map((n) => n.getAttribute("href"))
      );
      for (let href of anchors) {
        if (!href) continue;
        try {
          const absolute = new URL(href, url).toString();
          const hostname = new URL(absolute).hostname;
          if (hostname === startDomain) {
            const norm = normalizePage(absolute);
            if (
              !visited.has(norm) &&
              !discoveredPages.has(norm) &&
              !queue.includes(norm)
            ) {
              discoveredPages.add(norm);
              queue.push(norm);
            }
          }
        } catch (e) {
          // ignore malformed URLs
        }
      }

      // If quick file not yet written, write it when we've hit the quick criteria
      if (!quickWritten) {
        const elapsed = Date.now() - startTime;
        if (visited.size >= quickLimitPages || elapsed >= quickTimeMs) {
          try {
            const quickData = {
              generatedAt: new Date().toISOString(),
              pages: Array.from(discoveredPages).slice(0, quickLimitPages),
              apiEndpoints: Array.from(apiEndpoints).slice(0, 200),
            };
            const quickPath = path.join(__dirname, "forquickcheck.json");
            fs.writeFileSync(quickPath, JSON.stringify(quickData, null, 2));
            console.log(`Wrote quick check file (${quickPath})`);
            quickWritten = true;
          } catch (e) {
            console.error("Failed to write quick-check file", e.message);
          }
        }
      }
    } catch (err) {
      console.error("Error visiting", url, err.message);
    } finally {
      if (pageInstance && !pageInstance.isClosed()) {
        try {
          await pageInstance.close();
        } catch (e) {
          /* ignore */
        }
      }
    }
  }

  await browser.close();

  // Write deep-check JSON with full results
  try {
    const deepData = {
      generatedAt: new Date().toISOString(),
      pages: Array.from(discoveredPages),
      apiEndpoints: Array.from(apiEndpoints),
    };
    const deepPath = path.join(__dirname, "fordeepcheck.json");
    fs.writeFileSync(deepPath, JSON.stringify(deepData, null, 2));
    console.log(`Wrote deep check file (${deepPath})`);
  } catch (e) {
    console.error("Failed to write deep-check file", e.message);
  }

  // Summary report
  console.log("\n=== Crawl summary report ===\n");
  console.log(`📊 Statistics:`);
  console.log(`   • Pages visited: ${visited.size}`);
  console.log(`   • Total pages discovered: ${discoveredPages.size}`);
  console.log(`   • API endpoints found: ${apiEndpoints.size}`);
  console.log(`   • Queue remaining: ${queue.length}`);

  console.log("\n📄 Files generated:");
  console.log("   • forquickcheck.json (for quick scans)");
  console.log("   • fordeepcheck.json (for comprehensive scans)");

  console.log("\nDiscovered pages:");
  for (const p of discoveredPages) console.log(p);

  console.log("\nRelevant API endpoints (method + URL):");
  for (const a of apiEndpoints) console.log(a);
  console.log("\n=== End of report ===");
}

// Run if this file is executed directly
if (
  process.argv[1].endsWith("crawler.js") ||
  process.argv[1].endsWith("crawler_fixed.js")
) {
  const startUrl = process.argv[2];
  const maxPages = parseInt(process.argv[3], 10) || 20;
  if (!startUrl) {
    console.error("Usage: node crawler.js <startUrl> [maxPages]");
    process.exit(1);
  }
  crawl(startUrl, maxPages).catch((e) => {
    console.error("Crawl failed", e);
    process.exit(1);
  });
}
