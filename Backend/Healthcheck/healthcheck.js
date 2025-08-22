import puppeteer from "puppeteer";
import { URL } from "url";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

// ES module equivalent of __dirname
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Comprehensive health check tool similar to Google Lighthouse
// Usage: node healthcheck.js <url>

class WebHealthChecker {
  constructor() {
    this.browser = null;
    this.page = null;
    this.url = null;
    this.metrics = {
      performance: {},
      accessibility: {},
      bestPractices: {},
      seo: {},
      pwa: {},
      metadata: {},
    };
  }

  async initialize(url) {
    this.url = url;
    this.browser = await puppeteer.launch({
      headless: "new",
      args: ["--no-sandbox", "--disable-setuid-sandbox"],
    });
    this.page = await this.browser.newPage();

    // Set viewport for consistent testing
    await this.page.setViewport({ width: 1920, height: 1080 });

    console.log(`🚀 Starting health check for: ${url}`);
  }

  async runFullAudit() {
    try {
      await this.collectPerformanceMetrics();
      await this.auditAccessibility();
      await this.checkBestPractices();
      await this.analyzeSEO();
      await this.checkPWA();
      await this.collectMetadata();

      return this.generateReport();
    } catch (error) {
      console.error("❌ Health check failed:", error.message);
      throw error;
    } finally {
      if (this.browser) {
        await this.browser.close();
      }
    }
  }

  async collectPerformanceMetrics() {
    console.log("📊 Collecting performance metrics...");

    const startTime = Date.now();

    // Navigate with better error handling for SPAs
    const response = await this.page.goto(this.url, {
      waitUntil: "domcontentloaded", // Changed from "networkidle2" to be more permissive
      timeout: 45000, // Increased timeout
    });

    // Wait a bit more for SPAs to settle
    await new Promise(resolve => setTimeout(resolve, 2000));

    const loadTime = Date.now() - startTime;

    // Get performance metrics from browser
    const performanceMetrics = await this.page.evaluate(() => {
      const navigation = performance.getEntriesByType("navigation")[0];
      const paint = performance.getEntriesByType("paint");

      return {
        // Core Web Vitals and performance metrics
        domContentLoaded:
          navigation.domContentLoadedEventEnd -
          navigation.domContentLoadedEventStart,
        loadComplete: navigation.loadEventEnd - navigation.loadEventStart,
        firstPaint: paint.find((p) => p.name === "first-paint")?.startTime || 0,
        firstContentfulPaint:
          paint.find((p) => p.name === "first-contentful-paint")?.startTime ||
          0,
        timeToInteractive: navigation.domInteractive - navigation.fetchStart,

        // Navigation timing
        dnsLookup: navigation.domainLookupEnd - navigation.domainLookupStart,
        tcpConnect: navigation.connectEnd - navigation.connectStart,
        serverResponse: navigation.responseEnd - navigation.requestStart,

        // Resource timing
        totalResources: performance.getEntriesByType("resource").length,
        transferSize: navigation.transferSize || 0,
        encodedBodySize: navigation.encodedBodySize || 0,
        decodedBodySize: navigation.decodedBodySize || 0,
      };
    });

    // Get Largest Contentful Paint (LCP)
    const lcp = await this.page.evaluate(() => {
      return new Promise((resolve) => {
        new PerformanceObserver((list) => {
          const entries = list.getEntries();
          const lastEntry = entries[entries.length - 1];
          resolve(lastEntry?.startTime || 0);
        }).observe({ entryTypes: ["largest-contentful-paint"] });

        // Fallback timeout
        setTimeout(() => resolve(0), 3000);
      });
    });

    // Get Cumulative Layout Shift (CLS)
    const cls = await this.page.evaluate(() => {
      return new Promise((resolve) => {
        let clsValue = 0;
        new PerformanceObserver((list) => {
          for (const entry of list.getEntries()) {
            if (!entry.hadRecentInput) {
              clsValue += entry.value;
            }
          }
          resolve(clsValue);
        }).observe({ entryTypes: ["layout-shift"] });

        setTimeout(() => resolve(clsValue), 3000);
      });
    });

    this.metrics.performance = {
      score: this.calculatePerformanceScore(
        performanceMetrics,
        lcp,
        cls,
        loadTime
      ),
      metrics: {
        ...performanceMetrics,
        largestContentfulPaint: lcp,
        cumulativeLayoutShift: cls,
        totalLoadTime: loadTime,
        responseStatus: response.status(),
        responseHeaders: response.headers(),
      },
      opportunities: this.identifyPerformanceOpportunities(
        performanceMetrics,
        lcp,
        cls
      ),
    };
  }

