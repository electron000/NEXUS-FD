/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { ReactNode, useEffect, useState, useRef } from "react";
import Link from "next/link";
import Image from "next/image";
import { useRouter, usePathname } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import {
  LayoutDashboard,
  Terminal,
  Bookmark,
  LogOut,
  ChevronLeft,
  ChevronRight,
  X,
  Briefcase,
  MessageSquare,
} from "lucide-react";
import { useAppStore } from "@/store/useAppStore";
import { cn } from "@/lib/utils";
import { logoutUser, getCurrentUser } from "@/services/auth";
import { connectSocket, disconnectSocket, getSocket } from "@/lib/socket";

const Tooltip = ({ text, children, active = true }: { text: string; children: ReactNode, active?: boolean }) => {
  if (!active) return <>{children}</>;

  return (
    <div className="relative group flex items-center">
      {children}
      <div className="absolute left-[calc(100%+14px)] top-1/2 -translate-y-1/2 pointer-events-none opacity-0 group-hover:opacity-100 transition-all duration-200 whitespace-nowrap z-[100] translate-x-[-4px] group-hover:translate-x-0">
        <div className="flex items-center justify-center rounded-lg border border-zinc-700/60 bg-zinc-900/95 px-3 py-1.5 backdrop-blur-xl shadow-lg">
          <span className="text-[12px] text-zinc-200 font-mono leading-none tracking-wide">{text}</span>
        </div>
      </div>
    </div>
  );
};

const NAV_ITEMS = [
  {
    href: "/overview",
    label: "Nerve Center",
    icon: LayoutDashboard,
    id: "overview",
  },
  {
    href: "/terminal",
    label: "Domain Terminal",
    icon: Terminal,
    id: "terminal",
  },
  {
    href: "/portfolio",
    label: "Sale Portfolio",
    icon: Briefcase,
    id: "portfolio",
  },
  {
    href: "/watchlist",
    label: "Watchlist",
    icon: Bookmark,
    id: "watchlist",
  },
  {
    href: "/messages",
    label: "Messages",
    icon: MessageSquare,
    id: "messages",
  },
];

