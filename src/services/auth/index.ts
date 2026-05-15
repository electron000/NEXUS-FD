/* eslint-disable @typescript-eslint/no-explicit-any */
/**
 * auth/index.ts
 * Authentic Authentication Service
 */

import { UserProfile } from "@/types";
import { apiClient } from "../config";

export interface AuthResponse {
  success: boolean;
  user: UserProfile;
}

// ---------------------------------------------------------------------------
// SESSION STORAGE (For Non-Sensitive Profile UI)
// ---------------------------------------------------------------------------

const USER_KEY = 'nexus_user';

export function clearSession(): void {
  if (typeof window !== 'undefined') {
    localStorage.removeItem(USER_KEY);
  }
}

export function saveUser(user: any): void {
  if (typeof window !== 'undefined') {
    localStorage.setItem(USER_KEY, JSON.stringify(user));
  }
}

export function getUser(): any | null {
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
  return apiClient.post('/api/auth/signup', { email, password, name });
}

export async function login(
  email: string,
  password: string
): Promise<AuthResponse> {
  return apiClient.post('/api/auth/login', { email, password });
}

export async function sendOTP(email: string): Promise<{ success: boolean; message: string }> {
  try {
    const response: any = await apiClient.post('/api/auth/send_otp', { email });
    return { success: true, message: response.message || "OTP sent" };
  } catch (error: any) {
    return { success: false, message: error.response?.data?.message || "Failed to send OTP" };
  }
}

export async function verifyOTP(email: string, otp: string): Promise<{ success: boolean; message: string }> {
  try {
    const response: any = await apiClient.post('/api/auth/verify_otp', { email, otp });
    return { success: true, message: response.message || "Email verified" };
  } catch (error: any) {
    return { success: false, message: error.response?.data?.message || "Invalid or expired OTP" };
  }
}

/**
 * Retrieves the current user from the server session.
 * Credentials handled automatically via cookies.
 */
export async function getCurrentUser() {
  return apiClient.get(`/api/auth/me?t=${Date.now()}`);
}

export async function loginUser(email: string, password: string) {
  try {
    const response = await login(email, password);
    saveUser(response.user);
    return { success: true, user: response.user };
  } catch (error) {
    return { success: false, error };
  }
}

export async function signupUser(email: string, password: string, name: string) {
  try {
    const response = await signup(email, password, name);
    saveUser(response.user);
    return { success: true, user: response.user };
  } catch (error) {
    return { success: false, error };
  }
}

export async function logoutUser(): Promise<void> {
  try {
    await apiClient.post('/api/auth/logout');
  } finally {
    clearSession();
  }
}

export function isAuthenticated(): boolean {
  return !!getUser();
}