  async auditAccessibility() {
    console.log("♿ Auditing accessibility...");

    const accessibilityIssues = await this.page.evaluate(() => {
      const issues = [];

      // Check for images without alt text
      const imagesWithoutAlt = document.querySelectorAll("img:not([alt])");
      if (imagesWithoutAlt.length > 0) {
        issues.push({
          type: "missing-alt-text",
          severity: "high",
          count: imagesWithoutAlt.length,
          description: "Images missing alt text for screen readers",
        });
      }

      // Check for missing form labels
      const inputsWithoutLabels = document.querySelectorAll(
        "input:not([aria-label]):not([aria-labelledby])"
      );
      const unlabeledInputs = Array.from(inputsWithoutLabels).filter(
        (input) => {
          const id = input.id;
          return !id || !document.querySelector(`label[for="${id}"]`);
        }
      );

      if (unlabeledInputs.length > 0) {
        issues.push({
          type: "missing-form-labels",
          severity: "high",
          count: unlabeledInputs.length,
          description: "Form inputs missing proper labels",
        });
      }

      // Check for heading hierarchy
      const headings = document.querySelectorAll("h1, h2, h3, h4, h5, h6");
      let headingIssues = 0;
      let lastLevel = 0;

      headings.forEach((heading) => {
        const level = parseInt(heading.tagName.substring(1));
        if (level > lastLevel + 1) {
          headingIssues++;
        }
        lastLevel = level;
      });

      if (headingIssues > 0) {
        issues.push({
          type: "heading-hierarchy",
          severity: "medium",
          count: headingIssues,
          description: "Improper heading hierarchy detected",
        });
      }

      // Check for color contrast (basic check)
      const elements = document.querySelectorAll("*");
      let contrastIssues = 0;

      Array.from(elements)
        .slice(0, 100)
        .forEach((el) => {
          const style = window.getComputedStyle(el);
          const color = style.color;
          const backgroundColor = style.backgroundColor;

          // Basic contrast check (simplified)
          if (
            color &&
            backgroundColor &&
            color !== "rgba(0, 0, 0, 0)" &&
            backgroundColor !== "rgba(0, 0, 0, 0)"
          ) {
            // This is a simplified check - real contrast calculation is more complex
            if (color === backgroundColor) {
              contrastIssues++;
            }
          }
        });

      // Check for ARIA attributes (proper way to find elements with any aria-* attribute)
      const allElements = document.querySelectorAll("*");
      const elementsWithAria = Array.from(allElements).filter((el) => {
        return Array.from(el.attributes).some((attr) =>
          attr.name.startsWith("aria-")
        );
      });

      const focusableElements = document.querySelectorAll(
        "button, a, input, select, textarea, [tabindex]"
      );

      return {
        issues,
        summary: {
          totalImages: document.querySelectorAll("img").length,
          imagesWithAlt: document.querySelectorAll("img[alt]").length,
          totalForms: document.querySelectorAll("form").length,
          totalHeadings: headings.length,
          elementsWithAria: elementsWithAria.length,
          focusableElements: focusableElements.length,
          contrastIssues,
        },
      };
    });

    this.metrics.accessibility = {
      score: this.calculateAccessibilityScore(accessibilityIssues),
      ...accessibilityIssues,
    };
  }

