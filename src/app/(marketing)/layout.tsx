"use client";

import { ReactNode, useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  LayoutDashboard,
  Terminal,
  LogIn,
  UserPlus,
  Menu,
  X,
  Sparkles,
} from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useAppStore } from "@/store/useAppStore";


// ─── Tooltip ─────────────────────────────────────────────────────────────────

const Tooltip = ({ text, children }: { text: string; children: ReactNode }) => (
  <div className="relative group flex items-center">
    {children}
    <div className="absolute right-[calc(100%+14px)] top-1/2 -translate-y-1/2 pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity duration-200 whitespace-nowrap z-100">
      <div className="flex items-center justify-center rounded-lg border border-zinc-700/60 bg-zinc-900/95 px-3 py-1.5 backdrop-blur-xl shadow-lg">
        <span className="text-[12px] text-zinc-200 font-mono leading-none tracking-wide">{text}</span>
      </div>
    </div>
  </div>
);

// ─── Mobile Top Navbar ────────────────────────────────────────────────────────

function TopNavbar() {
  const isLoggedIn = useAppStore((state) => state.isLoggedIn);
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  useEffect(() => {
    const handler = () => setScrolled(window.scrollY > 10);
    window.addEventListener("scroll", handler);
    return () => window.removeEventListener("scroll", handler);
  }, []);

  return (
    <motion.nav
      initial={{ opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, ease: "easeOut" }}
      className={`fixed top-0 left-0 right-0 z-40 border-b transition-all duration-300 md:hidden ${
        scrolled
          ? "border-zinc-800/80 bg-black/70 backdrop-blur-2xl"
          : "border-zinc-800/40 bg-black/40 backdrop-blur-xl"
      }`}
    >
      <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-4">
        <Link href="/" className="flex items-center gap-2.5">
          <Image src="/nexus.webp" alt="Nexus Logo" width={36} height={36} className="object-contain" />
          <span className="font-mono text-base font-bold tracking-[0.18em] text-white uppercase">NEXUS</span>
        </Link>

        <button
          className="text-zinc-400 hover:text-white transition-colors"
          onClick={() => setMobileOpen(!mobileOpen)}
          aria-label="Toggle menu"
        >
          {mobileOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
        </button>
      </div>

      <AnimatePresence>
        {mobileOpen && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.3 }}
            className="overflow-hidden border-t border-zinc-800/50 bg-black/90 backdrop-blur-2xl"
          >
            <div className="flex flex-col gap-3 px-6 py-5">
              {!isLoggedIn ? (
                <>
                  <Link
                    href="/login"
                    onClick={() => setMobileOpen(false)}
                    className="flex items-center gap-3 rounded-xl border border-zinc-800/50 bg-zinc-900/40 px-4 py-3 font-mono text-sm text-zinc-300 transition-all hover:bg-zinc-800/60 hover:text-white"
                  >
                    <LogIn className="h-4 w-4 text-zinc-500" />
                    Sign In
                  </Link>
                  <Link
                    href="/register"
                    onClick={() => setMobileOpen(false)}
                    className="flex items-center gap-3 rounded-xl bg-blue-600/90 px-4 py-3 font-mono text-sm font-medium text-white transition-all hover:bg-blue-500 hover:shadow-[0_0_20px_-5px_rgba(59,130,246,0.5)]"
                  >
                    <UserPlus className="h-4 w-4" />
                    Sign Up
                  </Link>
                </>
              ) : (
                <>
                  <Link
                    href="/overview"
                    onClick={() => setMobileOpen(false)}
                    className="flex items-center gap-3 rounded-xl border border-cyan-500/20 bg-cyan-500/5 px-4 py-3 font-mono text-sm text-cyan-100 transition-all hover:bg-cyan-500/10"
                  >
                    <LayoutDashboard className="h-4 w-4 text-cyan-400" />
                    Dashboard
                  </Link>
                  <Link
                    href="/terminal"
                    onClick={() => setMobileOpen(false)}
                    className="flex items-center gap-3 rounded-xl border border-blue-500/20 bg-blue-500/5 px-4 py-3 font-mono text-sm text-blue-100 transition-all hover:bg-blue-500/10"
                  >
                    <Terminal className="h-4 w-4 text-blue-400" />
                    Domain Terminal
                  </Link>
                </>
              )}

              <a
                href="#features"
                onClick={() => setMobileOpen(false)}
                className="flex items-center gap-3 rounded-xl border border-zinc-800/50 bg-zinc-900/40 px-4 py-3 font-mono text-sm text-zinc-400 transition-all hover:bg-zinc-800/60 hover:text-white"
              >
                <Sparkles className="h-4 w-4 text-zinc-500" />
                Features
              </a>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.nav>
  );
}

// ─── Floating Sidebar (Desktop) ───────────────────────────────────────────────

