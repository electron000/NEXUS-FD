"use client";

import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import type { DomainValuationResponse } from "@/services/mock";

// ---------------------------------------------------------------------------
// TYPE DEFINITIONS
// ---------------------------------------------------------------------------

export interface UserProfile {
  id: string;
  email: string;
  name: string;
  role: "investor" | "brand_manager" | "analyst";
  preferredCurrency: "USD" | "EUR" | "GBP";
  defaultExtensions: string[];
  avatarInitials: string;
  createdAt: string;
}

export interface WatchlistEntry {
  domain: string;
  addedAt: string;
  alertPrice?: number;
  notes?: string;
  lastValuation?: DomainValuationResponse;
}

export interface AppState {
  // ── Session ────────────────────────────────────────────────────────────────
  isLoggedIn: boolean;
  sessionToken: string | null;
  userProfile: UserProfile | null;

  // ── Watchlist ──────────────────────────────────────────────────────────────
  watchlist: WatchlistEntry[];

  // ── Terminal ───────────────────────────────────────────────────────────────
  lastQuery: string | null;
  lastValuation: DomainValuationResponse | null;
  queryHistory: string[];

  // ── UI Preferences ─────────────────────────────────────────────────────────
  sidebarCollapsed: boolean;
  commandPaletteOpen: boolean;

  // ── Actions ─────────────────────────────────────────────────────────────────
  login: (email: string, name: string, role?: UserProfile["role"]) => void;
  logout: () => void;
  updateProfile: (updates: Partial<UserProfile>) => void;

  addToWatchlist: (domain: string, notes?: string) => void;
  removeFromWatchlist: (domain: string) => void;
  updateWatchlistEntry: (domain: string, updates: Partial<WatchlistEntry>) => void;
  isInWatchlist: (domain: string) => boolean;

  setLastValuation: (domain: string, valuation: DomainValuationResponse) => void;
  clearValuation: () => void;

  toggleSidebar: () => void;
  setSidebarCollapsed: (v: boolean) => void;
  openCommandPalette: () => void;
  closeCommandPalette: () => void;
}

// ---------------------------------------------------------------------------
// STORE
// ---------------------------------------------------------------------------

export const useAppStore = create<AppState>()(
  persist(
    (set, get) => ({
      // ── Initial state ──────────────────────────────────────────────────────
      isLoggedIn: false,
      sessionToken: null,
      userProfile: null,
      watchlist: [],
      lastQuery: null,
      lastValuation: null,
      queryHistory: [],
      sidebarCollapsed: false,
      commandPaletteOpen: false,

      // ── Auth actions ───────────────────────────────────────────────────────
      login: (email, name, role = "analyst") => {
        const id = `usr_${Date.now().toString(36)}`;
        const token = `nxt_${id}_${Math.random().toString(36).slice(2)}`;
        set({
          isLoggedIn: true,
          sessionToken: token,
          userProfile: {
            id,
            email,
            name,
            role,
            preferredCurrency: "USD",
            defaultExtensions: [".com", ".io", ".ai"],
            avatarInitials: name.split(" ").map((w) => w[0]).join("").slice(0, 2).toUpperCase(),
            createdAt: new Date().toISOString(),
          },
        });
      },

      logout: () =>
        set({
          isLoggedIn: false,
          sessionToken: null,
          userProfile: null,
          lastValuation: null,
          lastQuery: null,
        }),

      updateProfile: (updates) =>
        set((state) => ({
          userProfile: state.userProfile ? { ...state.userProfile, ...updates } : null,
        })),

      // ── Watchlist actions ──────────────────────────────────────────────────
      addToWatchlist: (domain, notes) => {
        const existing = get().watchlist.find((e) => e.domain === domain);
        if (existing) return;
        set((state) => ({
          watchlist: [
            ...state.watchlist,
            { domain, addedAt: new Date().toISOString(), notes },
          ],
        }));
      },

      removeFromWatchlist: (domain) =>
        set((state) => ({
          watchlist: state.watchlist.filter((e) => e.domain !== domain),
        })),

      updateWatchlistEntry: (domain, updates) =>
        set((state) => ({
          watchlist: state.watchlist.map((e) =>
            e.domain === domain ? { ...e, ...updates } : e
          ),
        })),

      isInWatchlist: (domain) => get().watchlist.some((e) => e.domain === domain),

      // ── Terminal actions ───────────────────────────────────────────────────
      setLastValuation: (domain, valuation) =>
        set((state) => ({
          lastQuery: domain,
          lastValuation: valuation,
          queryHistory: [
            domain,
            ...state.queryHistory.filter((q) => q !== domain),
          ].slice(0, 20),
        })),

      clearValuation: () => set({ lastValuation: null, lastQuery: null }),

      // ── UI actions ─────────────────────────────────────────────────────────
      toggleSidebar: () =>
        set((state) => ({ sidebarCollapsed: !state.sidebarCollapsed })),

      setSidebarCollapsed: (v) => set({ sidebarCollapsed: v }),

      openCommandPalette: () => set({ commandPaletteOpen: true }),
      closeCommandPalette: () => set({ commandPaletteOpen: false }),
    }),
    {
      name: "nexus-terminal-store",
      storage: createJSONStorage(() =>
        typeof window !== "undefined" ? localStorage : ({} as Storage)
      ),
      // Only persist non-transient state
      partialize: (state) => ({
        isLoggedIn: state.isLoggedIn,
        sessionToken: state.sessionToken,
        userProfile: state.userProfile,
        watchlist: state.watchlist,
        queryHistory: state.queryHistory,
        sidebarCollapsed: state.sidebarCollapsed,
      }),
    }
  )
);
