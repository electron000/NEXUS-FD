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

const NAV_ITEMS = [
  {
    href: "/overview",
    label: "Nerve Center",
    icon: LayoutDashboard,
    id: "overview",
    desc: "- Portfolio metrics",
  },
  {
    href: "/terminal",
    label: "Domain Terminal",
    icon: Terminal,
    id: "terminal",
    desc: "- Valuation engine",
  },
  {
    href: "/portfolio",
    label: "My Portfolio",
    icon: Briefcase,
    id: "portfolio",
    desc: "- Ownership & KYC",
  },
  {
    href: "/watchlist",
    label: "Watchlist",
    icon: Bookmark,
    id: "watchlist",
    desc: "- Tracked assets",
  },
  {
    href: "/messages",
    label: "Messages",
    icon: MessageSquare,
    id: "messages",
    desc: "- Client comms",
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
  const { logout } = useAppStore();
  const router = useRouter();

  async function handleLogout() {
    await logoutUser();
    logout();
    router.push("/login");
    onClose();
  }

  return (
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
                    <Icon
                      className={cn(
                        "h-4 w-4 shrink-0",
                        isActive ? "text-blue-400" : "",
                      )}
                      strokeWidth={isActive ? 2 : 1.5}
                    />
                    <div className="min-w-0 flex-1">
                      <p
                        className={cn(
                          "font-mono text-xs font-medium leading-none",
                          isActive ? "text-blue-400" : "text-zinc-300",
                        )}
                      >
                        {item.label}
                      </p>
                      <p className="font-mono text-[10px] text-zinc-600 mt-0.5 leading-none">
                        {item.desc}
                      </p>
                    </div>
                  </Link>
                );
              })}
            </nav>

            <div className="shrink-0 border-t border-zinc-800/50 p-3">
              <button
                onClick={handleLogout}
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
  );
}

function MobileBottomNav() {
  const pathname = usePathname();
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
            <Icon
              className="h-5 w-5 shrink-0"
              strokeWidth={isActive ? 2 : 1.5}
            />
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
  const { sidebarCollapsed, toggleSidebar, logout } = useAppStore();
  const router = useRouter();

  async function handleLogout() {
    await logoutUser();
    logout();
    router.push("/login");
  }

  return (
    <motion.aside
      animate={{ width: sidebarCollapsed ? 64 : 232 }}
      transition={{ duration: 0.22, ease: [0.4, 0, 0.2, 1] }}
      className="relative z-20 hidden md:flex h-full flex-col bg-zinc-950 border-r border-zinc-800/50 overflow-hidden shrink-0"
    >
      <div
        className={cn(
          "flex h-14 items-center border-b border-zinc-800/50 shrink-0 overflow-hidden",
          sidebarCollapsed ? "justify-center px-0" : "px-4 gap-3",
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
        <AnimatePresence initial={false}>
          {!sidebarCollapsed && (
            <motion.button
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.15 }}
              onClick={toggleSidebar}
              className="ml-auto flex h-6 w-6 shrink-0 items-center justify-center rounded-md text-zinc-700 hover:bg-zinc-800 hover:text-zinc-400 transition-all"
            >
              <ChevronLeft className="h-3.5 w-3.5" strokeWidth={2} />
            </motion.button>
          )}
        </AnimatePresence>
      </div>

      <nav className="flex flex-col gap-0.5 p-2 flex-1 overflow-y-auto overflow-x-hidden mt-1">
        {NAV_ITEMS.map((item) => {
          const Icon = item.icon;
          const isActive =
            pathname === item.href || pathname.startsWith(item.href + "/");
          return (
            <Link
              key={item.href}
              href={item.href}
              id={`nav-${item.id}`}
              title={sidebarCollapsed ? item.label : undefined}
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
              <Icon
                className={cn(
                  "shrink-0 transition-colors",
                  sidebarCollapsed ? "h-4.5 w-4.5" : "h-4 w-4",
                  isActive ? "text-blue-400" : "group-hover:text-zinc-200",
                )}
                strokeWidth={isActive ? 2 : 1.5}
              />
              <AnimatePresence initial={false}>
                {!sidebarCollapsed && (
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 0.15 }}
                    className="min-w-0 flex-1"
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
                    <p className="font-mono text-[10px] text-zinc-600 mt-0.5 leading-none">
                      {item.desc}
                    </p>
                  </motion.div>
                )}
              </AnimatePresence>
            </Link>
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
          <button
            onClick={handleLogout}
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
          <AnimatePresence initial={false}>
            {sidebarCollapsed && (
              <motion.button
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                onClick={toggleSidebar}
                className="flex h-8 w-8 items-center justify-center rounded-lg text-zinc-700 hover:bg-zinc-800 hover:text-zinc-400 transition-all mt-1"
              >
                <ChevronRight className="h-3.5 w-3.5" strokeWidth={2} />
              </motion.button>
            )}
          </AnimatePresence>
        </div>
      </div>
    </motion.aside>
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
  const { login, setHasHydrated } = useAppStore();
  const [isMobileDrawerOpen, setIsMobileDrawerOpen] = useState(false);

  // Use a ref to prevent double-firing in Strict Mode
  const hasFetched = useRef(false);

  useEffect(() => {
    if (hasFetched.current) return;
    hasFetched.current = true;

    const authenticateUser = async () => {
      try {
        const res = await getCurrentUser();
        const userData = (res as any)?.data?.user || (res as any)?.user;
        if (userData) {
          login(userData as any);
        }
      } catch (error: any) {
        // If we hit a 429 (Too many attempts) or 401,
        // we just let the AuthGuard handle the redirect.
        console.warn("Auth check bypassed:", error.message);
      } finally {
        // Critical: Always hydrate so the UI doesn't hang
        setHasHydrated(true);
      }
    };

    authenticateUser();
  }, [login, setHasHydrated]);

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