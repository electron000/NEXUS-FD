import { apiClient } from "../config";

/**
 * NEXUS DOMAIN SERVICES
 * Handles authentic domain availability and registrar arbitrage.
 */

export interface DomainCheckResult {
  domain: string;
  available: boolean;
  registrars: Array<{
    registrar: string;
    price: number;
    available: boolean;
    url: string;
  }>;
}

/**
 * Bulk checks domain availability across multiple registrars.
 */
export async function checkDomains(domainList: string[]): Promise<DomainCheckResult[]> {
  return apiClient.post('/api/domains/check', { domainList });
}

/**
 * Retrieves cached details for a specific domain.
 */
export async function getDomainDetails(domain: string) {
  return apiClient.get(`/api/domains/${encodeURIComponent(domain)}`);
}
