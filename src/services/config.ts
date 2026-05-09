/* eslint-disable @typescript-eslint/no-explicit-any */
import axios, { AxiosError, InternalAxiosRequestConfig } from 'axios';

export const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000';
export const INTELLIGENCE_API_URL = process.env.NEXT_PUBLIC_INTELLIGENCE_API_URL || 'http://localhost:8000';

export class APIError extends Error {
  constructor(
    public status: number,
    public message: string,
    public details?: unknown
  ) {
    super(message);
    this.name = 'APIError';
  }
}

// Create axios instance
export const apiClient = axios.create({
  baseURL: API_BASE_URL,
  withCredentials: true,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor for token (DEPRECATED - Using Cookies)
apiClient.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor for errors
apiClient.interceptors.response.use(
  (response) => response.data,
  (error: AxiosError) => {
    const status = error.response?.status || 500;
    const data = error.response?.data as any;
    const message = data?.error || data?.message || error.message || 'API request failed';
    
    // EDGE CASE: Handle Session Expiration (401)
    if (status === 401 && typeof window !== 'undefined') {
      // Clear localStorage and reload to trigger guards
      localStorage.removeItem('nexus_user');
      localStorage.removeItem('nexus-terminal-store'); // Clear Zustand persisted state
      
      // We don't use router here to avoid hooks outside components
      // A full reload ensures all states are reset cleanly
      window.location.href = '/login?expired=true';
    }

    throw new APIError(status, message, data);
  }
);

export interface RequestOptions {
  method?: 'GET' | 'POST' | 'PUT' | 'DELETE' | 'PATCH';
  headers?: Record<string, string>;
  body?: unknown;
  token?: string;
  baseUrl?: string;
}

/**
 * Compatibility wrapper for existing apiCall usage
 */
export async function apiCall<T>(
  endpoint: string,
  options: RequestOptions = {}
): Promise<T> {
  const { method = 'GET', headers, body, baseUrl } = options;

  // For calls that still pass token explicitly, or use a different baseUrl
  const config: any = {
    method,
    url: endpoint,
    headers: { ...headers },
    data: body,
  };

  if (baseUrl) {
    config.baseURL = baseUrl;
  }

  // Cookies are sent automatically with withCredentials: true

  try {
    // If it's a standard call to API_BASE_URL with no explicit token, 
    // it will use the interceptors effectively anyway.
    // apiClient.request returns response.data due to interceptor.
    return await apiClient.request(config) as T;
  } catch (error) {
    if (error instanceof APIError) throw error;
    throw new APIError(500, 'Network error', error);
  }
}
