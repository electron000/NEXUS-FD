/**
 * NEXUS Terminal - Central Type Manifest
 * Strictly authentic data structures.
 */

// --- Session & Identity ---
export type LoadingPhase =
  | "idle"
  | "Scraping Registrars..."
  | "Analyzing Linguistics..."
  | "Ownership Analysis..."
  | "Synthesizing Intelligence..."
  | "complete";

export type UserRole = "investor" | "brand_manager" | "analyst";

export interface UserProfile {
  id: string;
  email: string;
  name: string;
  role: UserRole;
  is_admin: boolean;
  kyc_status?: 'unverified' | 'pending' | 'verified' | 'rejected';
  defaultExtensions: string[];
  avatarInitials: string;
  createdAt: string;
}

// --- Intelligence & Valuation ---
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
  registration: number;
  renewal: number;
  transfer: number;
  privacy: number;
  available: boolean;
  affiliateUrl: string;
  isLive?: boolean;
  currency?: string;
}

export interface OwnershipInfo {
  isNexusMember: boolean;
  isVerified: boolean;
  ownerName?: string;
  organization?: string;
  country?: string;
  isForSale?: boolean;
  askingPrice?: number;
  lastUpdated: string;
}

export interface AppraisalInfo {
  value: number;
  confidence: number;
  tier: 'Premium' | 'Investment' | 'Standard' | 'high' | 'medium' | 'low';
  predictedPrice?: number;
  predictedTier?: string;
}

export interface DomainValuationResponse {
  domain: string;
  tld: string;
  sld: string;
  score: NexusValueScore;
  pricing: RegistrarPricing[];
  ownership?: OwnershipInfo;
  appraisal?: AppraisalInfo;
  summary: string;
  tags: string[];
  timestamp: string;
}

// --- Watchlist ---
export interface WatchlistEntry {
  domain: string;
  addedAt: string;
  alertPrice?: number;
  notes?: string;
  lastValuation?: DomainValuationResponse;
}

// --- Dashboard & Metrics ---
export interface DashboardMetric {
  label: string;
  value: number | string;
  change: number;
  prefix?: string;
  suffix?: string;
}

export interface DashboardMetrics {
  portfolioValue: DashboardMetric;
  activeDomains: DashboardMetric;
  monthlyRevenue: DashboardMetric;
  watchlistSize: DashboardMetric;
}

// --- Direct Score Proxy (Legacy/Direct) ---
export interface NexusScoreResponse {
  domain: string;
  quantitative_baseline: number;
  semantic_score: number;
  trend_momentum: number;
  predicted_price?: number;
  predicted_tier?: string;
  model_used: string;
}