  async checkBestPractices() {
    console.log("✅ Checking web development best practices...");

    const bestPractices = await this.page.evaluate(() => {
      const issues = [];

      // Check for viewport meta tag (responsive design)
      const viewport = document.querySelector('meta[name="viewport"]');
      if (!viewport) {
        issues.push({
          type: "missing-viewport",
          severity: "medium",
          description: "Missing viewport meta tag for responsive design",
        });
      }

      // Check for favicon
      const favicon = document.querySelector(
        'link[rel="icon"], link[rel="shortcut icon"]'
      );
      if (!favicon) {
        issues.push({
          type: "missing-favicon",
          severity: "low",
          description: "Missing favicon",
        });
      }

      // Check for excessive DOM depth
      const getAllElements = () => document.querySelectorAll("*");
      const allElements = getAllElements();
      let maxDepth = 0;

      allElements.forEach((el) => {
        let depth = 0;
        let parent = el.parentElement;
        while (parent) {
          depth++;
          parent = parent.parentElement;
        }
        maxDepth = Math.max(maxDepth, depth);
      });

      if (maxDepth > 32) {
        issues.push({
          type: "excessive-dom-depth",
          severity: "medium",
          depth: maxDepth,
          description: "Excessive DOM depth may impact performance",
        });
      }

      // Check for excessive DOM size
      if (allElements.length > 1500) {
        issues.push({
          type: "large-dom-size",
          severity: "medium",
          count: allElements.length,
          description: "Large DOM size may impact performance",
        });
      }

      // Check for inline styles (should use CSS classes)
      const elementsWithInlineStyles = document.querySelectorAll("[style]");
      if (elementsWithInlineStyles.length > 10) {
        issues.push({
          type: "excessive-inline-styles",
          severity: "low",
          count: elementsWithInlineStyles.length,
          description: "Many inline styles found, consider using CSS classes",
        });
      }

      // Check for missing charset declaration
      const charset = document.querySelector(
        'meta[charset], meta[http-equiv="Content-Type"]'
      );
      if (!charset) {
        issues.push({
          type: "missing-charset",
          severity: "medium",
          description: "Missing charset declaration",
        });
      }

      return {
        issues,
        summary: {
          totalElements: allElements.length,
          maxDomDepth: maxDepth,
          totalScripts: document.querySelectorAll("script").length,
          totalStylesheets: document.querySelectorAll('link[rel="stylesheet"]')
            .length,
          totalImages: document.querySelectorAll("img").length,
          inlineStyles: elementsWithInlineStyles.length,
          hasViewport: !!viewport,
          hasFavicon: !!favicon,
          hasCharset: !!charset,
        },
      };
    });

    this.metrics.bestPractices = {
      score: this.calculateBestPracticesScore(bestPractices),
      ...bestPractices,
    };
  }

  async analyzeSEO() {
    console.log("🔍 Analyzing SEO...");

    const seoData = await this.page.evaluate(() => {
      const issues = [];

      // Check title
      const title = document.title;
      if (!title || title.length === 0) {
        issues.push({
          type: "missing-title",
          severity: "high",
          description: "Page missing title tag",
        });
      } else if (title.length > 60) {
        issues.push({
          type: "title-too-long",
          severity: "medium",
          description: "Title tag too long (over 60 characters)",
        });
      }

      // Check meta description
      const metaDescription = document.querySelector(
        'meta[name="description"]'
      );
      if (!metaDescription) {
        issues.push({
          type: "missing-meta-description",
          severity: "high",
          description: "Page missing meta description",
        });
      } else if (metaDescription.content.length > 160) {
        issues.push({
          type: "meta-description-too-long",
          severity: "medium",
          description: "Meta description too long (over 160 characters)",
        });
      }

      // Check headings
      const h1s = document.querySelectorAll("h1");
      if (h1s.length === 0) {
        issues.push({
          type: "missing-h1",
          severity: "high",
          description: "Page missing H1 heading",
        });
      } else if (h1s.length > 1) {
        issues.push({
          type: "multiple-h1",
          severity: "medium",
          description: "Multiple H1 headings found",
        });
      }

      // Check canonical URL
      const canonical = document.querySelector('link[rel="canonical"]');

      // Check language
      const htmlLang = document.documentElement.lang;
      if (!htmlLang) {
        issues.push({
          type: "missing-lang-attribute",
          severity: "medium",
          description: "HTML missing lang attribute",
        });
      }

      // Check robots meta
      const robotsMeta = document.querySelector('meta[name="robots"]');

      return {
        issues,
        data: {
          title: title,
          titleLength: title ? title.length : 0,
          metaDescription: metaDescription ? metaDescription.content : null,
          metaDescriptionLength: metaDescription
            ? metaDescription.content.length
            : 0,
          h1Count: h1s.length,
          h1Text: h1s.length > 0 ? h1s[0].textContent : null,
          canonical: canonical ? canonical.href : null,
          language: htmlLang,
          robots: robotsMeta ? robotsMeta.content : null,
          headingStructure: {
            h1: document.querySelectorAll("h1").length,
            h2: document.querySelectorAll("h2").length,
            h3: document.querySelectorAll("h3").length,
            h4: document.querySelectorAll("h4").length,
            h5: document.querySelectorAll("h5").length,
            h6: document.querySelectorAll("h6").length,
          },
        },
      };
    });

    this.metrics.seo = {
      score: this.calculateSEOScore(seoData),
      ...seoData,
    };
  }

