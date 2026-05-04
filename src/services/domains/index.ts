/**
 * domains/index.ts
 */

import { apiCall } from "../config";
import type { NexusScoreResponse, LoadingPhase } from "@/types";


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

export async function getNexusScore(domain: string, token?: string): Promise<NexusScoreResponse> {
  return apiCall<NexusScoreResponse>('/api/ml/nexus-score', {
    method: 'POST',
    body: { domain },
    token,
  });
}

export async function checkDomains(
  domainList: string[],
  token: string
): Promise<DomainCheckResult[]> {
  return apiCall<DomainCheckResult[]>('/api/domains/check', {
    method: 'POST',
    body: { domainList },
    token,
  });
}

export async function getDomainDetails(domain: string, token: string) {
  return apiCall(`/api/domains/${encodeURIComponent(domain)}`, { token });
}
