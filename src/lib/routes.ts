/**
 * NEXUS Central Route Registry
 * 
 * This file serves as the single source of truth for all routes within the platform.
 * It categorizes routes by protection level to assist in guard implementation.
 */

export const ROUTES = {
  // --- Public Marketing Routes ---
  PUBLIC: {
    HOME: "/",
    FEATURES: "/#features",
    LOGIN: "/login",
    REGISTER: "/register",
  },

  // --- Protected Dashboard Routes (Requires Auth) ---
  PROTECTED: {
    TERMINAL: "/terminal", // Domain Search/Appraisal
    OVERVIEW: "/overview", // Nerve Center
    PORTFOLIO: "/portfolio", // Asset Management
    KYC: "/kyc", // Seller Verification
    WATCHLIST: "/watchlist", // Tracked Assets
    SETTINGS: "/settings", // User Preferences
  },

  // --- Administrative Routes (Requires is_admin: true) ---
  ADMIN: {
    LOGIN: "/admin/login",
    DASHBOARD: "/admin/dashboard",
    KYC_REVIEW: "/admin/dashboard", // Integrated into dashboard
    USER_MANAGEMENT: "/admin/users",
  },
};

/**
 * Helper to check if a path is protected
 */
export const isProtectedRoute = (path: string) => {
  return Object.values(ROUTES.PROTECTED).some(route => path.startsWith(route));
};

/**
 * Helper to check if a path is an admin route
 */
export const isAdminRoute = (path: string) => {
  return Object.values(ROUTES.ADMIN).some(route => path.startsWith(route));
};
