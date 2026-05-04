/**
 * user/index.ts
 */

import { apiCall } from "../config";

export interface DashboardMetric {
  label: string;
  value: number;
  change: number;
  prefix?: string;
  suffix?: string;
  sparkline: number[];
}

export interface DashboardMetrics {
  portfolioValue: DashboardMetric;
  activeDomains: DashboardMetric;
  monthlyRevenue: DashboardMetric;
  watchlistSize: DashboardMetric;
  marketSentiment: number;
  topMovers: Array<{ domain: string; change: number; value: number }>;
}

export async function getUserProfile(token: string) {
  return apiCall('/api/user/profile', { token });
}

export async function updateUserProfile(updates: Record<string, unknown>, token: string) {
  return apiCall('/api/user/profile', {
    method: 'PUT',
    body: updates,
    token,
  });
}

export async function getDashboardMetrics(token: string): Promise<DashboardMetrics> {
  return apiCall<DashboardMetrics>('/api/user/dashboard', { token });
}

export async function healthCheck(): Promise<{ status: string; db: string }> {
  return apiCall('/api/health');
}
