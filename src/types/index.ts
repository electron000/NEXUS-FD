/**
 * NEXUS Terminal - Central Type Manifest
 * Strictly authentic data structures.
 */

// --- Session & Identity ---
export type LoadingPhase =
  | "idle"
  | "Scanning Ecosystem..."
  | "Core Processing..."
  | "Ownership Audit..."
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
   kyc_rejection_reason?: string;
  defaultExtensions: string[];
  avatarInitials: string;
  createdAt: string;
}

// --- Intelligence & Valuation ---
export interface NexusValueScore {
  overall: number;
  model: number;
  semantic: number;
}

export interface RegistrarPricing {
  registrar: string;
  logoSlug: string;
  registration: number;
  renewal: number;
  transfer: number;
  privacy: number;
  available: boolean;
  premium?: boolean;
  affiliateUrl: string;
  isLive?: boolean;
  currency?: string;
}

export interface OwnershipInfo {
  isNexusMember: boolean;
  isVerified: boolean;
  ownerName?: string;
  ownerEmail?: string;
  ownerPhone?: string;
  organization?: string;
  country?: string;
  registrarName?: string;
  registrarEmail?: string;
  registrarPhone?: string;
  registrarUrl?: string;
  registrarAbuseEmail?: string;
  registrarAbusePhone?: string;
  creationDate?: string;
  expiryDate?: string;
  status?: string[];
  nameservers?: string[];
  dnssec?: string;
  address?: string;
  dnsIntelligence?: {
    hasMail: boolean;
    mailProvider: string;
    mxRecords: string[];
  };
  isForSale?: boolean;
  askingPrice?: number;
  lastUpdated: string;
  registered?: boolean;
}

export interface AppraisalInfo {
  value: number;
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

export interface PortfolioDomain {
  domain: string;
  boughtPrice: number;
  valuation: number;
  growth: number;
}

export interface DashboardMetrics {
  kyc_status: 'unverified' | 'pending' | 'verified' | 'rejected';
  kyc_rejection_reason?: string;
  portfolioValue: DashboardMetric;
  activeDomains: DashboardMetric;
  totalInvested: DashboardMetric;
  portfolio: PortfolioDomain[];
}

