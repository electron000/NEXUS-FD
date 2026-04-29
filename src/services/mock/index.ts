// =============================================================================
// NEXUS DIGITAL ASSET TERMINAL — Mock Service Layer
// All interfaces mirror the backend Pydantic models for zero-refactor migration.
// =============================================================================

// ---------------------------------------------------------------------------
// TYPE DEFINITIONS
// ---------------------------------------------------------------------------

export interface NexusValueScore {
  overall: number;               // 0–100 composite score
  quantitative: number;          // Registrar pricing arbitrage index
  semantic: number;              // Linguistic / brandability score
  trend: number;                 // Google Trends & social momentum
  confidence: number;            // Model confidence 0–1
  grade: "S" | "A" | "B" | "C" | "D" | "F";
}

export interface RegistrarPricing {
  registrar: string;
  logoSlug: string;
  initial: number;               // First-year registration price (USD)
  renewal: number;               // Annual renewal price (USD)
  transfer: number;              // Transfer-in price (USD)
  promo: string | null;          // Active promo code or null
  available: boolean;
  affiliateUrl: string;
}

export interface TCODataPoint {
  year: number;                  // Year 1–5
  bestCase: number;
  expected: number;
  worstCase: number;
}

export interface DomainValuationResponse {
  domain: string;
  tld: string;
  sld: string;
  score: NexusValueScore;
  pricing: RegistrarPricing[];
  tco: TCODataPoint[];
  summary: string;
  tags: string[];
  timestamp: string;
}

export interface DashboardMetric {
  label: string;
  value: number;
  change: number;                // % change from previous period
  prefix?: string;
  suffix?: string;
  sparkline: number[];
}

export interface DashboardMetrics {
  portfolioValue: DashboardMetric;
  activeDomains: DashboardMetric;
  monthlyRevenue: DashboardMetric;
  watchlistSize: DashboardMetric;
  marketSentiment: number;       // 0–100 bull/bear index
  topMovers: { domain: string; change: number; value: number }[];
}

// ---------------------------------------------------------------------------
// HARDCODED PREMIUM DOMAIN RESPONSES
// ---------------------------------------------------------------------------

const QUANTUM_AI_RESPONSE: DomainValuationResponse = {
  domain: "quantum.ai",
  tld: "ai",
  sld: "quantum",
  score: {
    overall: 94,
    quantitative: 91,
    semantic: 97,
    trend: 93,
    confidence: 0.97,
    grade: "S",
  },
  pricing: [
    { registrar: "Namecheap",  logoSlug: "namecheap",  initial: 79.98,  renewal: 89.98,  transfer: 74.98,  promo: "NEXUS10",  available: false, affiliateUrl: "https://namecheap.com" },
    { registrar: "GoDaddy",    logoSlug: "godaddy",    initial: 99.99,  renewal: 119.99, transfer: 89.99,  promo: null,       available: false, affiliateUrl: "https://godaddy.com" },
    { registrar: "Porkbun",    logoSlug: "porkbun",    initial: 69.99,  renewal: 79.99,  transfer: 64.99,  promo: "PORK20",   available: false, affiliateUrl: "https://porkbun.com" },
    { registrar: "Dynadot",    logoSlug: "dynadot",    initial: 74.99,  renewal: 84.99,  transfer: 69.99,  promo: null,       available: false, affiliateUrl: "https://dynadot.com" },
    { registrar: "Afternic",   logoSlug: "afternic",   initial: 0,      renewal: 0,      transfer: 0,      promo: null,       available: false, affiliateUrl: "https://afternic.com" },
  ],
  tco: [
    { year: 1, bestCase: 69.99,   expected: 79.98,  worstCase: 99.99 },
    { year: 2, bestCase: 149.98,  expected: 169.96, worstCase: 219.97 },
    { year: 3, bestCase: 229.97,  expected: 259.94, worstCase: 339.95 },
    { year: 4, bestCase: 309.96,  expected: 349.92, worstCase: 459.93 },
    { year: 5, bestCase: 389.95,  expected: 439.90, worstCase: 579.91 },
  ],
  summary: "quantum.ai ranks in the 99th percentile of .ai domains assessed by the Nexus Intelligence Core. The compound of a physics-adjacent superlative with the dominant AI TLD creates extreme brand memorability and institutional-grade monetisation potential. Current aftermarket floor exceeds $2.4M USD.",
  tags: ["premium-tld", "tech-forward", "high-liquidity", "brandable", "dictionary-word"],
  timestamp: new Date().toISOString(),
};