  async checkPWA() {
    console.log("📱 Checking PWA features...");

    const pwaData = await this.page.evaluate(() => {
      const features = {
        hasServiceWorker: "serviceWorker" in navigator,
        hasManifest: document.querySelector('link[rel="manifest"]') !== null,
        isResponsive: document.querySelector('meta[name="viewport"]') !== null,
        worksOffline: false, // Would need more complex testing
        installable: false, // Would need manifest analysis
      };

      const manifest = document.querySelector('link[rel="manifest"]');

      return {
        features,
        manifestUrl: manifest ? manifest.href : null,
        viewport: document.querySelector('meta[name="viewport"]')?.content,
      };
    });

    // Try to fetch and analyze manifest
    if (pwaData.manifestUrl) {
      try {
        const manifestResponse = await this.page.goto(pwaData.manifestUrl);
        const manifestText = await manifestResponse.text();
        const manifest = JSON.parse(manifestText);

        pwaData.manifest = manifest;
        pwaData.features.installable = !!(
          manifest.name &&
          manifest.start_url &&
          manifest.icons
        );
      } catch (error) {
        console.warn("Could not fetch PWA manifest:", error.message);
      }
    }

    this.metrics.pwa = {
      score: this.calculatePWAScore(pwaData),
      ...pwaData,
    };
  }

  async collectMetadata() {
    console.log("📋 Collecting metadata...");

    const metadata = await this.page.evaluate(() => {
      return {
        url: location.href,
        title: document.title,
        userAgent: navigator.userAgent,
        timestamp: new Date().toISOString(),
        viewport: {
          width: window.innerWidth,
          height: window.innerHeight,
          devicePixelRatio: window.devicePixelRatio,
        },
        technologies: {
          hasJQuery: typeof window.$ !== "undefined",
          hasReact: !!(
            window.React || document.querySelector("[data-reactroot]")
          ),
          hasAngular: !!(window.angular || document.querySelector("[ng-app]")),
          hasVue: !!(window.Vue || document.querySelector("[data-v-]")),
          hasBootstrap: !!document.querySelector('link[href*="bootstrap"]'),
        },
      };
    });

    this.metrics.metadata = metadata;
  }

  calculatePerformanceScore(metrics, lcp, cls, loadTime) {
    let score = 100;

    // Penalize based on load time
    if (loadTime > 3000) score -= 20;
    else if (loadTime > 1500) score -= 10;

    // Penalize based on LCP
    if (lcp > 4000) score -= 25;
    else if (lcp > 2500) score -= 15;

    // Penalize based on CLS
    if (cls > 0.25) score -= 15;
    else if (cls > 0.1) score -= 8;

    // Penalize based on FCP
    if (metrics.firstContentfulPaint > 3000) score -= 15;
    else if (metrics.firstContentfulPaint > 1800) score -= 8;

    return Math.max(0, score);
  }

  calculateAccessibilityScore(data) {
    let score = 100;

    data.issues.forEach((issue) => {
      if (issue.severity === "high") score -= 15;
      else if (issue.severity === "medium") score -= 8;
      else score -= 3;
    });

    return Math.max(0, score);
  }

  calculateBestPracticesScore(data) {
    let score = 100;

    data.issues.forEach((issue) => {
      if (issue.severity === "high") score -= 20;
      else if (issue.severity === "medium") score -= 10;
      else score -= 5;
    });

    return Math.max(0, score);
  }

  calculateSEOScore(data) {
    let score = 100;

    data.issues.forEach((issue) => {
      if (issue.severity === "high") score -= 15;
      else if (issue.severity === "medium") score -= 8;
      else score -= 4;
    });

    return Math.max(0, score);
  }

  calculatePWAScore(data) {
    let score = 0;

    if (data.features.hasServiceWorker) score += 25;
    if (data.features.hasManifest) score += 25;
    if (data.features.isResponsive) score += 25;
    if (data.features.installable) score += 25;

    return score;
  }

  identifyPerformanceOpportunities(metrics, lcp, cls) {
    const opportunities = [];

    if (metrics.firstContentfulPaint > 1800) {
      opportunities.push({
        type: "improve-fcp",
        description: "Improve First Contentful Paint",
        suggestion:
          "Optimize critical rendering path, reduce server response time",
      });
    }

    if (lcp > 2500) {
      opportunities.push({
        type: "improve-lcp",
        description: "Improve Largest Contentful Paint",
        suggestion: "Optimize largest content element, use faster hosting",
      });
    }

    if (cls > 0.1) {
      opportunities.push({
        type: "reduce-cls",
        description: "Reduce Cumulative Layout Shift",
        suggestion:
          "Reserve space for images, avoid injecting content above existing content",
      });
    }

    if (metrics.totalResources > 100) {
      opportunities.push({
        type: "reduce-requests",
        description: "Reduce HTTP requests",
        suggestion:
          "Combine CSS/JS files, use sprite images, enable resource bundling",
      });
    }

    return opportunities;
  }

