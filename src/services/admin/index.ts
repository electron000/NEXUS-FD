import { apiClient } from "../config";

export interface AdminStats {
  totalUsers: number;
  totalSellers: number;
  totalInquiries: number;
  totalPortfolioDomains: number;
  activeConnections: number;
}

export interface PendingKYC {
  id: string;
  email: string;
  name: string;
  first_name: string;
  middle_name: string;
  last_name: string;
  father_name: string;
  mother_name: string;
  address: string;
  aadhaar_front_path: string;
  aadhaar_back_path: string;
  created_at: string;
}

export async function getAdminStats(): Promise<AdminStats> {
  return apiClient.get('/api/admin/stats');
}

export async function getPendingKYCs(): Promise<PendingKYC[]> {
  return apiClient.get('/api/admin/kyc/pending');
}

export async function reviewKYC(userId: string, status: 'verified' | 'rejected', reason?: string) {
  return apiClient.post('/api/admin/kyc/review', { userId, status, reason });
}
