"use client";

import { ReactNode, useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Globe,
  Sparkles,
  BarChart3,
  DollarSign,
  Power,
  User,
  Terminal,
  Menu,
  X,
} from "lucide-react";
import Image from "next/image";

// ─── Reusable Components ─────────────────────────────────────────────────────

const Tooltip = ({ text, children }: { text: string; children: ReactNode }) => {
  return (
    <div className="relative group flex items-center">
      {children}
      <div className="absolute right-[calc(100%+16px)] top-1/2 -translate-y-1/2 pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity duration-200 whitespace-nowrap z-100">
        <div className="flex items-center justify-center rounded-md border border-blue-500/50 bg-blue-950/90 px-3 py-1.5 backdrop-blur-xl shadow-[0_0_15px_-3px_rgba(59,130,246,0.3)]">
          <span className="text-[14px] text-white font-normal leading-none tracking-wide">
            {text}
          </span>
        </div>
      </div>
    </div>
  );
};

// ─── Top Navbar (Strictly Mobile Now) ────────────────────────────────────────

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
      // ADDED md:hidden here so it entirely disappears on desktop
      className={`fixed top-0 left-0 right-0 z-40 border-b transition-all duration-300 md:hidden ${
        scrolled
          ? "border-zinc-800/80 bg-black/70 backdrop-blur-2xl"
          : "border-zinc-800/40 bg-black/40 backdrop-blur-xl"
      }`}
    >
      <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-4">
        {/* Logo */}
        <div className="flex items-center gap-2.5">
          <div>
            <Image
              src="/nexus.webp"
              alt="Nexus Logo"
              width={40}
              height={40}
              className="object-contain"
            />
          </div>
          <span className="font-mono text-base font-bold tracking-[0.18em] text-white uppercase">
            NEXUS
          </span>
        </div>

        {/* Mobile Menu Toggle (Removed md:hidden since the whole bar is mobile-only) */}
        <button
          className="text-zinc-400 hover:text-white transition-colors"
          onClick={() => setMobileOpen(!mobileOpen)}
        >
          {mobileOpen ? (
            <X className="h-5 w-5" />
          ) : (
            <Menu className="h-5 w-5" />
          )}
        </button>
      </div>

      {/* Mobile menu dropdown */}
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
              {["Features", "Analytics", "Pricing"].map((item) => (
                <a
                  key={item}
                  href={`#${item.toLowerCase()}`}
                  onClick={() => setMobileOpen(false)}
                  className="font-mono text-sm text-zinc-400 hover:text-white transition-colors"
                >
                  {item}
                </a>
              ))}
              <div className="flex flex-col gap-2 pt-2">
                <button className="rounded-lg border border-zinc-700/60 px-4 py-2 font-mono text-sm text-zinc-300 transition-colors hover:bg-zinc-800/50 hover:text-white">
                  Sign In
                </button>
                <button className="rounded-lg bg-blue-600 px-4 py-2 font-mono text-sm text-white transition-colors hover:bg-blue-500">
                  Launch Terminal
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.nav>
  );
}

// ─── Floating Sidebar (Strictly Desktop) ─────────────────────────────────────

