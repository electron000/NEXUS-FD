/**
 * auth/index.ts
 */

import { apiCall } from "../config";

export interface AuthResponse {
  id: string;
  email: string;
  name: string;
  role: string;
  token: string;
}

// ---------------------------------------------------------------------------
// TOKEN & USER STORAGE
// ---------------------------------------------------------------------------

const TOKEN_KEY = 'nexus_token';
const USER_KEY = 'nexus_user';

export function saveToken(token: string): void {
  if (typeof window !== 'undefined') {
    localStorage.setItem(TOKEN_KEY, token);
  }
}

export function getToken(): string | null {
  if (typeof window !== 'undefined') {
    return localStorage.getItem(TOKEN_KEY);
  }
  return null;
}

export function clearToken(): void {
  if (typeof window !== 'undefined') {
    localStorage.removeItem(TOKEN_KEY);
    localStorage.removeItem(USER_KEY);
  }
}

export function saveUser(user: Omit<AuthResponse, 'token'>): void {
  if (typeof window !== 'undefined') {
    localStorage.setItem(USER_KEY, JSON.stringify(user));
  }
}

export function getUser(): (Omit<AuthResponse, 'token'> | null) {
  if (typeof window !== 'undefined') {
    const user = localStorage.getItem(USER_KEY);
    return user ? JSON.parse(user) : null;
  }
  return null;
}

// ---------------------------------------------------------------------------
// API ACTIONS
// ---------------------------------------------------------------------------

export async function signup(
  email: string,
  password: string,
  name: string
): Promise<AuthResponse> {
  return apiCall<AuthResponse>('/api/auth/signup', {
    method: 'POST',
    body: { email, password, name },
  });
}

export async function login(
  email: string,
  password: string
): Promise<AuthResponse> {
  return apiCall<AuthResponse>('/api/auth/login', {
    method: 'POST',
    body: { email, password },
  });
}

export async function getCurrentUser(token: string) {
  return apiCall('/api/auth/me', { token });
}

export async function loginUser(email: string, password: string) {
  try {
    const response = await login(email, password);
    const { token, ...user } = response;
    saveToken(token);
    saveUser(user);
    return { success: true, user: { ...user, token } };
  } catch (error) {
    return { success: false, error };
  }
}

export async function signupUser(email: string, password: string, name: string) {
  try {
    const response = await signup(email, password, name);
    const { token, ...user } = response;
    saveToken(token);
    saveUser(user);
    return { success: true, user: { ...user, token } };
  } catch (error) {
    return { success: false, error };
  }
}

export function logoutUser(): void {
  clearToken();
}


export function isAuthenticated(): boolean {
  return !!getToken();
}