function MobileDrawer({
  open,
  onClose,
}: {
  open: boolean;
  onClose: () => void;
}) {
  const pathname = usePathname();
  const { logout, unreadMessagesCount } = useAppStore();
  const router = useRouter();

  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);

  async function handleLogout() {
    await logoutUser();
    disconnectSocket();
    logout();
    router.push("/");
    onClose();
  }

  return (
    <>
      <AnimatePresence>
        {open && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="fixed inset-0 z-40 bg-black/70 backdrop-blur-sm md:hidden"
              onClick={onClose}
            />
            <motion.aside
              initial={{ x: "-100%" }}
              animate={{ x: 0 }}
              exit={{ x: "-100%" }}
              transition={{ duration: 0.25, ease: [0.4, 0, 0.2, 1] }}
              className="fixed left-0 top-0 bottom-0 z-50 flex w-72 flex-col bg-zinc-950 border-r border-zinc-800/50 md:hidden overflow-y-auto"
            >
              <div className="flex h-14 items-center justify-between border-b border-zinc-800/50 px-4">
                <Link
                  href="/overview"
                  className="flex items-center gap-3 group"
                  onClick={onClose}
                >
                  <div className="shrink-0 flex h-7 w-7 items-center justify-center">
                    <Image
                      src="/nexus.webp"
                      alt="Nexus"
                      width={26}
                      height={26}
                      className="object-contain opacity-90"
                    />
                  </div>
                  <p className="font-mono text-sm font-bold tracking-[0.18em] text-white uppercase">
                    NEXUS
                  </p>
                </Link>
                <button
                  onClick={onClose}
                  className="flex h-7 w-7 items-center justify-center rounded-md text-zinc-600 hover:bg-zinc-800 hover:text-zinc-300 transition-all"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>

              <nav className="flex flex-col gap-0.5 p-3 flex-1">
                <p className="px-2 pb-2 pt-1 font-mono text-[9px] font-semibold uppercase tracking-[0.18em] text-zinc-700">
                  Navigation
                </p>
                {NAV_ITEMS.map((item) => {
                  const Icon = item.icon;
                  const isActive =
                    pathname === item.href ||
                    pathname.startsWith(item.href + "/");
                  return (
                    <Link
                      key={item.href}
                      href={item.href}
                      onClick={onClose}
                      className={cn(
                        "relative flex items-center gap-3 rounded-lg px-3 py-2.5 transition-all duration-150",
                        isActive
                          ? "bg-blue-500/10 text-blue-400"
                          : "text-zinc-500 hover:bg-zinc-800/60 hover:text-zinc-200",
                      )}
                    >
                      {isActive && (
                        <span className="absolute left-0 top-1/2 -translate-y-1/2 h-4 w-0.5 rounded-r-full bg-blue-400" />
                      )}
                      <div className="relative">
                        <Icon
                          className={cn(
                            "h-4 w-4 shrink-0",
                            isActive ? "text-blue-400" : "",
                          )}
                          strokeWidth={isActive ? 2 : 1.5}
                        />
                        {item.id === "messages" && unreadMessagesCount > 0 && (
                          <span className="absolute -top-1.5 -right-1.5 flex h-3.5 w-3.5 items-center justify-center rounded-full bg-red-500 text-[8px] font-bold text-white shadow-lg ring-1 ring-zinc-950">
                            {unreadMessagesCount > 9 ? "9+" : unreadMessagesCount}
                          </span>
                        )}
                      </div>
                      <div className="min-w-0 flex-1">
                        <p
                          className={cn(
                            "font-mono text-xs font-medium leading-none",
                            isActive ? "text-blue-400" : "text-zinc-300",
                          )}
                        >
                          {item.label}
                        </p>
                      </div>
                    </Link>
                  );
                })}
              </nav>

              <div className="shrink-0 border-t border-zinc-800/50 p-3">
                <button
                  onClick={() => setShowLogoutConfirm(true)}
                  className="flex w-full items-center gap-2.5 rounded-lg px-3 py-2 text-zinc-600 hover:bg-red-500/8 hover:text-red-400 transition-all duration-150"
                >
                  <LogOut className="h-4 w-4 shrink-0" strokeWidth={1.5} />
                  <span className="font-mono text-xs">Sign Out</span>
                </button>
              </div>
            </motion.aside>
          </>
        )}
      </AnimatePresence>

      <LogoutConfirmModal
        isOpen={showLogoutConfirm}
        onClose={() => setShowLogoutConfirm(false)}
        onConfirm={handleLogout}
      />
    </>
  );
}

function LogoutConfirmModal({
  isOpen,
  onClose,
  onConfirm,
}: {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
}) {
  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-200">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            className="w-full max-w-sm bg-zinc-950 border border-zinc-800 rounded-xl shadow-2xl overflow-hidden p-6 text-center"
          >
            <div className="h-12 w-12 bg-red-500/10 border border-red-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
              <LogOut className="h-6 w-6 text-red-500" />
            </div>
            <h3 className="text-lg font-bold text-white mb-2 font-mono uppercase tracking-tight">
              Sign Out?
            </h3>
            <p className="text-zinc-400 text-xs font-mono mb-6 uppercase tracking-wider leading-relaxed">
              Are you sure you want to terminate your current session and exit the NEXUS terminal?
            </p>
            <div className="flex gap-3">
              <button
                onClick={onClose}
                className="flex-1 px-4 py-2 rounded-lg border border-zinc-800 text-zinc-400 hover:text-white hover:bg-zinc-900 transition-all font-mono text-[10px] uppercase tracking-widest"
              >
                Cancel
              </button>
              <button
                onClick={onConfirm}
                className="flex-1 px-4 py-2 rounded-lg bg-red-600 hover:bg-red-700 text-white transition-all font-mono text-[10px] uppercase tracking-widest"
              >
                Sign Out
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}

