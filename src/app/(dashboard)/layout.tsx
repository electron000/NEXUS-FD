"use client";

import { ReactNode, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { useRouter, usePathname } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import {
  LayoutDashboard,
  Terminal,
  FileSpreadsheet,
  Bookmark,
  LogOut,
  ChevronLeft,
  ChevronRight,
  Activity,
  Bell,
  Search,
  Settings,
} from "lucide-react";
import { useAppStore } from "@/store/useAppStore";
import { cn } from "@/lib/utils";

// ---------------------------------------------------------------------------
// Nav items
// ---------------------------------------------------------------------------

const NAV_ITEMS = [
  { href: "/overview",  label: "Nerve Center",     icon: LayoutDashboard, id: "overview",  desc: "Portfolio metrics" },
  { href: "/terminal",  label: "Domain Terminal",   icon: Terminal,        id: "terminal",  desc: "Valuation engine" },
  { href: "/auditor",   label: "Portfolio Auditor", icon: FileSpreadsheet, id: "auditor",   desc: "Bulk CSV analysis" },
  { href: "/watchlist", label: "Watchlist",          icon: Bookmark,        id: "watchlist", desc: "Tracked assets"   },
];

// ---------------------------------------------------------------------------
// Sidebar
// ---------------------------------------------------------------------------

function Sidebar() {
  const pathname = usePathname();
  const { sidebarCollapsed, toggleSidebar, userProfile, logout, watchlist } = useAppStore();
  const router = useRouter();

  function handleLogout() {
    logout();
    router.push("/login");
  }

  return (
    <motion.aside
      animate={{ width: sidebarCollapsed ? 64 : 232 }}
      transition={{ duration: 0.22, ease: [0.4, 0, 0.2, 1] }}
      className="relative z-20 flex h-full flex-col bg-zinc-950 border-r border-zinc-800/50 overflow-hidden shrink-0"
    >
      {/* ── Brand strip ── */}
      <div className={cn(
        "flex h-14 items-center border-b border-zinc-800/50 shrink-0 overflow-hidden",
        sidebarCollapsed ? "justify-center px-0" : "px-4 gap-3"
      )}>
        <Link href="/overview" className="flex items-center gap-3 min-w-0 group">
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
                key="brand-text"
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

        {/* Collapse toggle — only show when expanded */}
        <AnimatePresence initial={false}>
          {!sidebarCollapsed && (
            <motion.button
              key="collapse-btn"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.15 }}
              id="sidebar-toggle"
              onClick={toggleSidebar}
              title="Collapse sidebar"
              className="ml-auto flex h-6 w-6 shrink-0 items-center justify-center rounded-md text-zinc-700 hover:bg-zinc-800 hover:text-zinc-400 transition-all"
            >
              <ChevronLeft className="h-3.5 w-3.5" strokeWidth={2} />
            </motion.button>
          )}
        </AnimatePresence>
      </div>

      {/* ── Navigation ── */}
      <nav className="flex flex-col gap-0.5 p-2 flex-1 overflow-y-auto overflow-x-hidden mt-1">

        {/* Section label */}
        <AnimatePresence initial={false}>
          {!sidebarCollapsed && (
            <motion.p
              key="nav-label"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.15 }}
              className="px-2 pb-1.5 pt-0.5 font-mono text-[9px] font-semibold uppercase tracking-[0.18em] text-zinc-700"
            >
              Navigation
            </motion.p>
          )}
        </AnimatePresence>

        {NAV_ITEMS.map((item) => {
          const Icon = item.icon;
          const isActive = pathname === item.href || pathname.startsWith(item.href + "/");

          return (
            <Link
              key={item.href}
              href={item.href}
              id={`nav-${item.id}`}
              title={sidebarCollapsed ? item.label : undefined}
              className={cn(
                "relative flex items-center rounded-lg transition-all duration-150 group",
                sidebarCollapsed ? "h-10 w-10 mx-auto justify-center" : "gap-3 px-3 py-2.5",
                isActive
                  ? "bg-blue-500/10 text-blue-400"
                  : "text-zinc-500 hover:bg-zinc-800/60 hover:text-zinc-200"
              )}
            >
              {/* Active bar */}
              {isActive && (
                <span className="absolute left-0 top-1/2 -translate-y-1/2 h-4 w-0.5 rounded-r-full bg-blue-400" />
              )}

              <Icon
                className={cn(
                  "shrink-0 transition-colors",
                  sidebarCollapsed ? "h-[18px] w-[18px]" : "h-4 w-4",
                  isActive ? "text-blue-400" : "group-hover:text-zinc-200"
                )}
                strokeWidth={isActive ? 2 : 1.5}
              />

              <AnimatePresence initial={false}>
                {!sidebarCollapsed && (
                  <motion.div
                    key={`label-${item.id}`}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 0.15 }}
                    className="min-w-0 flex-1"
                  >
                    <p className={cn(
                      "font-mono text-xs font-medium leading-none",
                      isActive ? "text-blue-400" : "text-zinc-300 group-hover:text-white"
                    )}>
                      {item.label}
                      {item.id === "watchlist" && watchlist.length > 0 && (
                        <span className="ml-1.5 inline-flex items-center rounded-full bg-blue-500/15 border border-blue-500/25 px-1.5 py-0.5 font-mono text-[9px] text-blue-400 leading-none">
                          {watchlist.length}
                        </span>
                      )}
                    </p>
                    <p className="font-mono text-[10px] text-zinc-600 mt-0.5 leading-none">{item.desc}</p>
                  </motion.div>
                )}
              </AnimatePresence>
            </Link>
          );
        })}
      </nav>

      {/* ── Bottom section ── */}
      <div className="shrink-0 border-t border-zinc-800/50">

        {/* Settings - only shown when expanded */}
        <AnimatePresence initial={false}>
          {!sidebarCollapsed && (
            <motion.div
              key="settings-row"
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ duration: 0.15 }}
              className="p-2 overflow-hidden"
            >
              <button className="w-full flex items-center gap-3 rounded-lg px-3 py-2 text-zinc-600 hover:bg-zinc-800/50 hover:text-zinc-300 transition-all duration-150">
                <Settings className="h-4 w-4 shrink-0" strokeWidth={1.5} />
                <span className="font-mono text-xs">Settings</span>
              </button>
            </motion.div>
          )}
        </AnimatePresence>

        {/* User card */}
        <div className={cn(
          "p-2",
          sidebarCollapsed ? "flex flex-col items-center gap-1" : ""
        )}>
          <div className={cn(
            "flex items-center gap-2.5 rounded-lg transition-colors",
            sidebarCollapsed ? "" : "px-3 py-2 bg-zinc-900/60 border border-zinc-800/40"
          )}>
            {/* Avatar */}
            <div className="h-7 w-7 shrink-0 flex items-center justify-center rounded-lg bg-gradient-to-br from-blue-500/30 to-cyan-500/20 border border-blue-500/25 font-mono text-[11px] font-bold text-blue-300 uppercase">
              {userProfile?.avatarInitials ?? "?"}
            </div>

            <AnimatePresence initial={false}>
              {!sidebarCollapsed && (
                <motion.div
                  key="user-info"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.15 }}
                  className="min-w-0 flex-1"
                >
                  <p className="font-mono text-[11px] font-semibold text-zinc-200 truncate leading-tight">
                    {userProfile?.name ?? "User"}
                  </p>
                  <p className="font-mono text-[9px] text-zinc-600 uppercase tracking-wider leading-tight mt-0.5 truncate">
                    {userProfile?.role?.replace("_", " ") ?? "analyst"}
                  </p>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* Logout */}
          <button
            id="sidebar-logout"
            onClick={handleLogout}
            title="Sign out"
            className={cn(
              "flex items-center gap-2.5 rounded-lg text-zinc-600 hover:bg-red-500/8 hover:text-red-400 transition-all duration-150 mt-1",
              sidebarCollapsed ? "h-10 w-10 justify-center" : "w-full px-3 py-2"
            )}
          >
            <LogOut className="h-4 w-4 shrink-0" strokeWidth={1.5} />
            <AnimatePresence initial={false}>
              {!sidebarCollapsed && (
                <motion.span
                  key="logout-label"
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

          {/* Expand toggle — shown only when collapsed */}
          <AnimatePresence initial={false}>
            {sidebarCollapsed && (
              <motion.button
                key="expand-btn"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                id="sidebar-toggle-expand"
                onClick={toggleSidebar}
                title="Expand sidebar"
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

// ---------------------------------------------------------------------------
// Top header
// ---------------------------------------------------------------------------

function TopHeader() {
  const { userProfile, watchlist } = useAppStore();

  return (
    <header className="flex h-14 items-center gap-4 border-b border-zinc-800/50 bg-zinc-950/60 backdrop-blur-sm px-5 shrink-0">
      {/* Search */}
      <div className="relative flex-1 max-w-xs">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-zinc-700" strokeWidth={1.5} />
        <input
          type="text"
          placeholder="Search domains..."
          className="w-full rounded-lg border border-zinc-800/80 bg-zinc-900/40 py-1.5 pl-8 pr-3 font-mono text-xs text-zinc-400 placeholder-zinc-700 outline-none transition-all focus:border-zinc-700 focus:bg-zinc-900/80 focus:text-zinc-200"
        />
      </div>

      <div className="flex items-center gap-2 ml-auto">
        {/* Live indicator */}
        <div className="hidden sm:flex items-center gap-1.5 rounded-md border border-zinc-800/80 bg-zinc-900/40 px-2.5 py-1.5">
          <Activity className="h-3 w-3 text-blue-500 animate-pulse-soft" strokeWidth={2} />
          <span className="font-mono text-[10px] text-blue-500 uppercase tracking-widest">Live</span>
        </div>

        {/* Notifications */}
        <button className="relative flex h-8 w-8 items-center justify-center rounded-lg border border-zinc-800/80 bg-zinc-900/40 text-zinc-600 hover:text-zinc-300 hover:border-zinc-700 transition-all">
          <Bell className="h-3.5 w-3.5" strokeWidth={1.5} />
          {watchlist.length > 0 && (
            <span className="absolute -top-1 -right-1 flex h-3.5 w-3.5 items-center justify-center rounded-full bg-blue-500 font-mono text-[8px] font-bold text-white">
              {watchlist.length}
            </span>
          )}
        </button>

        {/* User avatar */}
        <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-blue-500/30 to-cyan-500/20 border border-blue-500/25 font-mono text-xs font-bold text-blue-300 uppercase">
          {userProfile?.avatarInitials ?? "?"}
        </div>
      </div>
    </header>
  );
}

// ---------------------------------------------------------------------------
// Auth guard
// ---------------------------------------------------------------------------

function AuthGuard({ children }: { children: ReactNode }) {
  const { isLoggedIn } = useAppStore();
  const router = useRouter();

  useEffect(() => {
    if (!isLoggedIn) {
      router.replace("/login");
    }
  }, [isLoggedIn, router]);

  if (!isLoggedIn) {
    return (
      <div className="flex h-screen items-center justify-center bg-zinc-950">
        <div className="font-mono text-xs text-zinc-700 animate-pulse">Authenticating...</div>
      </div>
    );
  }

  return <>{children}</>;
}

// ---------------------------------------------------------------------------
// Layout
// ---------------------------------------------------------------------------

export default function DashboardLayout({ children }: { children: ReactNode }) {
  return (
    <AuthGuard>
      <div className="flex h-screen w-full overflow-hidden bg-[#09090b]">
        <Sidebar />
        <div className="flex flex-1 flex-col min-w-0 overflow-hidden">
          <TopHeader />
          <main className="terminal-grid flex-1 overflow-y-auto overflow-x-hidden p-5">
            {children}
          </main>
        </div>
      </div>
    </AuthGuard>
  );
}
