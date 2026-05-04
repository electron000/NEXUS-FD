/**
 * portfolio/index.ts
 */

import { apiCall, API_BASE_URL, APIError } from "../config";
import type { PortfolioUploadResponse } from "@/types";



export async function uploadPortfolioCsv<T = unknown>(
  file: File,
  token: string
): Promise<PortfolioUploadResponse<T>> {

  const formData = new FormData();
  formData.append('file', file);

  const url = `${API_BASE_URL}/api/portfolio/upload`;
  try {
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
      },
      body: formData,
      credentials: 'include',
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new APIError(response.status, errorData.error || 'Upload failed', errorData);
    }

    return await response.json();
  } catch (error) {
    if (error instanceof APIError) throw error;
    throw new APIError(500, 'Network error', error);
  }
}

export async function getPortfolioJob<T = unknown>(jobId: string, token: string): Promise<PortfolioUploadResponse<T>> {
  return apiCall<PortfolioUploadResponse<T>>(`/api/portfolio/status/${jobId}`, { token });
}

export async function analyzeManualPortfolio<T = unknown>(
  entries: { domain: string; purchasePrice?: number }[],
  token: string
): Promise<PortfolioUploadResponse<T>> {

  return apiCall<PortfolioUploadResponse<T>>('/api/portfolio/analyze-manual', {
    method: 'POST',
    body: { entries },
    token,
  });
}

