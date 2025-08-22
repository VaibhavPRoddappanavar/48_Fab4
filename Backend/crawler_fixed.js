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

async function crawl(startUrl, maxPages = 10) {
  // Ensure URL has proper protocol
  if (!startUrl.startsWith('http://') && !startUrl.startsWith('https://')) {
    startUrl = 'https://' + startUrl;
  }
  
  console.log(`🎯 Target URL: ${startUrl}`);
  
  const startDomain = new URL(startUrl).hostname;
  console.log(`🌐 Target domain: ${startDomain}`);
  
  const browser = await puppeteer.launch({ 
    headless: true,
    args: ['--no-sandbox', '--disable-setuid-sandbox', '--disable-dev-shm-usage']
  });

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
      // Ensure we're still on the same domain
      if (nu.hostname !== startDomain) {
        console.log(`⚠️ Skipping external domain: ${nu.hostname} (expected: ${startDomain})`);
        return null;
      }
      // keep hash because many SPA routes use it
      // normalize trailing slashes in pathname
      if (nu.pathname !== "/" && nu.pathname.endsWith("/"))
        nu.pathname = nu.pathname.replace(/\/+$/, "");
      return nu.toString();
    } catch (e) {
      console.error(`❌ Error normalizing page URL: ${u}`, e.message);
      return null;
    }
  };

  // Normalize API endpoint (strip fragment)
  const normalizeEndpoint = (u) => {
    try {
      const nu = new URL(u);
      // Ensure we're still on the same domain  
      if (nu.hostname !== startDomain) {
        return null;
      }
      nu.hash = "";
      return nu.toString();
    } catch (e) {
      return null;
    }
  };

  const queue = [startUrl];
  
  // Timing/config for idle detector
  const idleThreshold = 500; // increased from 300ms
  const maxWaitPerPage = 2000; // increased from 1200ms for better API detection

  // Quick-check settings: produce a small JSON file quickly
  const quickLimitPages = 8; // write quick file after this many pages visited
  const quickTimeMs = 8000; // increased from 6000ms
  const startTime = Date.now();
  let quickWritten = false;

  console.log(`🚀 Starting crawl of ${startUrl} (max ${maxPages} pages)...`);

  while (queue.length > 0 && visited.size < maxPages) {
    const url = queue.shift();
    if (visited.has(url)) continue;
    visited.add(url);
    
    // Verify we're still on the right domain
    try {
      const urlObj = new URL(url);
      if (urlObj.hostname !== startDomain) {
        console.log(`⚠️ Skipping URL on wrong domain: ${url}`);
        continue;
      }
    } catch (e) {
      console.error(`❌ Invalid URL: ${url}`);
      continue;
    }
    
    discoveredPages.add(url);

    console.log(`🔍 Crawling page ${visited.size}/${maxPages}: ${url}`);

    let pageInstance;
    try {
      pageInstance = await browser.newPage();

      // Block non-essential resource types to speed up navigation
      await pageInstance.setRequestInterception(true);
      pageInstance.on("request", (req) => {
        const rType = req.resourceType();
        // Allow more resource types for better SPA functionality
        if (["image", "media"].includes(rType)) return req.abort();
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
            
            // Check if request is to our target domain
            const reqDomain = new URL(reqUrl).hostname;
            if (reqDomain !== startDomain) {
              return; // Skip external requests
            }
            
            if (IGNORED_PATTERNS.some((rx) => rx.test(reqUrl))) return;
            
            const method = req.method();
            const response = req.response();
            const headers = response ? response.headers() : {};
            const contentType = (headers["content-type"] || headers["Content-Type"] || "") + "";

            // Enhanced heuristic for OWASP Juice Shop:
            const isJson = /json/i.test(contentType);
            const isApiPath = /\/api\/|\/rest\/|\/graphql/i.test(new URL(reqUrl).pathname);
            const hasApiQuery = /\/(login|register|profile|products|basket|order|challenge|admin|user)/i.test(reqUrl);
            
            // More permissive detection for SPA applications like Juice Shop
            if (isJson || method !== "GET" || isApiPath || hasApiQuery) {
              const normalizedEndpoint = normalizeEndpoint(reqUrl);
              if (normalizedEndpoint) {
                apiEndpoints.add(`${method} ${normalizedEndpoint}`);
                console.log(`🔍 Found API endpoint: ${method} ${normalizedEndpoint}`);
              }
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

      // Navigate with better error handling
      const response = await pageInstance.goto(url, {
        waitUntil: "domcontentloaded",
        timeout: 30000,
      });
      
      // Check if we got redirected to a different domain
      const finalUrl = pageInstance.url();
      const finalDomain = new URL(finalUrl).hostname;
      if (finalDomain !== startDomain) {
        console.log(`⚠️ Page ${url} redirected to different domain: ${finalDomain}. Skipping.`);
        continue;
      }

      // For SPAs like OWASP Juice Shop, we need to trigger interactions to load API calls
      try {
        // Wait for Angular/SPA to fully load - using setTimeout instead of waitForTimeout
        await new Promise(resolve => setTimeout(resolve, 1000));
        
        // Try to trigger some interactions that might cause API calls
        await pageInstance.evaluate(() => {
          // Scroll to trigger lazy loading
          window.scrollTo(0, document.body.scrollHeight);
          
          // Try to find and click common navigation elements
          const selectors = [
            'a[href*="login"]',
            'a[href*="register"]', 
            'a[href*="products"]',
            'a[href*="basket"]',
            'a[href*="search"]',
            'button[aria-label*="menu"]',
            '.mat-button',
            '.mat-menu-trigger',
            'mat-icon'
          ];
          
          selectors.forEach(selector => {
            try {
              const elements = document.querySelectorAll(selector);
              if (elements.length > 0) {
                elements[0].click();
              }
            } catch (e) {
              // Ignore click errors
            }
          });
          
          // For Angular apps, try to trigger route changes
          if (window.location.hash === '' || window.location.hash === '#/') {
            try {
              // Common OWASP Juice Shop routes
              const routes = ['#/search', '#/login', '#/register'];
              routes.forEach((route, index) => {
                setTimeout(() => {
                  try {
                    window.location.hash = route;
                  } catch (e) {
                    // Ignore navigation errors
                  }
                }, index * 200);
              });
            } catch (e) {
              // Ignore navigation errors
            }
          }
          
          // Try to trigger search or product loading
          const searchInput = document.querySelector('input[placeholder*="search" i], input[type="search"], #searchQuery');
          if (searchInput) {
            try {
              searchInput.focus();
              searchInput.value = 'apple';
              searchInput.dispatchEvent(new Event('input', { bubbles: true }));
              searchInput.dispatchEvent(new Event('change', { bubbles: true }));
            } catch (e) {
              // Ignore search errors
            }
          }
        });
        
        // Wait a bit more for API calls to trigger - using setTimeout
        await new Promise(resolve => setTimeout(resolve, 1500));
        
      } catch (e) {
        console.log(`⚠️ Error during SPA interaction: ${e.message}`);
      }

      // Wait for SPA to load and make API calls (enhanced waiting)
      const startWait = Date.now();
      while (Date.now() - startWait < maxWaitPerPage) {
        if (
          outstanding === 0 &&
          Date.now() - lastRequestFinishedAt >= idleThreshold
        )
          break;
        // Using setTimeout instead of waitForTimeout
        await new Promise(resolve => setTimeout(resolve, 200));
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
              norm && 
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
            console.log(`✅ Wrote quick check file (${quickPath}) - Pages: ${quickData.pages.length}, APIs: ${quickData.apiEndpoints.length}`);
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
