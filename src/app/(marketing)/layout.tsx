"use client";

import { ReactNode, useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Globe,
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
            <div className="flex flex-col gap-4 px-6 py-5">
              {/* Section links */}
              {[
                { label: "Features", href: "#features" },
              ].map((item) => (
                <a
                  key={item.label}
                  href={item.href}
                  onClick={() => setMobileOpen(false)}
                  className="font-mono text-sm text-zinc-400 hover:text-white transition-colors"
                >
                  {item.label}
                </a>
              ))}

              {/* Auth CTAs */}
              <div className="flex flex-col gap-2 pt-2 border-t border-zinc-800/50">
                <Link
                  href="/login"
                  onClick={() => setMobileOpen(false)}
                  className="rounded-lg border border-zinc-700/60 px-4 py-2.5 font-mono text-sm text-zinc-300 text-center transition-colors hover:bg-zinc-800/50 hover:text-white"
                >
                  Sign In
                </Link>
                <Link
                  href="/register"
                  onClick={() => setMobileOpen(false)}
                  className="rounded-lg bg-blue-600 px-4 py-2.5 font-mono text-sm text-white text-center transition-colors hover:bg-blue-500"
                >
                  Launch Terminal
                </Link>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.nav>
  );
}

// ─── Floating Sidebar (Desktop) ───────────────────────────────────────────────

// Clean, minimal items — only what's actionable
const SIDEBAR_ITEMS = [
  { id: "features",  label: "Features",        href: "#features",  icon: Sparkles,       type: "anchor" as const  },
  { id: "divider1",  label: "",                 href: "",           icon: Sparkles,       type: "divider" as const },
  { id: "overview",  label: "Dashboard",        href: "/overview",  icon: LayoutDashboard,type: "link" as const    },
  { id: "terminal",  label: "Domain Terminal",  href: "/terminal",  icon: Terminal,       type: "link" as const    },
  { id: "divider2",  label: "",                 href: "",           icon: Sparkles,       type: "divider" as const },
  { id: "login",     label: "Sign In",          href: "/login",     icon: LogIn,          type: "link" as const    },
  { id: "register",  label: "Create Account",   href: "/register",  icon: UserPlus,       type: "link" as const    },
];

type SidebarItem = typeof SIDEBAR_ITEMS[number];

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
          <Icon className="h-[18px] w-[18px]" strokeWidth={1.5} />
        </a>
      ) : (
        <Link href={item.href} className={cls}>
          <Icon className="h-[18px] w-[18px]" strokeWidth={1.5} />
        </Link>
      )}
    </Tooltip>
  );
}

function FloatingSideNav() {
  return (
    <motion.nav
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.5, delay: 0.3, ease: [0.22, 1, 0.36, 1] }}
      className="fixed right-5 top-1/2 z-50 hidden -translate-y-1/2 md:flex flex-col"
    >
      {/* Glow backdrop */}
      <div className="absolute inset-0 -inset-2 rounded-2xl bg-blue-500/3 blur-xl pointer-events-none" />

      <div className="relative flex flex-col gap-1.5 rounded-2xl border border-zinc-800/70 bg-black/70 p-1.5 backdrop-blur-2xl shadow-[0_0_40px_-10px_rgba(0,0,0,0.8)]">
        {SIDEBAR_ITEMS.map((item, i) => {
          if (item.type === "divider") {
            return <div key={`div-${i}`} className="my-1 h-px bg-zinc-800/80 mx-1" />;
          }
          return (
            <motion.div
              key={item.id}
              initial={{ opacity: 0, x: 12 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: i * 0.06 + 0.35, duration: 0.3 }}
            >
              <SidebarButton item={item} />
            </motion.div>
          );
        })}
      </div>
    </motion.nav>
  );
}

// ─── Footer ──────────────────────────────────────────────────────────────────

function Footer() {
  const links = {
    Product: ["Features", "Pricing", "Changelog", "Roadmap"],
    Legal:   ["Terms of Service", "Privacy Policy", "Security", "Compliance"],
    Socials: ["Twitter / X", "LinkedIn", "GitHub", "Discord"],
  };

  return (
    <footer className="border-t border-zinc-800/60 bg-zinc-950 px-6 pb-10 pt-16">
      <div className="mx-auto max-w-6xl">
        <div className="mb-12 grid grid-cols-2 gap-10 sm:grid-cols-4">
          <div className="col-span-2 sm:col-span-1">
            <div className="mb-4 flex items-center gap-2.5">
              <Image src="/nexus.webp" alt="Nexus Logo" width={50} height={50} className="object-contain" />
              <span className="font-mono text-base font-bold uppercase tracking-[0.18em] text-white">NEXUS</span>
            </div>
            <p className="text-sm leading-relaxed text-zinc-600">
              Institutional-grade domain intelligence for serious investors.
            </p>
          </div>

          {Object.entries(links).map(([category, items]) => (
            <div key={category}>
              <h4 className="mb-4 font-mono text-[10px] uppercase tracking-[0.2em] text-zinc-500">{category}</h4>
              <ul className="space-y-2.5">
                {items.map((item) => (
                  <li key={item}>
                    <a href="#" className="text-sm text-zinc-600 transition-colors duration-200 hover:text-zinc-400">
                      {item}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <div className="flex flex-col items-start justify-between gap-4 border-t border-zinc-800/50 pt-8 sm:flex-row sm:items-center">
          <p className="font-mono text-xs text-zinc-700">
            © 2025 Nexus Digital Asset Terminal. All rights reserved.
          </p>
          <div className="flex items-center gap-1.5">
            <Globe className="h-3.5 w-3.5 text-zinc-700" strokeWidth={1.5} />
            <span className="font-mono text-xs text-zinc-700">Global Infrastructure · 99.99% uptime SLA</span>
          </div>
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