/**
 * config.ts
 * Unified API configuration and shared request handler
 */

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

export interface RequestOptions {
  method?: 'GET' | 'POST' | 'PUT' | 'DELETE' | 'PATCH';
  headers?: Record<string, string>;
  body?: unknown;
  token?: string;
}

export async function apiCall<T>(
  endpoint: string,
  options: RequestOptions = {}
): Promise<T> {
  const url = `${API_BASE_URL}${endpoint}`;
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...options.headers,
  };

  if (options.token) {
    headers['Authorization'] = `Bearer ${options.token}`;
  }

  try {
    const response = await fetch(url, {
      method: options.method || 'GET',
      headers,
      body: options.body ? JSON.stringify(options.body) : undefined,
      credentials: 'include',
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new APIError(
        response.status,
        errorData.error || errorData.message || 'API request failed',
        errorData
      );
    }

    return await response.json() as T;
  } catch (error) {
    if (error instanceof APIError) throw error;
    throw new APIError(500, 'Network error', error);
  }
}
