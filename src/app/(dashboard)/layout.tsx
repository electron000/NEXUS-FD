"use client";

import { ReactNode, useEffect, useState } from "react";
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
  Menu,
  X,
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
// Mobile Drawer
// ---------------------------------------------------------------------------

function MobileDrawer({ open, onClose }: { open: boolean; onClose: () => void }) {
  const pathname = usePathname();
  const { sidebarCollapsed, userProfile, logout, watchlist } = useAppStore();
  const router = useRouter();

  function handleLogout() {
    logout();
    router.push("/login");
    onClose();
  }

  return (
    <AnimatePresence>
      {open && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="fixed inset-0 z-40 bg-black/70 backdrop-blur-sm md:hidden"
            onClick={onClose}
          />

          {/* Drawer panel */}
          <motion.aside
            initial={{ x: "-100%" }}
            animate={{ x: 0 }}
            exit={{ x: "-100%" }}
            transition={{ duration: 0.25, ease: [0.4, 0, 0.2, 1] }}
            className="fixed left-0 top-0 bottom-0 z-50 flex w-72 flex-col bg-zinc-950 border-r border-zinc-800/50 md:hidden overflow-y-auto"
          >
            {/* Brand strip */}
            <div className="flex h-14 items-center justify-between border-b border-zinc-800/50 px-4">
              <Link href="/overview" className="flex items-center gap-3 group" onClick={onClose}>
                <div className="shrink-0 flex h-7 w-7 items-center justify-center">
                  <Image src="/nexus.webp" alt="Nexus" width={26} height={26} className="object-contain opacity-90" />
                </div>
                <p className="font-mono text-sm font-bold tracking-[0.18em] text-white uppercase">NEXUS</p>
              </Link>
              <button onClick={onClose} className="flex h-7 w-7 items-center justify-center rounded-md text-zinc-600 hover:bg-zinc-800 hover:text-zinc-300 transition-all">
                <X className="h-4 w-4" />
              </button>
            </div>

            {/* Navigation */}
            <nav className="flex flex-col gap-0.5 p-3 flex-1">
              <p className="px-2 pb-2 pt-1 font-mono text-[9px] font-semibold uppercase tracking-[0.18em] text-zinc-700">Navigation</p>
              {NAV_ITEMS.map((item) => {
                const Icon = item.icon;
                const isActive = pathname === item.href || pathname.startsWith(item.href + "/");
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    onClick={onClose}
                    className={cn(
                      "relative flex items-center gap-3 rounded-lg px-3 py-2.5 transition-all duration-150",
                      isActive ? "bg-blue-500/10 text-blue-400" : "text-zinc-500 hover:bg-zinc-800/60 hover:text-zinc-200"
                    )}
                  >
                    {isActive && <span className="absolute left-0 top-1/2 -translate-y-1/2 h-4 w-0.5 rounded-r-full bg-blue-400" />}
                    <Icon className={cn("h-4 w-4 shrink-0", isActive ? "text-blue-400" : "")} strokeWidth={isActive ? 2 : 1.5} />
                    <div className="min-w-0 flex-1">
                      <p className={cn("font-mono text-xs font-medium leading-none", isActive ? "text-blue-400" : "text-zinc-300")}>
                        {item.label}
                        {item.id === "watchlist" && watchlist.length > 0 && (
                          <span className="ml-1.5 inline-flex items-center rounded-full bg-blue-500/15 border border-blue-500/25 px-1.5 py-0.5 font-mono text-[9px] text-blue-400 leading-none">
                            {watchlist.length}
                          </span>
                        )}
                      </p>
                      <p className="font-mono text-[10px] text-zinc-600 mt-0.5 leading-none">{item.desc}</p>
                    </div>
                  </Link>
                );
              })}
            </nav>

            {/* Bottom section */}
            <div className="shrink-0 border-t border-zinc-800/50 p-3">
              <div className="flex items-center gap-2.5 rounded-lg px-3 py-2 bg-zinc-900/60 border border-zinc-800/40 mb-2">
                <div className="h-7 w-7 shrink-0 flex items-center justify-center rounded-lg bg-gradient-to-br from-blue-500/30 to-cyan-500/20 border border-blue-500/25 font-mono text-[11px] font-bold text-blue-300 uppercase">
                  {userProfile?.avatarInitials ?? "?"}
                </div>
                <div className="min-w-0 flex-1">
                  <p className="font-mono text-[11px] font-semibold text-zinc-200 truncate leading-tight">{userProfile?.name ?? "User"}</p>
                  <p className="font-mono text-[9px] text-zinc-600 uppercase tracking-wider leading-tight mt-0.5 truncate">
                    {userProfile?.role?.replace("_", " ") ?? "analyst"}
                  </p>
                </div>
              </div>
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

// ---------------------------------------------------------------------------
// Mobile Bottom Nav
// ---------------------------------------------------------------------------

function MobileBottomNav() {
  const pathname = usePathname();
  return (
    <nav className="fixed bottom-0 left-0 right-0 z-30 flex items-center justify-around border-t border-zinc-800/60 bg-zinc-950/95 backdrop-blur-xl px-2 pb-safe md:hidden">
      {NAV_ITEMS.map((item) => {
        const Icon = item.icon;
        const isActive = pathname === item.href || pathname.startsWith(item.href + "/");
        return (
          <Link
            key={item.href}
            href={item.href}
            className={cn(
              "relative flex flex-col items-center gap-1 px-3 py-2.5 rounded-lg transition-all min-w-0",
              isActive ? "text-blue-400" : "text-zinc-600 hover:text-zinc-300"
            )}
          >
            <Icon className="h-5 w-5 shrink-0" strokeWidth={isActive ? 2 : 1.5} />
            <span className={cn("font-mono text-[9px] uppercase tracking-wide truncate", isActive ? "text-blue-400" : "text-zinc-700")}>
              {item.id === "overview" ? "Overview" : item.id === "terminal" ? "Terminal" : item.id === "auditor" ? "Auditor" : "Watch"}
            </span>
            {isActive && <span className="absolute bottom-0 left-1/2 -translate-x-1/2 h-0.5 w-4 rounded-full bg-blue-400" />}
          </Link>
        );
      })}
    </nav>
  );
}

// ---------------------------------------------------------------------------
// Sidebar (Desktop only)
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
      className="relative z-20 hidden md:flex h-full flex-col bg-zinc-950 border-r border-zinc-800/50 overflow-hidden shrink-0"
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

function TopHeader({ onMenuClick }: { onMenuClick: () => void }) {
  const { userProfile, watchlist } = useAppStore();

  return (
    <header className="flex h-14 items-center gap-3 border-b border-zinc-800/50 bg-zinc-950/60 backdrop-blur-sm px-4 shrink-0">
      {/* Mobile menu button */}
      <button
        onClick={onMenuClick}
        className="flex h-8 w-8 items-center justify-center rounded-lg border border-zinc-800/80 bg-zinc-900/40 text-zinc-500 hover:text-zinc-300 hover:border-zinc-700 transition-all md:hidden"
        aria-label="Open menu"
      >
        <Menu className="h-4 w-4" />
      </button>

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
  const [mobileDrawerOpen, setMobileDrawerOpen] = useState(false);

  return (
    <AuthGuard>
      <div className="flex h-screen w-full overflow-hidden bg-[#09090b]">
        {/* Desktop sidebar */}
        <Sidebar />

        {/* Mobile drawer */}
        <MobileDrawer open={mobileDrawerOpen} onClose={() => setMobileDrawerOpen(false)} />

        <div className="flex flex-1 flex-col min-w-0 overflow-hidden">
          <TopHeader onMenuClick={() => setMobileDrawerOpen(true)} />
          {/* Add pb-16 on mobile to clear the bottom nav bar */}
          <main className="terminal-grid flex-1 overflow-y-auto overflow-x-hidden p-4 md:p-5 pb-20 md:pb-5">
            {children}
          </main>
        </div>
      </div>

      {/* Mobile bottom navigation */}
      <MobileBottomNav />
    </AuthGuard>
  );
}