const APPLE_COM_RESPONSE: DomainValuationResponse = {
  domain: "apple.com",
  tld: "com",
  sld: "apple",
  score: {
    overall: 99,
    quantitative: 99,
    semantic: 99,
    trend: 99,
    confidence: 1.0,
    grade: "S",
  },
  pricing: [
    { registrar: "CSC Global",    logoSlug: "csc",        initial: 0,      renewal: 14.99,  transfer: 0,  promo: null,  available: false, affiliateUrl: "https://cscglobal.com" },
    { registrar: "Namecheap",     logoSlug: "namecheap",  initial: 0,      renewal: 12.98,  transfer: 0,  promo: null,  available: false, affiliateUrl: "https://namecheap.com" },
    { registrar: "GoDaddy",       logoSlug: "godaddy",    initial: 0,      renewal: 21.17,  transfer: 0,  promo: null,  available: false, affiliateUrl: "https://godaddy.com" },
    { registrar: "Cloudflare",    logoSlug: "cloudflare", initial: 0,      renewal: 9.77,   transfer: 0,  promo: null,  available: false, affiliateUrl: "https://cloudflare.com" },
  ],
  tco: [
    { year: 1, bestCase: 9.77,    expected: 12.98,  worstCase: 21.17 },
    { year: 2, bestCase: 19.54,   expected: 25.96,  worstCase: 42.34 },
    { year: 3, bestCase: 29.31,   expected: 38.94,  worstCase: 63.51 },
    { year: 4, bestCase: 39.08,   expected: 51.92,  worstCase: 84.68 },
    { year: 5, bestCase: 48.85,   expected: 64.90,  worstCase: 105.85 },
  ],
  summary: "apple.com is the apex asset in the global domain market. Registered in 1987, the asset commands the maximum Nexus Value Score across all analytical dimensions. As a registered trademark of Apple Inc., this domain is not transferable. Estimated brand equity contribution: $482B USD (per Interbrand 2024 analysis).",
  tags: ["s-tier", "trademark-protected", "fortune-500", "max-liquidity", "dictionary-word", "legacy"],
  timestamp: new Date().toISOString(),
};

// ---------------------------------------------------------------------------
// FALLBACK GENERATOR (used when LLM API fails)
// ---------------------------------------------------------------------------