function MobileBottomNav() {
  const pathname = usePathname();
  const { unreadMessagesCount } = useAppStore();
  return (
    <nav className="fixed bottom-0 left-0 right-0 z-30 flex items-center justify-around border-t border-zinc-800/60 bg-zinc-950/95 backdrop-blur-xl px-2 pb-safe md:hidden">
      {NAV_ITEMS.map((item) => {
        const Icon = item.icon;
        const isActive =
          pathname === item.href || pathname.startsWith(item.href + "/");
        const shortLabel =
          item.id === "overview"
            ? "Overview"
            : item.id === "terminal"
              ? "Terminal"
              : item.id === "portfolio"
                ? "Assets"
                : item.id === "messages"
                  ? "Chats"
                  : "Watch";

        return (
          <Link
            key={item.href}
            href={item.href}
            className={cn(
              "relative flex flex-col items-center gap-1 px-3 py-2.5 rounded-lg transition-all min-w-0",
              isActive ? "text-blue-400" : "text-zinc-600 hover:text-zinc-300",
            )}
          >
            <div className="relative">
              <Icon
                className="h-5 w-5 shrink-0"
                strokeWidth={isActive ? 2 : 1.5}
              />
              {item.id === "messages" && unreadMessagesCount > 0 && (
                <span className="absolute -top-1 -right-1 flex h-4 w-4 items-center justify-center rounded-full bg-red-500 text-[8px] font-bold text-white shadow-lg ring-2 ring-zinc-950">
                  {unreadMessagesCount > 9 ? "9+" : unreadMessagesCount}
                </span>
              )}
            </div>
            <span
              className={cn(
                "font-mono text-[9px] uppercase tracking-wide truncate",
                isActive ? "text-blue-400" : "text-zinc-700",
              )}
            >
              {shortLabel}
            </span>
            {isActive && (
              <span className="absolute bottom-0 left-1/2 -translate-x-1/2 h-0.5 w-4 rounded-full bg-blue-400" />
            )}
          </Link>
        );
      })}
    </nav>
  );
}