// Clean, minimal items — only what's actionable
// Dynamic items based on auth state
const getSidebarItems = (isLoggedIn: boolean) => {
  if (!isLoggedIn) {
    return [
      { id: "login",     label: "Sign In",      href: "/login",     icon: LogIn,    type: "link" as const   },
      { id: "register",  label: "Sign Up",      href: "/register",  icon: UserPlus, type: "link" as const   },
      { id: "features",  label: "Features",     href: "#features",  icon: Sparkles, type: "anchor" as const },
    ];
  }
  return [
    { id: "overview",  label: "Dashboard",       href: "/overview",  icon: LayoutDashboard, type: "link" as const   },
    { id: "terminal",  label: "Domain Terminal", href: "/terminal",  icon: Terminal,        type: "link" as const   },
    { id: "features",  label: "Features",        href: "#features",  icon: Sparkles,        type: "anchor" as const },
  ];
};

type SidebarItem = ReturnType<typeof getSidebarItems>[number];

function SidebarButton({ item }: { item: SidebarItem }) {
  const Icon = item.icon;
  const isAction = item.id === "register";
  const isApp = item.id === "overview" || item.id === "terminal";

  const cls = `flex h-10 w-10 items-center justify-center rounded-xl border transition-all duration-200 ${
    isAction
      ? "border-blue-500/50 bg-blue-600/25 text-blue-300 hover:bg-blue-500/35 hover:border-blue-400 hover:shadow-[0_0_18px_-4px_rgba(59,130,246,0.55)]"
      : isApp
      ? "border-cyan-600/30 bg-cyan-500/8 text-cyan-400 hover:border-cyan-400/50 hover:bg-cyan-500/15 hover:shadow-[0_0_16px_-4px_rgba(6,182,212,0.4)]"
      : "border-zinc-700/40 bg-black/30 text-zinc-400 hover:border-zinc-500/60 hover:bg-zinc-800/40 hover:text-zinc-200"
  }`;

  return (
    <Tooltip text={item.label}>
      {item.type === "anchor" ? (
        <a href={item.href} className={cls}>
          <Icon className="h-4.5 w-4.5" strokeWidth={1.5} />
        </a>
      ) : (
        <Link href={item.href} className={cls}>
          <Icon className="h-4.5 w-4.5" strokeWidth={1.5} />
        </Link>
      )}
    </Tooltip>
  );
}

function FloatingSideNav() {
  const isLoggedIn = useAppStore((state) => state.isLoggedIn);
  const items = getSidebarItems(isLoggedIn);

  return (
    <motion.nav
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.5, delay: 0.3, ease: [0.22, 1, 0.36, 1] }}
      className="fixed right-5 top-1/2 z-50 hidden -translate-y-1/2 md:flex flex-col"
    >
      {/* Glow backdrop */}
      <div className="absolute inset-0 rounded-2xl bg-blue-500/3 blur-xl pointer-events-none" />

      <div className="relative flex flex-col gap-1.5 rounded-2xl border border-zinc-800/70 bg-black/70 p-1.5 backdrop-blur-2xl shadow-[0_0_40px_-10px_rgba(0,0,0,0.8)]">
        {items.map((item, i) => (
          <motion.div
            key={item.id}
            initial={{ opacity: 0, x: 12 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: i * 0.06 + 0.35, duration: 0.3 }}
          >
            <SidebarButton item={item} />
          </motion.div>
        ))}
      </div>
    </motion.nav>
  );
}

// ─── Footer ──────────────────────────────────────────────────────────────────

function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="border-t border-zinc-800/60 bg-black px-6 py-8">
      <div className="mx-auto max-w-7xl flex flex-col md:flex-row justify-between items-center gap-6">
        {/* Brand & Copyright */}
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2.5 opacity-80">
            <Image
              src="/nexus.webp"
              alt="Nexus Logo"
              width={24}
              height={24}
              className="object-contain"
            />
            <span className="font-mono text-xs font-bold uppercase tracking-widest text-white">
              NEXUS
            </span>
          </div>
          <span className="font-mono text-[10px] text-zinc-600 uppercase tracking-tight">
            © {currentYear} Digital Asset Terminal
          </span>
        </div>

        {/* Minimal Legal Links */}
        <nav className="flex gap-8">
          {["Terms", "Privacy", "Security"].map((link) => (
            <a
              key={link}
              href="#"
              className="font-mono text-[10px] uppercase tracking-widest text-zinc-500 hover:text-blue-400 transition-colors"
            >
              {link}
            </a>
          ))}
        </nav>

        {/* Infrastructure Status */}
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1.5">
            <div className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse" />
            <span className="font-mono text-[10px] text-zinc-500 uppercase tracking-widest">
              Global Infrastructure
            </span>
          </div>
          <span className="font-mono text-[10px] text-emerald-500/80 uppercase tracking-widest border-l border-zinc-800 pl-3">
            99.99% Uptime SLA
          </span>
        </div>
      </div>
    </footer>
  );
}

// ─── Layout ──────────────────────────────────────────────────────────────────

export default function MarketingLayout({ children }: { children: ReactNode }) {
  return (
    <div className="relative flex min-h-screen flex-col bg-zinc-950 text-zinc-50 selection:bg-zinc-800">
      <TopNavbar />
      <FloatingSideNav />
      <main className="flex flex-1 flex-col">{children}</main>
      <Footer />
    </div>
  );
}