function generateFallbackResponse(domain: string): DomainValuationResponse {
  const parts = domain.replace(/^https?:\/\//, "").replace(/\/$/, "").split(".");
  const tld = parts.length > 1 ? parts[parts.length - 1] : "com";
  const sld = parts[0] ?? domain;

  const seed = sld.split("").reduce((acc, c) => acc + c.charCodeAt(0), 0);
  const rand = (min: number, max: number, offset = 0) =>
    Math.round(((seed + offset) % (max - min)) + min);

  const quantitative = rand(42, 88, 1);
  const semantic     = rand(38, 92, 2);
  const trend        = rand(30, 85, 3);
  const overall      = Math.round((quantitative * 0.35 + semantic * 0.40 + trend * 0.25));

  const grade = overall >= 90 ? "S" : overall >= 80 ? "A" : overall >= 70 ? "B" : overall >= 60 ? "C" : overall >= 50 ? "D" : "F";

  const baseRenewal = tld === "com" ? 12.98 : tld === "io" ? 39.99 : tld === "ai" ? 79.98 : 15.99;

  return {
    domain,
    tld,
    sld,
    score: { overall, quantitative, semantic, trend, confidence: 0.78, grade: grade as NexusValueScore["grade"] },
    pricing: [
      { registrar: "Namecheap",  logoSlug: "namecheap",  initial: +(baseRenewal * 0.9).toFixed(2),  renewal: +baseRenewal.toFixed(2),             transfer: +(baseRenewal * 0.85).toFixed(2), promo: rand(0, 2, 4) > 0 ? "NEXUS10" : null, available: rand(0, 2, 5) === 1, affiliateUrl: "https://namecheap.com" },
      { registrar: "GoDaddy",    logoSlug: "godaddy",    initial: +(baseRenewal * 1.1).toFixed(2),  renewal: +(baseRenewal * 1.3).toFixed(2),      transfer: +(baseRenewal * 1.05).toFixed(2), promo: null, available: rand(0, 2, 6) === 1, affiliateUrl: "https://godaddy.com" },
      { registrar: "Porkbun",    logoSlug: "porkbun",    initial: +(baseRenewal * 0.85).toFixed(2), renewal: +(baseRenewal * 0.92).toFixed(2),     transfer: +(baseRenewal * 0.80).toFixed(2), promo: "PORK20", available: rand(0, 2, 7) === 1, affiliateUrl: "https://porkbun.com" },
      { registrar: "Cloudflare", logoSlug: "cloudflare", initial: +baseRenewal.toFixed(2),          renewal: +baseRenewal.toFixed(2),              transfer: +baseRenewal.toFixed(2),          promo: null, available: rand(0, 2, 8) === 1, affiliateUrl: "https://cloudflare.com" },
      { registrar: "Dynadot",    logoSlug: "dynadot",    initial: +(baseRenewal * 0.95).toFixed(2), renewal: +(baseRenewal * 0.98).toFixed(2),     transfer: +(baseRenewal * 0.90).toFixed(2), promo: null, available: rand(0, 2, 9) === 1, affiliateUrl: "https://dynadot.com" },
    ],
    tco: [1, 2, 3, 4, 5].map((year) => ({
      year,
      bestCase:  +(baseRenewal * 0.85 * year).toFixed(2),
      expected:  +(baseRenewal * year).toFixed(2),
      worstCase: +(baseRenewal * 1.3 * year).toFixed(2),
    })),
    summary: `${domain} has been evaluated by the Nexus Intelligence Core. The domain demonstrates ${grade === "S" || grade === "A" ? "strong" : "moderate"} brand potential with a composite Nexus Value Score of ${overall}/100. ${semantic > 70 ? "Strong linguistic alpha detected — high memorability index." : "Standard memorability profile."} ${trend > 65 ? "Above-average trend velocity signals emerging category demand." : "Stable, mature search trend profile."}`,
    tags: [
      `tld-${tld}`,
      overall >= 75 ? "investment-grade" : "speculative",
      semantic >= 75 ? "brandable" : "descriptive",
      sld.length <= 5 ? "ultra-short" : sld.length <= 8 ? "short" : "standard-length",
    ],
    timestamp: new Date().toISOString(),
  };
}

// ---------------------------------------------------------------------------
// SERVICE FUNCTIONS
// ---------------------------------------------------------------------------

/**
 * Primary domain valuation function.
 * Returns hardcoded data for demo domains; routes all others through the LLM proxy.
 * Enforces 1500ms minimum latency per NFR-03.
 */
export async function getDomainValuation(domain: string): Promise<DomainValuationResponse> {
  const normalised = domain
    .toLowerCase()
    .replace(/^https?:\/\//, "")
    .replace(/\/$/, "")
    .trim();

  const delay = new Promise<void>((res) => setTimeout(res, 1500));

  // Hardcoded premium domain cache
  if (normalised === "quantum.ai") {
    await delay;
    return { ...QUANTUM_AI_RESPONSE, timestamp: new Date().toISOString() };
  }
  if (normalised === "apple.com") {
    await delay;
    return { ...APPLE_COM_RESPONSE, timestamp: new Date().toISOString() };
  }

  // Route to LLM proxy for unknown domains
  try {
    const [response] = await Promise.all([
      fetch("/api/mock-intelligence", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ domain: normalised }),
      }),
      delay,
    ]);

    if (!response.ok) throw new Error(`API error: ${response.status}`);

    const data: DomainValuationResponse = await response.json();
    return data;
  } catch {
    // Graceful fallback — never surface API errors during demonstrations
    await delay;
    return generateFallbackResponse(normalised);
  }
}

// ---------------------------------------------------------------------------
// AUDITOR ROW DATA
// ---------------------------------------------------------------------------

export interface AuditorRowData {
  id: string;
  domain: string;
  uploadDate: string;
  purchasePrice?: number;
  simulatedValuation: number;
  semanticScore: number;
  trendMomentum: number;
  grade: NexusValueScore["grade"];
  tld: string;
}