function Sidebar() {
  const pathname = usePathname();
  const { sidebarCollapsed, toggleSidebar, logout, unreadMessagesCount } = useAppStore();
  const router = useRouter();

  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);

  async function handleLogout() {
    await logoutUser();
    disconnectSocket();
    logout();
    router.push("/");
  }

  return (
    <>
      <motion.aside
      animate={{ width: sidebarCollapsed ? 64 : 232 }}
      transition={{ duration: 0.22, ease: [0.4, 0, 0.2, 1] }}
      className="relative z-20 hidden md:flex h-full flex-col bg-zinc-950 border-r border-zinc-800/50 shrink-0"
    >
      <div
        className={cn(
          "flex items-center border-b border-zinc-800/50 shrink-0 overflow-hidden",
          sidebarCollapsed ? "flex-col h-auto py-4 px-0 justify-center gap-4" : "h-14 px-4 gap-3 justify-between",
        )}
      >
        <Link
          href="/overview"
          className="flex items-center gap-3 min-w-0 group"
        >
          <div className="shrink-0 flex h-7 w-7 items-center justify-center">
            <Image
              src="/nexus.webp"
              alt="Nexus"
              width={26}
              height={26}
              className="object-contain opacity-90 group-hover:opacity-100 transition-opacity"
            />
          </div>
          <AnimatePresence initial={false}>
            {!sidebarCollapsed && (
              <motion.div
                initial={{ opacity: 0, width: 0 }}
                animate={{ opacity: 1, width: "auto" }}
                exit={{ opacity: 0, width: 0 }}
                transition={{ duration: 0.2 }}
                className="overflow-hidden min-w-0"
              >
                <p className="font-mono text-sm font-bold tracking-[0.18em] text-white uppercase whitespace-nowrap">
                  NEXUS
                </p>
              </motion.div>
            )}
          </AnimatePresence>
        </Link>
        <button
          onClick={toggleSidebar}
          className={cn(
            "flex h-6 w-6 shrink-0 items-center justify-center rounded-md text-zinc-700 hover:bg-zinc-800 hover:text-zinc-400 transition-all",
            sidebarCollapsed ? "" : ""
          )}
        >
          {sidebarCollapsed ? (
            <ChevronRight className="h-3.5 w-3.5" strokeWidth={2} />
          ) : (
            <ChevronLeft className="h-3.5 w-3.5" strokeWidth={2} />
          )}
        </button>
      </div>

      <nav className="flex flex-col gap-0.5 p-2 flex-1 mt-1">
        {NAV_ITEMS.map((item) => {
          const Icon = item.icon;
          const isActive =
            pathname === item.href || pathname.startsWith(item.href + "/");
          return (
            <Tooltip key={item.href} text={item.label} active={sidebarCollapsed}>
              <Link
                href={item.href}
                id={`nav-${item.id}`}
                className={cn(
                  "relative flex items-center rounded-lg transition-all duration-150 group",
                  sidebarCollapsed
                    ? "h-10 w-10 mx-auto justify-center"
                    : "gap-3 px-3 py-2.5",
                  isActive
                    ? "bg-blue-500/10 text-blue-400"
                    : "text-zinc-500 hover:bg-zinc-800/60 hover:text-zinc-200",
                )}
              >
                {isActive && (
                  <span className="absolute left-0 top-1/2 -translate-y-1/2 h-4 w-0.5 rounded-r-full bg-blue-400" />
                )}
                <div className="relative">
                  <Icon
                    className={cn(
                      "shrink-0 transition-colors",
                      sidebarCollapsed ? "h-4.5 w-4.5" : "h-4 w-4",
                      isActive ? "text-blue-400" : "group-hover:text-zinc-200",
                    )}
                    strokeWidth={isActive ? 2 : 1.5}
                  />
                  {item.id === "messages" && unreadMessagesCount > 0 && (
                    <span className={cn(
                      "absolute flex items-center justify-center rounded-full bg-red-600 text-[9px] font-bold text-white shadow-lg ring-1 ring-zinc-950",
                      sidebarCollapsed ? "-top-1 -right-1 h-3.5 w-3.5" : "-top-1 -right-1 h-4 w-4"
                    )}>
                      {unreadMessagesCount > 99 ? ".." : unreadMessagesCount}
                    </span>
                  )}
                </div>
                <AnimatePresence initial={false}>
                  {!sidebarCollapsed && (
                    <motion.div
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                      transition={{ duration: 0.15 }}
                      className="min-w-0 flex-1 flex items-center justify-between"
                    >
                      <p
                        className={cn(
                          "font-mono text-xs font-medium leading-none",
                          isActive
                            ? "text-blue-400"
                            : "text-zinc-300 group-hover:text-white",
                        )}
                      >
                        {item.label}
                      </p>
                    </motion.div>
                  )}
                </AnimatePresence>
              </Link>
            </Tooltip>
          );
        })}
      </nav>

      <div className="shrink-0 border-t border-zinc-800/50">
        <div
          className={cn(
            "p-2",
            sidebarCollapsed ? "flex flex-col items-center gap-1" : "",
          )}
        >
          <Tooltip text="Sign Out" active={sidebarCollapsed}>
            <button
              onClick={() => setShowLogoutConfirm(true)}
              className={cn(
                "flex items-center gap-2.5 rounded-lg text-zinc-600 hover:bg-red-500/8 hover:text-red-400 transition-all duration-150 mt-1",
                sidebarCollapsed
                  ? "h-10 w-10 justify-center"
                  : "w-full px-3 py-2",
              )}
            >
              <LogOut className="h-4 w-4 shrink-0" strokeWidth={1.5} />
              <AnimatePresence initial={false}>
                {!sidebarCollapsed && (
                  <motion.span
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 0.15 }}
                    className="font-mono text-xs"
                  >
                    Sign Out
                  </motion.span>
                )}
              </AnimatePresence>
            </button>
          </Tooltip>
        </div>
      </div>

      <LogoutConfirmModal
        isOpen={showLogoutConfirm}
        onClose={() => setShowLogoutConfirm(false)}
        onConfirm={handleLogout}
      />
    </motion.aside>
    </>
  );
}

