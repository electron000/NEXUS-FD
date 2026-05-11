import { apiClient } from "../config";
import { DashboardMetrics } from "@/types";

/**
 * Fetches the current user profile.
 * Credentials handled automatically via HttpOnly cookies.
 */
export async function getUserProfile() {
  return apiClient.get('/api/user/profile');
}

/**
 * Updates the current user profile.
 */
export async function updateUserProfile(updates: Record<string, unknown>) {
  return apiClient.put('/api/user/profile', updates);
}

/**
 * Retrieves real-time dashboard metrics.
 * Now strictly authentic user data.
 */
export async function getDashboardMetrics(): Promise<DashboardMetrics> {
  return apiClient.get('/api/user/dashboard');
}

/**
 * Submits KYC documentation.
 */
export async function submitKYC(formData: FormData) {
  return apiClient.post('/api/user/kyc/submit', formData, {
    headers: { 'Content-Type': 'multipart/form-data' }
  });
}

/**
 * Deletes a portfolio item by ID.
 */
export async function deletePortfolioItem(id: string) {
  return apiClient.delete(`/api/user/portfolio/${id}`);
}

/**
 * System health check.
 */
export async function healthCheck(): Promise<{ status: string; db: string }> {
  return apiClient.get('/api/health');
}
