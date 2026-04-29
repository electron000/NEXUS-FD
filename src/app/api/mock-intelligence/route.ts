import { NextRequest, NextResponse } from "next/server";
import type { DomainValuationResponse, NexusValueScore, RegistrarPricing, TCODataPoint } from "@/services/mock";

// ---------------------------------------------------------------------------
// ANTHROPIC API CALL
// ---------------------------------------------------------------------------

async function callAnthropicAPI(domain: string): Promise<string> {
  const apiKey = process.env.LLM_API_KEY;
  if (!apiKey) throw new Error("LLM_API_KEY environment variable is not configured.");

  const systemPrompt = `You are the Nexus Intelligence Core — an institutional-grade domain asset valuation engine. Your task is to analyze a given domain name and output a precise JSON valuation report.

You must respond with ONLY a valid JSON object matching this exact TypeScript interface structure — no markdown fences, no preamble, no explanation:

{
  "domain": string,
  "tld": string,
  "sld": string,
  "score": {
    "overall": number (0-100),
    "quantitative": number (0-100),
    "semantic": number (0-100),
    "trend": number (0-100),
    "confidence": number (0.0-1.0),
    "grade": "S"|"A"|"B"|"C"|"D"|"F"
  },
  "pricing": [
    {
      "registrar": string,
      "logoSlug": string,
      "initial": number,
      "renewal": number,
      "transfer": number,
      "promo": string|null,
      "available": boolean,
      "affiliateUrl": string
    }
  ],
  "tco": [
    { "year": 1, "bestCase": number, "expected": number, "worstCase": number },
    { "year": 2, "bestCase": number, "expected": number, "worstCase": number },
    { "year": 3, "bestCase": number, "expected": number, "worstCase": number },
    { "year": 4, "bestCase": number, "expected": number, "worstCase": number },
    { "year": 5, "bestCase": number, "expected": number, "worstCase": number }
  ],
  "summary": string,
  "tags": string[],
  "timestamp": string
}

SCORING RUBRIC:
- quantitative: Evaluate current aftermarket pricing signals, TLD scarcity, character count (shorter = higher), and numeric/hyphen penalties.
- semantic: Evaluate linguistic alpha — dictionary word premium, brandability, phonetic memorability, international phoneme clarity, industry vertical relevance signals.
- trend: Evaluate Google Trends trajectory for the SLD, industry vertical growth, social media handle availability signals, and emerging technology relevance.
- overall: Weighted composite (quantitative 35%, semantic 40%, trend 25%).
- grade: S (90-100), A (80-89), B (70-79), C (60-69), D (50-59), F (below 50).

PRICING RULES:
- Include exactly 5 registrars: Namecheap, GoDaddy, Porkbun, Cloudflare, Dynadot.
- Renewal prices must vary realistically between registrars (10-40% spread).
- .com domains: renewal range $9-$22. .io: $35-$55. .ai: $70-$120. Other TLDs: $10-$40.
- GoDaddy should always be 25-35% higher than the cheapest option.
- Cloudflare should be at-cost (typically the cheapest for .com).
- TCO must accumulate realistically year over year.

OUTPUT ONLY THE JSON OBJECT. NO OTHER TEXT.`;

  const userPrompt = `Analyze this domain and produce the full Nexus Valuation JSON: ${domain}`;

  const response = await fetch("https://api.anthropic.com/v1/messages", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "x-api-key": apiKey,
      "anthropic-version": "2023-06-01",
    },
    body: JSON.stringify({
      model: "claude-sonnet-4-5",
      max_tokens: 2048,
      system: systemPrompt,
      messages: [{ role: "user", content: userPrompt }],
    }),
  });

  if (!response.ok) {
    const errBody = await response.text();
    throw new Error(`Anthropic API returned ${response.status}: ${errBody}`);
  }

  const data = await response.json();
  const textContent = data.content?.find((c: { type: string }) => c.type === "text");
  if (!textContent?.text) throw new Error("No text content in Anthropic response.");

  return textContent.text;
}

// ---------------------------------------------------------------------------
// FALLBACK GENERATOR
// ---------------------------------------------------------------------------