function AuthGuard({ children }: { children: ReactNode }) {
  const { isLoggedIn, _hasHydrated } = useAppStore();
  const router = useRouter();

  useEffect(() => {
    // Only redirect if hydration is complete and user is NOT logged in
    if (_hasHydrated && !isLoggedIn) {
      router.replace("/login");
    }
  }, [isLoggedIn, _hasHydrated, router]);

  // Stay in loading state until we know for sure
  if (!_hasHydrated || !isLoggedIn) {
    return (
      <div className="flex h-screen items-center justify-center bg-[#09090b]">
        <div className="font-mono text-[10px] tracking-widest text-zinc-700 animate-pulse uppercase">
          SYS_RESTORE: AUTH_PENDING...
        </div>
      </div>
    );
  }

  return <>{children}</>;
}

export default function DashboardLayout({ children }: { children: ReactNode }) {
  const { refreshProfile, setHasHydrated, isLoggedIn, _hasHydrated, logout, fetchUnreadMessagesCount } = useAppStore();
  const [isMobileDrawerOpen, setIsMobileDrawerOpen] = useState(false);
  const pathname = usePathname();

  // Use a ref to prevent double-firing in Strict Mode
  const hasFetched = useRef(false);

  useEffect(() => {
    if (hasFetched.current) return;
    hasFetched.current = true;

    const initializeDashboard = async () => {
      try {
        // 1. Force fetch fresh profile data before allowing the app to render
        const res = await getCurrentUser();
        
        // 2. Explicitly extract user data. Our backend /me returns { user: {...} }
        const userData = (res as any)?.user;
        
        if (userData) {
          refreshProfile(userData);
          connectSocket();
          
          // Initial unread count fetch
          fetchUnreadMessagesCount();

          // Socket listener for new messages to update counts in real-time
          const socket = getSocket();
          socket.off("new_message"); // Prevent duplicates
          socket.on("new_message", () => {
             // If we're not on the messages page, increment total unread count
             // Or if we're on the messages page but not in THAT specific chat
             // For now, simpler is just to re-fetch unread count on every new message
             fetchUnreadMessagesCount();
          });
          
          // Handle new inquiry notifications too
          socket.off("new_inquiry");
          socket.on("new_inquiry", () => {
            fetchUnreadMessagesCount();
          });
        } else {
          console.warn("User data missing in /me response", res);
        }
      } catch (error: any) {
        // If 401 or 404 on /me, the interceptor will handle redirect.
        // But we should also clear the local state to prevent AuthGuard from flashing the app.
        if (error.status === 401 || error.status === 404) {
          logout();
        }
        console.error("Initial auth check failed:", error.message);
      } finally {
        // 3. Signal hydration completion ONLY now.
        // This releases AuthGuard to either show the app (if logged in) or redirect (if not).
        setHasHydrated(true);
      }
    };

    initializeDashboard();
  }, [refreshProfile, setHasHydrated, fetchUnreadMessagesCount, logout]);

  // Handle subsequent navigation refreshes to keep status in sync
  useEffect(() => {
    // Only run if we are actually logged in and hydrated
    if (!isLoggedIn || !_hasHydrated) return;

    const syncStatus = async () => {
      try {
        const res = await getCurrentUser();
        const userData = (res as any)?.user;
        if (userData) {
          refreshProfile(userData);
        }
      } catch (e) {
        console.warn("Background status sync failed", e);
      }
    };

    // This effect runs on pathname change. 
    // initializeDashboard already handles the very first fetch on mount.
    syncStatus();
  }, [pathname, isLoggedIn, _hasHydrated, refreshProfile]);

  return (
    <AuthGuard>
      <div className="flex h-screen w-full overflow-hidden bg-[#09090b]">
        {/* Desktop Sidebar */}
        <Sidebar />

        {/* 2. Render Mobile Components here to resolve the "Unused" error */}
        <MobileDrawer
          open={isMobileDrawerOpen}
          onClose={() => setIsMobileDrawerOpen(false)}
        />

        <div className="flex flex-1 flex-col min-w-0 overflow-hidden">
          {/* Optional: Add a mobile-only header to trigger the drawer if needed */}
          <main className="terminal-grid flex-1 overflow-y-auto overflow-x-hidden p-4 md:p-5 pb-20 md:pb-5">
            {children}
          </main>
        </div>

        {/* 3. Render Bottom Navigation */}
        <MobileBottomNav />
      </div>
    </AuthGuard>
  );
}