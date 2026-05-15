"use client";

import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import { getUser, saveUser } from "@/services/auth";
import type {
  UserProfile,
  WatchlistEntry,
  DomainValuationResponse,
} from "@/types";

export interface AppState {
  // ── Session ────────────────────────────────────────────────────────────────
  isLoggedIn: boolean;
  userProfile: UserProfile | null;
  _hasHydrated: boolean; // Added for hydration tracking

  // ── Watchlist ──────────────────────────────────────────────────────────────
  watchlist: WatchlistEntry[];

  // ── Terminal ───────────────────────────────────────────────────────────────
  lastQuery: string | null;
  lastValuation: DomainValuationResponse | null;
  queryHistory: string[];

  // ── UI Preferences ─────────────────────────────────────────────────────────
  sidebarCollapsed: boolean;
  commandPaletteOpen: boolean;
  unreadMessagesCount: number;

  // ── Actions ─────────────────────────────────────────────────────────────────
  setHasHydrated: (state: boolean) => void;
  setUnreadMessagesCount: (count: number) => void;
  fetchUnreadMessagesCount: () => Promise<void>;
  login: (user: UserProfile) => void;
  setAuthFromSession: () => void;
  logout: () => void;
  updateProfile: (updates: Partial<UserProfile>) => void;
  refreshProfile: (userData: UserProfile | { user: UserProfile } | unknown) => void;

  addToWatchlist: (domain: string, notes?: string) => void;
  removeFromWatchlist: (domain: string) => void;
  updateWatchlistEntry: (
    domain: string,
    updates: Partial<WatchlistEntry>,
  ) => void;
  isInWatchlist: (domain: string) => boolean;

  setLastValuation: (
    domain: string,
    valuation: DomainValuationResponse,
  ) => void;
  clearValuation: () => void;

  toggleSidebar: () => void;
  setSidebarCollapsed: (v: boolean) => void;
  openCommandPalette: () => void;
  closeCommandPalette: () => void;
}

export const useAppStore = create<AppState>()(
  persist(
    (set, get) => ({
      // ── Initial state ──────────────────────────────────────────────────────
      isLoggedIn: false,
      userProfile: null,
      _hasHydrated: false, // Default to false
      watchlist: [],
      lastQuery: null,
      lastValuation: null,
      queryHistory: [],
      sidebarCollapsed: false,
      commandPaletteOpen: false,
      unreadMessagesCount: 0,

      // ── Hydration action ───────────────────────────────────────────────────
      setHasHydrated: (state) => set({ _hasHydrated: state }),
      setUnreadMessagesCount: (count) => set({ unreadMessagesCount: count }),
      fetchUnreadMessagesCount: async () => {
        try {
          const { apiClient } = await import("@/services/config");
          const res = await apiClient.get<{ count: number }>("/api/inquiries/unread-count");
          // Axios interceptor returns response.data, so we cast to access the property
          const count = (res as unknown as { count: number }).count;
          set({ unreadMessagesCount: count || 0 });
        } catch (err) {
          console.warn("Failed to fetch unread message count", err);
        }
      },

      // ── Auth actions ───────────────────────────────────────────────────────
      login: (user) => {
        const profile = {
          ...user,
          avatarInitials: (user.name || user.email || "U")
            .split(" ")
            .map((w: string) => w[0])
            .join("")
            .slice(0, 2)
            .toUpperCase(),
        };
        set({
          isLoggedIn: true,
          userProfile: profile,
        });
        saveUser(profile);
      },

      setAuthFromSession: () => {
        const user = getUser();
        if (user) {
          set({
            isLoggedIn: true,
            userProfile: {
              ...user,
              avatarInitials: (user.name || user.email || "U")
                .split(" ")
                .map((w: string) => w[0])
                .join("")
                .slice(0, 2)
                .toUpperCase(),
            },
          });
        }
      },

      logout: () => {
        set({
          isLoggedIn: false,
          userProfile: null,
          lastValuation: null,
          lastQuery: null,
          watchlist: [],
          queryHistory: [],
        });
      },

      updateProfile: (updates) =>
        set((state) => {
          const newProfile = state.userProfile
            ? { ...state.userProfile, ...updates }
            : null;
          if (newProfile) {
            saveUser(newProfile);
          }
          return { userProfile: newProfile };
        }),

      refreshProfile: (userData) => {
        if (!userData) return;
        
        // Hardened data extraction: handles nested { user: {...} } or raw user object
        const u = ((userData as { user?: UserProfile })?.user || userData) as UserProfile & { created_at?: string };
        
        const profile: UserProfile = {
          ...u,
          createdAt: u.created_at || u.createdAt || "",
          avatarInitials: (u.name || u.email || "U")
            .split(" ")
            .map((w: string) => w[0])
            .join("")
            .slice(0, 2)
            .toUpperCase(),
        } as UserProfile;
        
        set({
          isLoggedIn: true,
          userProfile: profile,
        });
        saveUser(profile);
      },

      // ... (Watchlist, Terminal, and UI actions remain unchanged)
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
            e.domain === domain ? { ...e, ...updates } : e,
          ),
        })),
      isInWatchlist: (domain) =>
        get().watchlist.some((e) => e.domain === domain),
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
      toggleSidebar: () =>
        set((state) => ({ sidebarCollapsed: !state.sidebarCollapsed })),
      setSidebarCollapsed: (v) => set({ sidebarCollapsed: v }),
      openCommandPalette: () => set({ commandPaletteOpen: true }),
      closeCommandPalette: () => set({ commandPaletteOpen: false }),
    }),
    {
      name: "nexus-terminal-store",
      storage: createJSONStorage(() =>
        typeof window !== "undefined" ? localStorage : ({} as Storage),
      ),
      // Ensure we set hydrated flag after storage is loaded
      onRehydrateStorage: () => () => {
        // We no longer set hydrated = true here. 
        // DashboardLayout will set it after a fresh server check.
      },
      partialize: (state) => ({
        isLoggedIn: state.isLoggedIn,
        userProfile: state.userProfile,
        watchlist: state.watchlist,
        queryHistory: state.queryHistory,
        sidebarCollapsed: state.sidebarCollapsed,
      }),
    },
  ),
);