/**
 * Processes raw domain strings from a CSV upload, attaching mock valuation data.
 * Implements NFR-04 chunking: only processes the first 50 rows.
 */
export function processAuditorRows(domains: string[]): AuditorRowData[] {
  const limited = domains.slice(0, 50);
  return limited.map((rawDomain, index) => {
    const domain = rawDomain.toLowerCase().replace(/^https?:\/\//, "").replace(/\/$/, "").trim();
    const parts = domain.split(".");
    const tld = parts.length > 1 ? parts[parts.length - 1] : "com";
    const sld = parts[0] ?? domain;

    // Deterministic-ish seed per domain + index for consistent but varied results
    const seed = sld.split("").reduce((acc, c) => acc + c.charCodeAt(0), 0) + index;
    const r = (lo: number, hi: number, off = 0) =>
      Math.round(((seed + off) % (hi - lo + 1)) + lo);

    const semantic = r(38, 96, 1);
    const trend = r(30, 92, 2);
    const quantitative = r(40, 88, 3);
    const overall = Math.round(quantitative * 0.35 + semantic * 0.40 + trend * 0.25);
    const grade: NexusValueScore["grade"] =
      overall >= 90 ? "S" : overall >= 80 ? "A" : overall >= 70 ? "B" : overall >= 60 ? "C" : overall >= 50 ? "D" : "F";

    const baseVal =
      tld === "com" ? r(800, 25000, 4) :
      tld === "io" ? r(1200, 18000, 5) :
      tld === "ai" ? r(2000, 45000, 6) :
      r(200, 8000, 7);

    return {
      id: `aud-${index}-${seed}`,
      domain,
      uploadDate: new Date().toISOString(),
      purchasePrice: r(0, 1, 8) === 1 ? r(50, 5000, 9) : undefined,
      simulatedValuation: baseVal,
      semanticScore: semantic,
      trendMomentum: +(0.8 + (trend / 100) * 1.7).toFixed(2),
      grade,
      tld,
    };
  });
}

/**
 * Returns randomised portfolio metrics for the dashboard overview.
 * Simulates live data feed from the Node.js Nerve Center.
 */
export function getDashboardMetrics(): DashboardMetrics {
  const rand = (min: number, max: number) => Math.random() * (max - min) + min;
  const pct  = (min: number, max: number) => +(rand(min, max)).toFixed(2);

  const spark = (base: number, len = 12) =>
    Array.from({ length: len }, (_, i) =>
      +(base + Math.sin(i * 0.8) * base * 0.05 + rand(-base * 0.03, base * 0.03)).toFixed(2)
    );

  return {
    portfolioValue: {
      label: "Portfolio Value",
      value: +rand(480000, 520000).toFixed(2),
      change: pct(-3.2, 4.8),
      prefix: "$",
      sparkline: spark(500000),
    },
    activeDomains: {
      label: "Active Domains",
      value: Math.round(rand(142, 158)),
      change: pct(0.5, 2.1),
      sparkline: spark(150),
    },
    monthlyRevenue: {
      label: "Monthly Revenue",
      value: +rand(14200, 16800).toFixed(2),
      change: pct(-1.5, 5.5),
      prefix: "$",
      sparkline: spark(15000),
    },
    watchlistSize: {
      label: "Watchlist",
      value: Math.round(rand(28, 34)),
      change: pct(-0.5, 1.2),
      sparkline: spark(30),
    },
    marketSentiment: +rand(55, 78).toFixed(1),
    topMovers: [
      { domain: "nexus.io",      change: +rand(8, 22).toFixed(2),   value: +rand(12000, 18000).toFixed(0) },
      { domain: "protocol.ai",   change: +rand(4, 15).toFixed(2),   value: +rand(8000, 14000).toFixed(0) },
      { domain: "vertex.com",    change: +rand(-8, -2).toFixed(2),  value: +rand(45000, 65000).toFixed(0) },
      { domain: "cipher.io",     change: +rand(2, 12).toFixed(2),   value: +rand(5000, 9000).toFixed(0) },
      { domain: "atlas.xyz",     change: +rand(-5, 8).toFixed(2),   value: +rand(3500, 7000).toFixed(0) },
      { domain: "matrix.ai",     change: +rand(12, 28).toFixed(2),  value: +rand(18000, 28000).toFixed(0) },
    ],
  };
}