  generateIssueBreakdown() {
    const breakdown = {
      performance: {
        score: this.metrics.performance.score,
        issues: [],
        recommendations: [],
      },
      accessibility: {
        score: this.metrics.accessibility.score,
        issues: [],
        recommendations: [],
        stats: this.metrics.accessibility.summary,
      },
      bestPractices: {
        score: this.metrics.bestPractices.score,
        issues: [],
        recommendations: [],
      },
      seo: {
        score: this.metrics.seo.score,
        issues: [],
        recommendations: [],
        currentValues: this.metrics.seo.data,
      },
      pwa: {
        score: this.metrics.pwa.score,
        issues: [],
        recommendations: [],
        features: this.metrics.pwa.features,
      },
    };

    // Performance Issues
    if (this.metrics.performance.score < 90) {
      const perf = this.metrics.performance.metrics;

      if (perf.totalLoadTime > 3000) {
        breakdown.performance.issues.push({
          type: "slow-loading",
          severity: "high",
          description: `Slow loading: ${Math.round(
            perf.totalLoadTime
          )}ms (should be < 3000ms)`,
          currentValue: Math.round(perf.totalLoadTime),
          targetValue: 3000,
          unit: "ms",
        });
        breakdown.performance.recommendations.push(
          "Optimize server response time, enable compression"
        );
      }

      if (perf.firstContentfulPaint > 1800) {
        breakdown.performance.issues.push({
          type: "slow-fcp",
          severity: "high",
          description: `Slow First Contentful Paint: ${Math.round(
            perf.firstContentfulPaint
          )}ms (should be < 1800ms)`,
          currentValue: Math.round(perf.firstContentfulPaint),
          targetValue: 1800,
          unit: "ms",
        });
        breakdown.performance.recommendations.push(
          "Optimize critical rendering path, reduce render-blocking resources"
        );
      }

      if (perf.largestContentfulPaint > 2500) {
        breakdown.performance.issues.push({
          type: "slow-lcp",
          severity: "high",
          description: `Slow Largest Contentful Paint: ${Math.round(
            perf.largestContentfulPaint
          )}ms (should be < 2500ms)`,
          currentValue: Math.round(perf.largestContentfulPaint),
          targetValue: 2500,
          unit: "ms",
        });
        breakdown.performance.recommendations.push(
          "Optimize largest content element, use faster hosting"
        );
      }

      if (perf.cumulativeLayoutShift > 0.1) {
        breakdown.performance.issues.push({
          type: "layout-shift",
          severity: "medium",
          description: `Layout shifts detected: ${perf.cumulativeLayoutShift.toFixed(
            3
          )} (should be < 0.1)`,
          currentValue: parseFloat(perf.cumulativeLayoutShift.toFixed(3)),
          targetValue: 0.1,
          unit: "score",
        });
        breakdown.performance.recommendations.push(
          "Reserve space for images, avoid injecting content dynamically"
        );
      }

      if (perf.totalResources > 100) {
        breakdown.performance.issues.push({
          type: "too-many-requests",
          severity: "medium",
          description: `Too many resources: ${perf.totalResources} requests (should be < 100)`,
          currentValue: perf.totalResources,
          targetValue: 100,
          unit: "requests",
        });
        breakdown.performance.recommendations.push(
          "Combine CSS/JS files, use image sprites, enable bundling"
        );
      }

      if (this.metrics.performance.opportunities?.length > 0) {
        breakdown.performance.opportunities =
          this.metrics.performance.opportunities;
      }
    }

    // Accessibility Issues
    if (this.metrics.accessibility.score < 90) {
      this.metrics.accessibility.issues.forEach((issue) => {
        breakdown.accessibility.issues.push({
          type: issue.type,
          severity: issue.severity,
          description: issue.description,
          count: issue.count || null,
        });

        // Add specific recommendations
        switch (issue.type) {
          case "missing-alt-text":
            breakdown.accessibility.recommendations.push(
              "Add meaningful alt attributes to all images"
            );
            break;
          case "missing-form-labels":
            breakdown.accessibility.recommendations.push(
              "Add proper labels or aria-label attributes to form inputs"
            );
            break;
          case "heading-hierarchy":
            breakdown.accessibility.recommendations.push(
              "Use proper heading order (h1 → h2 → h3)"
            );
            break;
        }
      });
    }

    // Best Practices Issues
    if (this.metrics.bestPractices.score < 90) {
      this.metrics.bestPractices.issues.forEach((issue) => {
        breakdown.bestPractices.issues.push({
          type: issue.type,
          severity: issue.severity,
          description: issue.description,
          count: issue.count || null,
          depth: issue.depth || null,
        });

        // Add specific recommendations
        switch (issue.type) {
          case "missing-viewport":
            breakdown.bestPractices.recommendations.push(
              'Add <meta name="viewport" content="width=device-width, initial-scale=1">'
            );
            break;
          case "missing-favicon":
            breakdown.bestPractices.recommendations.push(
              'Add favicon <link rel="icon" href="/favicon.ico">'
            );
            break;
          case "excessive-dom-depth":
            breakdown.bestPractices.recommendations.push(
              "Reduce nesting levels, simplify HTML structure"
            );
            break;
          case "large-dom-size":
            breakdown.bestPractices.recommendations.push(
              "Reduce total elements, use pagination or lazy loading"
            );
            break;
          case "excessive-inline-styles":
            breakdown.bestPractices.recommendations.push(
              "Move inline styles to CSS classes"
            );
            break;
          case "missing-charset":
            breakdown.bestPractices.recommendations.push(
              'Add <meta charset="UTF-8"> to document head'
            );
            break;
        }
      });
    }

    // SEO Issues
    if (this.metrics.seo.score < 90) {
      this.metrics.seo.issues.forEach((issue) => {
        breakdown.seo.issues.push({
          type: issue.type,
          severity: issue.severity,
          description: issue.description,
        });

        // Add specific recommendations
        switch (issue.type) {
          case "missing-title":
            breakdown.seo.recommendations.push("Add a descriptive <title> tag");
            break;
          case "title-too-long":
            breakdown.seo.recommendations.push(
              "Keep title under 60 characters"
            );
            break;
          case "missing-meta-description":
            breakdown.seo.recommendations.push(
              'Add <meta name="description" content="...">'
            );
            break;
          case "meta-description-too-long":
            breakdown.seo.recommendations.push(
              "Keep meta description under 160 characters"
            );
            break;
          case "missing-h1":
            breakdown.seo.recommendations.push(
              "Add exactly one H1 heading per page"
            );
            break;
          case "multiple-h1":
            breakdown.seo.recommendations.push(
              "Use only one H1 heading per page"
            );
            break;
          case "missing-lang-attribute":
            breakdown.seo.recommendations.push(
              "Add lang attribute to <html> tag"
            );
            break;
        }
      });
    }

    // PWA Issues
    if (this.metrics.pwa.score < 80) {
      if (!this.metrics.pwa.features.hasServiceWorker) {
        breakdown.pwa.issues.push({
          type: "no-service-worker",
          severity: "medium",
          description: "No Service Worker found",
        });
        breakdown.pwa.recommendations.push(
          "Implement Service Worker for offline functionality"
        );
      }

      if (!this.metrics.pwa.features.hasManifest) {
        breakdown.pwa.issues.push({
          type: "no-manifest",
          severity: "medium",
          description: "No Web App Manifest found",
        });
        breakdown.pwa.recommendations.push(
          "Add manifest.json for app-like experience"
        );
      }

      if (!this.metrics.pwa.features.isResponsive) {
        breakdown.pwa.issues.push({
          type: "not-responsive",
          severity: "high",
          description: "Not responsive (no viewport meta tag)",
        });
        breakdown.pwa.recommendations.push(
          "Add viewport meta tag for mobile responsiveness"
        );
      }

      if (!this.metrics.pwa.features.installable) {
        breakdown.pwa.issues.push({
          type: "not-installable",
          severity: "medium",
          description: "Not installable as PWA",
        });
        breakdown.pwa.recommendations.push(
          "Ensure manifest has name, start_url, and icons"
        );
      }
    }

    return breakdown;
  }