function FloatingSideNav() {
  const [isOpen, setIsOpen] = useState(true);
  const [hoveredItem, setHoveredItem] = useState<string | null>(null);

  const navItems = [
    { id: "features", label: "Features", icon: Sparkles },
    { id: "analytics", label: "Analytics", icon: BarChart3 },
    { id: "pricing", label: "Pricing", icon: DollarSign },
  ];

  return (
    <>
      <AnimatePresence>
        {isOpen && (
          <motion.nav
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.4, ease: "easeInOut" }}
            className="fixed right-6 top-1/2 z-50 hidden -translate-y-1/2 md:block"
          >
            <div className="flex flex-col gap-2 rounded-2xl border border-blue-600/30 bg-black/60 p-2 backdrop-blur-2xl">
              {navItems.map((item, index) => {
                const Icon = item.icon;
                const isHovered = hoveredItem === item.id;

                return (
                  <motion.div
                    key={item.id}
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: 20 }}
                    transition={{ delay: index * 0.08, duration: 0.3 }}
                  >
                    <Tooltip text={item.label}>
                      <a
                        href={`#${item.id}`}
                        onMouseEnter={() => setHoveredItem(item.id)}
                        onMouseLeave={() => setHoveredItem(null)}
                        className={`flex h-11 w-11 items-center justify-center rounded-xl border transition-all duration-300 ${
                          isHovered
                            ? "border-blue-400 bg-blue-500/10 shadow-[0_0_20px_-4px_rgba(59,130,246,0.6)]"
                            : "border-blue-600/40 bg-black/40 hover:border-blue-500/60"
                        }`}
                      >
                        <Icon
                          className={`h-4.5 w-4.5 transition-colors duration-300 ${
                            isHovered ? "text-blue-300" : "text-blue-500"
                          }`}
                          strokeWidth={1.5}
                        />
                      </a>
                    </Tooltip>
                  </motion.div>
                );
              })}

              <motion.div
                initial={{ opacity: 0, scaleX: 0 }}
                animate={{ opacity: 1, scaleX: 1 }}
                exit={{ opacity: 0, scaleX: 0 }}
                transition={{ delay: navItems.length * 0.08, duration: 0.3 }}
                className="my-1 h-px bg-zinc-700/50"
              />

              <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 20 }}
                transition={{
                  delay: (navItems.length + 1) * 0.08,
                  duration: 0.3,
                }}
              >
                <Tooltip text="Sign In">
                  <button className="flex h-11 w-11 items-center justify-center rounded-xl border border-zinc-700/40 bg-black/40 backdrop-blur-xl transition-all duration-300 hover:border-zinc-500 hover:bg-zinc-800/40">
                    <User
                      className="h-4.5 w-4.5 text-zinc-400 transition-colors duration-300 hover:text-zinc-200"
                      strokeWidth={1.5}
                    />
                  </button>
                </Tooltip>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 20 }}
                transition={{
                  delay: (navItems.length + 2) * 0.08,
                  duration: 0.3,
                }}
              >
                <Tooltip text="Launch Terminal">
                  <button className="flex h-11 w-11 items-center justify-center rounded-xl border border-blue-600/40 bg-blue-600/20 backdrop-blur-xl transition-all duration-300 hover:border-blue-400 hover:bg-blue-500/30 hover:shadow-[0_0_20px_-4px_rgba(59,130,246,0.6)]">
                    <Terminal
                      className="h-4.5 w-4.5 text-blue-400 transition-colors duration-300 hover:text-blue-200"
                      strokeWidth={1.5}
                    />
                  </button>
                </Tooltip>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, scaleX: 0 }}
                animate={{ opacity: 1, scaleX: 1 }}
                exit={{ opacity: 0, scaleX: 0 }}
                transition={{
                  delay: (navItems.length + 3) * 0.08,
                  duration: 0.3,
                }}
                className="my-1 h-px bg-zinc-700/50"
              />

              <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 20 }}
                transition={{
                  delay: (navItems.length + 4) * 0.08,
                  duration: 0.3,
                }}
              >
                <Tooltip text="Close sidebar">
                  <button
                    onClick={() => setIsOpen(false)}
                    className="flex h-11 w-11 items-center justify-center rounded-xl border border-red-600/40 bg-black/40 backdrop-blur-xl transition-all duration-300 hover:border-red-400 hover:bg-red-500/10 hover:shadow-[0_0_20px_-4px_rgba(239,68,68,0.6)]"
                  >
                    <Power
                      className="h-4.5 w-4.5 text-red-500 transition-colors duration-300 hover:text-red-300"
                      strokeWidth={1.5}
                    />
                  </button>
                </Tooltip>
              </motion.div>
            </div>
          </motion.nav>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {!isOpen && (
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.8 }}
            transition={{ duration: 0.3 }}
            className="fixed right-6 top-1/2 z-50 hidden -translate-y-1/2 md:flex"
          >
            <Tooltip text="Open sidebar">
              <button
                onClick={() => setIsOpen(true)}
                className="flex h-12 w-12 items-center justify-center rounded-2xl border border-green-600/40 bg-black/60 backdrop-blur-2xl transition-all duration-300 hover:border-green-400 hover:bg-green-500/10 hover:shadow-[0_0_20px_-4px_rgba(34,197,94,0.6)]"
              >
                <Power
                  className="h-5 w-5 text-green-500 transition-colors duration-300 hover:text-green-300"
                  strokeWidth={1.5}
                />
              </button>
            </Tooltip>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}

// ─── Footer ──────────────────────────────────────────────────────────────────

function Footer() {
  const links = {
    Product: ["Features", "Pricing", "Changelog", "Roadmap"],
    Legal: ["Terms of Service", "Privacy Policy", "Security", "Compliance"],
    Socials: ["Twitter / X", "LinkedIn", "GitHub", "Discord"],
  };

  return (
    <footer className="border-t border-zinc-800/60 bg-zinc-950 px-6 pb-10 pt-16">
      <div className="mx-auto max-w-6xl">
        <div className="mb-12 grid grid-cols-2 gap-10 sm:grid-cols-4">
          <div className="col-span-2 sm:col-span-1">
            <div className="mb-4 flex items-center gap-2.5">
              <div>
                <Image
                  src="/nexus.webp"
                  alt="Nexus Logo"
                  width={50}
                  height={50}
                  className="object-contain"
                />
              </div>
              <span className="font-mono text-base font-bold uppercase tracking-[0.18em] text-white">
                NEXUS
              </span>
            </div>
            <p className="text-sm leading-relaxed text-zinc-600">
              Institutional-grade domain intelligence for serious investors.
            </p>
          </div>

          {Object.entries(links).map(([category, items]) => (
            <div key={category}>
              <h4 className="mb-4 font-mono text-[10px] uppercase tracking-[0.2em] text-zinc-500">
                {category}
              </h4>
              <ul className="space-y-2.5">
                {items.map((item) => (
                  <li key={item}>
                    <a
                      href="#"
                      className="text-sm text-zinc-600 transition-colors duration-200 hover:text-zinc-400"
                    >
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
            <span className="font-mono text-xs text-zinc-700">
              Global Infrastructure · 99.99% uptime SLA
            </span>
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
      {/* 1. Mobile Top Navbar */}
      <TopNavbar />

      {/* 2. Desktop Quick Actions Floating Sidebar */}
      <FloatingSideNav />

      {/* 3. Main Page Content Injection */}
      {/* Removed pt-[72px] so the page flows completely underneath the floating navbars */}
      <main className="flex flex-1 flex-col">{children}</main>

      {/* 4. Footer */}
      <Footer />
    </div>
  );
}