function buildFallback(domain: string): DomainValuationResponse {
  const parts = domain.split(".");
  const tld = parts.length > 1 ? parts[parts.length - 1] : "com";
  const sld = parts[0] ?? domain;

  const seed = sld.split("").reduce((acc, c) => acc + c.charCodeAt(0), 0);
  const r = (lo: number, hi: number, off = 0) =>
    Math.round(((seed + off) % (hi - lo)) + lo);

  const q = r(45, 85, 1), s = r(40, 90, 2), t = r(35, 82, 3);
  const overall = Math.round(q * 0.35 + s * 0.40 + t * 0.25);
  const grade: NexusValueScore["grade"] = overall >= 90 ? "S" : overall >= 80 ? "A" : overall >= 70 ? "B" : overall >= 60 ? "C" : overall >= 50 ? "D" : "F";

  const base = tld === "com" ? 12.98 : tld === "io" ? 39.99 : tld === "ai" ? 79.98 : 15.99;

  const pricing: RegistrarPricing[] = [
    { registrar: "Namecheap",  logoSlug: "namecheap",  initial: +(base * 0.88).toFixed(2), renewal: +base.toFixed(2),             transfer: +(base * 0.82).toFixed(2), promo: "NEXUS10",   available: r(0,3,4) > 1, affiliateUrl: "https://namecheap.com" },
    { registrar: "GoDaddy",    logoSlug: "godaddy",    initial: +(base * 1.15).toFixed(2), renewal: +(base * 1.32).toFixed(2),    transfer: +(base * 1.10).toFixed(2), promo: null,        available: r(0,3,5) > 1, affiliateUrl: "https://godaddy.com" },
    { registrar: "Porkbun",    logoSlug: "porkbun",    initial: +(base * 0.82).toFixed(2), renewal: +(base * 0.91).toFixed(2),    transfer: +(base * 0.79).toFixed(2), promo: "PORK20",    available: r(0,3,6) > 1, affiliateUrl: "https://porkbun.com" },
    { registrar: "Cloudflare", logoSlug: "cloudflare", initial: +base.toFixed(2),          renewal: +base.toFixed(2),             transfer: +base.toFixed(2),          promo: null,        available: r(0,3,7) > 1, affiliateUrl: "https://cloudflare.com" },
    { registrar: "Dynadot",    logoSlug: "dynadot",    initial: +(base * 0.94).toFixed(2), renewal: +(base * 0.97).toFixed(2),    transfer: +(base * 0.88).toFixed(2), promo: null,        available: r(0,3,8) > 1, affiliateUrl: "https://dynadot.com" },
  ];

  const tco: TCODataPoint[] = [1, 2, 3, 4, 5].map((year) => ({
    year,
    bestCase: +(base * 0.82 * year).toFixed(2),
    expected: +(base * year).toFixed(2),
    worstCase: +(base * 1.32 * year).toFixed(2),
  }));

  return {
    domain, tld, sld,
    score: { overall, quantitative: q, semantic: s, trend: t, confidence: 0.74, grade },
    pricing, tco,
    summary: `${domain} received a composite Nexus Value Score of ${overall}/100 (Grade ${grade}). ${s >= 70 ? "High linguistic alpha detected — strong brand recall potential." : "Moderate semantic profile."} ${t >= 65 ? "Positive trend velocity in the ${tld} namespace." : "Stable trend metrics."} Consider renewal cost optimisation via Porkbun or Cloudflare.`,
    tags: [`tld-${tld}`, overall >= 75 ? "investment-grade" : "speculative", s >= 75 ? "brandable" : "descriptive"],
    timestamp: new Date().toISOString(),
  };
}

// ---------------------------------------------------------------------------
// ROUTE HANDLER
// ---------------------------------------------------------------------------

export const runtime = "edge";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const domain = typeof body.domain === "string" ? body.domain.trim() : null;

    if (!domain) {
      return NextResponse.json(
        { error: "Missing required field: domain" },
        { status: 400 }
      );
    }

    const rawText = await callAnthropicAPI(domain);

    // Strip any accidental markdown fences
    const cleaned = rawText
      .replace(/^```json\s*/i, "")
      .replace(/^```\s*/i, "")
      .replace(/```\s*$/i, "")
      .trim();

    const valuation: DomainValuationResponse = JSON.parse(cleaned);

    return NextResponse.json(valuation, {
      status: 200,
      headers: { "Cache-Control": "no-store" },
    });

  } catch (err) {
    console.error("[mock-intelligence] Error:", err);
    // Graceful fallback — return structurally valid data so the UI never crashes
    try {
      const body = await req.json().catch(() => ({}));
      const domain = typeof body.domain === "string" ? body.domain : "unknown.com";
      const fallback = buildFallback(domain);
      return NextResponse.json(fallback, { status: 200 });
    } catch {
      return NextResponse.json(buildFallback("unknown.com"), { status: 200 });
    }
  }
}