  generateReport() {
    const overallScore = Math.round(
      (this.metrics.performance.score +
        this.metrics.accessibility.score +
        this.metrics.bestPractices.score +
        this.metrics.seo.score) /
        4
    );

    return {
      url: this.url,
      timestamp: new Date().toISOString(),
      overallScore,
      scores: {
        performance: this.metrics.performance.score,
        accessibility: this.metrics.accessibility.score,
        bestPractices: this.metrics.bestPractices.score,
        seo: this.metrics.seo.score,
        pwa: this.metrics.pwa.score,
      },
      metrics: this.metrics,
      issueBreakdown: this.generateIssueBreakdown(),
    };
  }

  async saveReport(report) {
    const urlObj = new URL(this.url);
    // Use consistent filename without timestamp for workflow integration
    const filename = `healthcheck_${urlObj.hostname.replace(/\./g, "_")}.json`;
    const filepath = path.join(__dirname, filename);

    // Add update timestamp to the report
    report.lastUpdated = new Date().toISOString();

    fs.writeFileSync(filepath, JSON.stringify(report, null, 2));
    console.log(`\n📄 Health check report saved to: ${filepath}`);

    return filepath;
  }
}

// Main execution function
async function runHealthCheck(url) {
  const checker = new WebHealthChecker();

  try {
    await checker.initialize(url);
    const report = await checker.runFullAudit();
    const filepath = await checker.saveReport(report);

    // Print detailed summary with specific issues
    console.log("\n" + "=".repeat(70));
    console.log("🏥 WEBSITE HEALTH CHECK SUMMARY");
    console.log("=".repeat(70));
    console.log(`🌐 URL: ${url}`);
    console.log(`📊 Overall Score: ${report.overallScore}/100`);

    console.log(`\n📈 Individual Scores:`);
    console.log(`   🚀 Performance:    ${report.scores.performance}/100`);
    console.log(`   ♿ Accessibility:  ${report.scores.accessibility}/100`);
    console.log(`   ✅ Best Practices: ${report.scores.bestPractices}/100`);
    console.log(`   🔍 SEO:           ${report.scores.seo}/100`);
    console.log(`   📱 PWA:           ${report.scores.pwa}/100`);

    // Performance Issues
    if (report.scores.performance < 90) {
      console.log(
        `\n🚀 PERFORMANCE ISSUES (Score: ${report.scores.performance}/100):`
      );
      const perf = report.metrics.performance.metrics;

      if (perf.totalLoadTime > 3000) {
        console.log(
          `   ❌ Slow loading: ${Math.round(
            perf.totalLoadTime
          )}ms (should be < 3000ms)`
        );
        console.log(
          `      💡 Recommendation: Optimize server response time, enable compression`
        );
      }

      if (perf.firstContentfulPaint > 1800) {
        console.log(
          `   ❌ Slow First Contentful Paint: ${Math.round(
            perf.firstContentfulPaint
          )}ms (should be < 1800ms)`
        );
        console.log(
          `      💡 Recommendation: Optimize critical rendering path, reduce render-blocking resources`
        );
      }

      if (perf.largestContentfulPaint > 2500) {
        console.log(
          `   ❌ Slow Largest Contentful Paint: ${Math.round(
            perf.largestContentfulPaint
          )}ms (should be < 2500ms)`
        );
        console.log(
          `      💡 Recommendation: Optimize largest content element, use faster hosting`
        );
      }

      if (perf.cumulativeLayoutShift > 0.1) {
        console.log(
          `   ❌ Layout shifts detected: ${perf.cumulativeLayoutShift.toFixed(
            3
          )} (should be < 0.1)`
        );
        console.log(
          `      💡 Recommendation: Reserve space for images, avoid injecting content dynamically`
        );
      }

      if (perf.totalResources > 100) {
        console.log(
          `   ❌ Too many resources: ${perf.totalResources} requests (should be < 100)`
        );
        console.log(
          `      💡 Recommendation: Combine CSS/JS files, use image sprites, enable bundling`
        );
      }

      if (report.metrics.performance.opportunities?.length > 0) {
        console.log(`   📋 Performance opportunities:`);
        report.metrics.performance.opportunities.forEach((opp) => {
          console.log(`      • ${opp.description}: ${opp.suggestion}`);
        });
      }
    }

    // Accessibility Issues
    if (report.scores.accessibility < 90) {
      console.log(
        `\n♿ ACCESSIBILITY ISSUES (Score: ${report.scores.accessibility}/100):`
      );
      const acc = report.metrics.accessibility;

      acc.issues.forEach((issue) => {
        const icon =
          issue.severity === "high"
            ? "❌"
            : issue.severity === "medium"
            ? "⚠️"
            : "⚡";
        console.log(`   ${icon} ${issue.description}`);
        if (issue.count) console.log(`      📊 Count: ${issue.count}`);

        // Specific recommendations
        switch (issue.type) {
          case "missing-alt-text":
            console.log(
              `      💡 Recommendation: Add meaningful alt attributes to all images`
            );
            break;
          case "missing-form-labels":
            console.log(
              `      💡 Recommendation: Add proper labels or aria-label attributes to form inputs`
            );
            break;
          case "heading-hierarchy":
            console.log(
              `      💡 Recommendation: Use proper heading order (h1 → h2 → h3)`
            );
            break;
        }
      });

      console.log(
        `   📊 Stats: ${acc.summary.imagesWithAlt}/${acc.summary.totalImages} images have alt text`
      );
    }

    // Best Practices Issues
    if (report.scores.bestPractices < 90) {
      console.log(
        `\n✅ BEST PRACTICES ISSUES (Score: ${report.scores.bestPractices}/100):`
      );
      const bp = report.metrics.bestPractices;

      bp.issues.forEach((issue) => {
        const icon =
          issue.severity === "high"
            ? "❌"
            : issue.severity === "medium"
            ? "⚠️"
            : "⚡";
        console.log(`   ${icon} ${issue.description}`);
        if (issue.count) console.log(`      📊 Count: ${issue.count}`);
        if (issue.depth) console.log(`      📊 Depth: ${issue.depth} levels`);

        // Specific recommendations
        switch (issue.type) {
          case "missing-viewport":
            console.log(
              `      💡 Recommendation: Add <meta name="viewport" content="width=device-width, initial-scale=1">`
            );
            break;
          case "missing-favicon":
            console.log(
              `      💡 Recommendation: Add favicon <link rel="icon" href="/favicon.ico">`
            );
            break;
          case "excessive-dom-depth":
            console.log(
              `      💡 Recommendation: Reduce nesting levels, simplify HTML structure`
            );
            break;
          case "large-dom-size":
            console.log(
              `      💡 Recommendation: Reduce total elements, use pagination or lazy loading`
            );
            break;
          case "excessive-inline-styles":
            console.log(
              `      💡 Recommendation: Move inline styles to CSS classes`
            );
            break;
          case "missing-charset":
            console.log(
              `      💡 Recommendation: Add <meta charset="UTF-8"> to document head`
            );
            break;
        }
      });
    }

    // SEO Issues
    if (report.scores.seo < 90) {
      console.log(`\n🔍 SEO ISSUES (Score: ${report.scores.seo}/100):`);
      const seo = report.metrics.seo;

      seo.issues.forEach((issue) => {
        const icon =
          issue.severity === "high"
            ? "❌"
            : issue.severity === "medium"
            ? "⚠️"
            : "⚡";
        console.log(`   ${icon} ${issue.description}`);

        // Specific recommendations
        switch (issue.type) {
          case "missing-title":
            console.log(
              `      💡 Recommendation: Add a descriptive <title> tag`
            );
            break;
          case "title-too-long":
            console.log(
              `      💡 Recommendation: Keep title under 60 characters`
            );
            break;
          case "missing-meta-description":
            console.log(
              `      💡 Recommendation: Add <meta name="description" content="...">`
            );
            break;
          case "meta-description-too-long":
            console.log(
              `      💡 Recommendation: Keep meta description under 160 characters`
            );
            break;
          case "missing-h1":
            console.log(
              `      💡 Recommendation: Add exactly one H1 heading per page`
            );
            break;
          case "multiple-h1":
            console.log(
              `      💡 Recommendation: Use only one H1 heading per page`
            );
            break;
          case "missing-lang-attribute":
            console.log(
              `      💡 Recommendation: Add lang attribute to <html> tag`
            );
            break;
        }
      });

      if (seo.data.title) {
        console.log(
          `   📊 Current title: "${seo.data.title}" (${seo.data.titleLength} chars)`
        );
      }
      if (seo.data.metaDescription) {
        console.log(
          `   📊 Current meta description: ${seo.data.metaDescriptionLength} chars`
        );
      }
    }

    // PWA Issues
    if (report.scores.pwa < 80) {
      console.log(`\n📱 PWA IMPROVEMENTS (Score: ${report.scores.pwa}/100):`);
      const pwa = report.metrics.pwa;

      if (!pwa.features.hasServiceWorker) {
        console.log(`   ❌ No Service Worker found`);
        console.log(
          `      💡 Recommendation: Implement Service Worker for offline functionality`
        );
      }

      if (!pwa.features.hasManifest) {
        console.log(`   ❌ No Web App Manifest found`);
        console.log(
          `      💡 Recommendation: Add manifest.json for app-like experience`
        );
      }

      if (!pwa.features.isResponsive) {
        console.log(`   ❌ Not responsive (no viewport meta tag)`);
        console.log(
          `      💡 Recommendation: Add viewport meta tag for mobile responsiveness`
        );
      }

      if (!pwa.features.installable) {
        console.log(`   ❌ Not installable as PWA`);
        console.log(
          `      💡 Recommendation: Ensure manifest has name, start_url, and icons`
        );
      }
    }

    console.log(`\n📄 Detailed JSON report: ${filepath}`);
    console.log("=".repeat(70));

    return report;
  } catch (error) {
    console.error("❌ Health check failed:", error.message);
    process.exit(1);
  }
}

// Run if this file is executed directly
if (process.argv[1].endsWith("healthcheck.js")) {
  const url = process.argv[2];
  if (!url) {
    console.error("Usage: node healthcheck.js <url>");
    console.error("Example: node healthcheck.js https://example.com");
    process.exit(1);
  }

  runHealthCheck(url).catch(console.error);
}

export { WebHealthChecker, runHealthCheck };
