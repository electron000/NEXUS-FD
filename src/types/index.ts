/**
 * Central Type Definitions for NEXUS Terminal
 */

// --- Authentication & User ---
export type LoadingPhase =
  | "idle"
  | "Scraping Registrars..."
  | "Analyzing Linguistics..."
  | "Querying Google Trends..."
  | "Synthesizing Intelligence..."
  | "complete";

export type UserRole = "investor" | "brand_manager" | "analyst";


export interface UserProfile {
  id: string;
  email: string;
  name: string;
  role: UserRole;
  preferredCurrency: "USD" | "EUR" | "GBP" | string;
  defaultExtensions: string[];
  avatarInitials: string;
  createdAt: string;
}

// --- Domain Valuation ---
export interface NexusValueScore {
  overall: number;
  quantitative: number;
  semantic: number;
  trend: number;
  confidence: number;
  grade: "S" | "A" | "B" | "C" | "D" | "F";
}

export interface RegistrarPricing {
  registrar: string;
  logoSlug: string;
  initial: number;
  renewal: number;
  transfer: number;
  promo: string | null;
  available: boolean;
  affiliateUrl: string;
  isLive?: boolean;
  currency?: string;
}

export interface TCODataPoint {
  year: number;
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

// --- Portfolio & Auditor ---
export interface AuditorResult extends DomainValuationResponse {
  simulatedValuation: number;
  purchasePrice?: number;
  // Flattened for table accessors
  semanticScore: number;
  trendMomentum: number;
  grade: "S" | "A" | "B" | "C" | "D" | "F";

  isLive?: boolean;
  currency?: string;
}


export interface PortfolioUploadResponse<T = unknown> {
  jobId: string;
  status: 'pending' | 'processing' | 'complete' | 'failed';
  resultsCount?: number;
  results?: T[];
  error?: string;
}

export interface NexusScoreResponse {
  domain: string;
  quantitative_baseline: number;
  semantic_score: number;
  trend_momentum: number;
  model_used: string;
}

// --- Watchlist ---
export interface WatchlistEntry {
  domain: string;
  addedAt: string;
  alertPrice?: number;
  notes?: string;
  lastValuation?: DomainValuationResponse;
}
