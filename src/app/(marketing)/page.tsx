"use client";

import { useRef, useState } from "react";
import {
  motion,
  useInView,
  AnimatePresence,
  Variants,
  useMotionValue,
  useTransform,
  useSpring,
} from "framer-motion";
import {
  BarChart3,
  Layers,
  TrendingUp,
  GitFork,
  ArrowRight,
  Activity,
  Zap,
  CheckCircle2,
} from "lucide-react";

import { HeroLogo } from "@/components/ui/HeroLogo";

// ─── Utility ────────────────────────────────────────────────────────────────

const fadeUp: Variants = {
  hidden: { opacity: 0, y: 22 },
  visible: (delay: number = 0) => ({
    opacity: 1,
    y: 0,
    transition: { duration: 0.62, ease: [0.22, 1, 0.36, 1], delay },
  }),
};

function useReveal() {
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { once: true, margin: "-60px" });
  return { ref, inView };
}

// ─── Fake Sparkline ──────────────────────────────────────────────────────────

function Sparkline({
  color = "#3b82f6",
  opacity = 0.7,
  offset = 0,
}: {
  color?: string;
  opacity?: number;
  offset?: number;
}) {
  const points = [
    0, 12, 8, 20, 14, 30, 22, 18, 28, 35, 24, 40, 30, 38, 45, 34, 50, 42, 55,
    38, 60, 48,
  ]
    .map((y, x) => `${x * 10},${60 - y + offset}`)
    .join(" ");
  return (
    <svg
      viewBox="0 0 210 70"
      className="w-full h-full"
      preserveAspectRatio="none"
      style={{ opacity }}
    >
      <defs>
        <linearGradient id={`grad-${offset}`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor={color} stopOpacity="0.25" />
          <stop offset="100%" stopColor={color} stopOpacity="0" />
        </linearGradient>
      </defs>
      <polyline
        points={points}
        fill="none"
        stroke={color}
        strokeWidth="1.5"
        strokeLinejoin="round"
        strokeLinecap="round"
      />
      <polyline
        points={`0,70 ${points} 210,70`}
        fill={`url(#grad-${offset})`}
        stroke="none"
      />
    </svg>
  );
}

// ─── Terminal Mockup ─────────────────────────────────────────────────────────

function TerminalMockup() {
  const rows = [
    { label: "DOGE.com", val: "$4,200,000", delta: "+12.4%", up: true },
    { label: "AAPL.io", val: "$810,000", delta: "+3.1%", up: true },
    { label: "META.xyz", val: "$390,000", delta: "-1.7%", up: false },
    { label: "TSLA.ai", val: "$2,150,000", delta: "+7.8%", up: true },
    { label: "AMZN.co", val: "$6,750,000", delta: "+0.4%", up: true },
  ];

  return (
    <motion.div
      initial={{ opacity: 0, y: 40 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.9, delay: 0.5, ease: [0.22, 1, 0.36, 1] }}
      className="relative mx-auto mt-12 md:mt-20 max-w-5xl rounded-2xl border border-zinc-800/60 bg-zinc-950/80 shadow-[0_0_80px_-10px_rgba(59,130,246,0.25)] backdrop-blur-xl overflow-hidden text-left"
    >
      <div className="flex items-center gap-2 border-b border-zinc-800/60 px-4 md:px-5 py-3.5 overflow-hidden">
        <div className="flex shrink-0 gap-2">
          <span className="h-3 w-3 rounded-full bg-zinc-700" />
          <span className="h-3 w-3 rounded-full bg-zinc-700" />
          <span className="h-3 w-3 rounded-full bg-zinc-700" />
        </div>
        <span className="ml-2 md:ml-4 truncate font-mono text-[10px] md:text-xs text-zinc-500 tracking-widest uppercase">
          nexus://terminal — asset_matrix.live
        </span>
        <span className="ml-auto flex shrink-0 items-center gap-1.5">
          <span className="h-1.5 w-1.5 rounded-full bg-blue-400 animate-pulse" />
          <span className="font-mono text-[10px] text-blue-400 tracking-widest uppercase hidden sm:inline-block">
            live
          </span>
        </span>
      </div>

      {/* Changed to stack on mobile, grid on desktop */}
      <div className="grid grid-cols-1 lg:grid-cols-3 divide-y lg:divide-y-0 lg:divide-x divide-zinc-800/40">
        <div className="col-span-1 lg:col-span-2 p-4 md:p-5 flex flex-col min-w-0">
          <div className="mb-4 flex flex-wrap items-center justify-between gap-2">
            <span className="font-mono text-[11px] text-zinc-500 tracking-widest uppercase">
              Asset Monitor
            </span>
            <span className="font-mono text-[11px] text-zinc-600 tracking-widest">
              05:24:17 UTC
            </span>
          </div>
          {/* Horizontal scroll wrapper for small screens */}
          <div className="w-full overflow-x-auto pb-2 -mx-4 px-4 md:mx-0 md:px-0">
            <table className="w-full min-w-120">
              <thead>
                <tr className="border-b border-zinc-800/50">
                  {["Domain", "Est. Value", "24h Δ", "Trend"].map((h) => (
                    <th
                      key={h}
                      className="pb-2 text-left font-mono text-[10px] text-zinc-600 tracking-widest uppercase whitespace-nowrap"
                    >
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {rows.map((r, i) => (
                  <tr
                    key={r.label}
                    className="border-b border-zinc-800/30 last:border-0"
                  >
                    <td className="py-2.5 pr-4 font-mono text-sm text-white">
                      {r.label}
                    </td>
                    <td className="py-2.5 pr-4 font-mono text-sm text-zinc-300">
                      {r.val}
                    </td>
                    <td
                      className={`py-2.5 pr-4 font-mono text-sm ${r.up ? "text-emerald-400" : "text-red-400"}`}
                    >
                      {r.delta}
                    </td>
                    <td className="py-2.5 w-20">
                      <div className="h-6 w-16">
                        <Sparkline
                          color={r.up ? "#34d399" : "#f87171"}
                          opacity={0.8}
                          offset={i * 3}
                        />
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Side panel scales properly and stacks below table on mobile */}
        <div className="p-4 md:p-5 flex flex-col gap-4 sm:flex-row lg:flex-col sm:justify-between lg:justify-start">
          <div className="flex-1">
            <p className="font-mono text-[10px] text-zinc-600 tracking-widest uppercase mb-1">
              Portfolio Value
            </p>
            <p className="font-mono text-2xl text-white font-bold">$14.3M</p>
            <p className="font-mono text-xs text-emerald-400 mt-0.5">
              ↑ 8.4% this week
            </p>
          </div>

          <div className="h-px w-full bg-zinc-800/60 sm:hidden lg:block" />
          <div className="hidden sm:block lg:hidden w-px h-auto bg-zinc-800/60 mx-2" />

          <div className="flex-1">
            <p className="font-mono text-[10px] text-zinc-600 tracking-widest uppercase mb-2">
              Activity Feed
            </p>
            <div className="space-y-2">
              {[
                { event: "Valuation updated", asset: "DOGE.com", t: "2s" },
                { event: "Alert triggered", asset: "META.xyz", t: "14s" },
                { event: "New bid detected", asset: "TSLA.ai", t: "1m" },
              ].map((e) => (
                <div key={e.asset} className="flex items-start gap-2">
                  <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-blue-500" />
                  <div>
                <p className="font-mono text-[10px] text-zinc-400 truncate max-w-30 md:max-w-none">
                      {e.event}
                    </p>
                    <p className="font-mono text-[10px] text-zinc-600">
                      {e.asset} · {e.t} ago
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="h-px w-full bg-zinc-800/60 sm:hidden lg:block" />
          <div className="hidden sm:block lg:hidden w-px h-auto bg-zinc-800/60 mx-2" />

          <div className="flex-1">
            <p className="font-mono text-[10px] text-zinc-600 tracking-widest uppercase mb-2">
              Query Load
            </p>
            <div className="h-12 md:h-16">
              <Sparkline color="#3b82f6" opacity={1} />
            </div>
            <p className="font-mono text-[10px] text-blue-500 mt-1">
              9,847 req/s
            </p>
          </div>
        </div>
      </div>
    </motion.div>
  );
}
// ─── Feature Card ────────────────────────────────────────────────────────────

function FeatureCard({
  icon: Icon,
  title,
  desc,
  tag,
  span = "normal",
  delay = 0,
}: {
  icon: React.ElementType;
  title: string;
  desc: string;
  tag: string;
  span?: "normal" | "wide" | "tall";
  delay?: number;
}) {
  const cardRef = useRef<HTMLDivElement>(null);
  const inView = useInView(cardRef, { once: true, margin: "-60px" });

  const rawX = useMotionValue(0);
  const rawY = useMotionValue(0);
  const springCfg = { stiffness: 160, damping: 24, mass: 0.5 };
  const x = useSpring(rawX, springCfg);
  const y = useSpring(rawY, springCfg);

  const glowOpacity = useSpring(0, { stiffness: 120, damping: 18 });
  const borderOpacity = useSpring(0, { stiffness: 120, damping: 18 });

  // Keeps the subtle light following the mouse cursor
  const specular = useTransform([x, y], ([lx, ly]) => {
    const cx = 50 + (lx as number) * 60;
    const cy = 50 + (ly as number) * 60;
    return `radial-gradient(circle at ${cx}% ${cy}%, rgba(59,130,246,0.06) 0%, transparent 65%)`;
  });

  function onMouseMove(e: React.MouseEvent<HTMLDivElement>) {
    const el = cardRef.current;
    if (!el) return;
    const r = el.getBoundingClientRect();
    rawX.set((e.clientX - r.left) / r.width - 0.5);
    rawY.set((e.clientY - r.top) / r.height - 0.5);
    glowOpacity.set(1);
    borderOpacity.set(1);
  }

  function onMouseLeave() {
    rawX.set(0);
    rawY.set(0);
    glowOpacity.set(0);
    borderOpacity.set(0);
  }

  const spanClass =
    span === "wide" ? "lg:col-span-2" : span === "tall" ? "lg:row-span-2" : "";

  return (
    <motion.div
      ref={cardRef}
      variants={fadeUp}
      custom={delay}
      initial="hidden"
      animate={inView ? "visible" : "hidden"}
      onMouseMove={onMouseMove}
      onMouseLeave={onMouseLeave}
      // Added a subtle background color transition for a static hover effect
      className={`relative rounded-2xl border border-zinc-800/50 bg-zinc-900/30 p-6 md:p-7 overflow-hidden cursor-default transition-colors duration-300 hover:bg-zinc-900/40 ${spanClass}`}
    >
      <motion.div
        style={{ opacity: borderOpacity }}
        className="pointer-events-none absolute inset-0 rounded-2xl border border-blue-500/25 hidden md:block"
      />
      <motion.div
        style={{ opacity: glowOpacity }}
        className="pointer-events-none absolute -top-16 -left-16 h-56 w-56 rounded-full bg-blue-600/6 blur-3xl hidden md:block"
      />
      <motion.div
        style={{ background: specular }}
        className="pointer-events-none absolute inset-0 z-10 rounded-2xl hidden md:block"
      />

      <div className="relative z-20">
        <div className="mb-4 md:mb-5 inline-flex items-center gap-2 rounded-lg border border-blue-500/20 bg-blue-500/8 px-3 py-1.5">
          <Icon className="h-4 w-4 text-blue-400" strokeWidth={1.5} />
          <span className="font-mono text-[10px] text-blue-400 tracking-widest uppercase">
            {tag}
          </span>
        </div>
        <h3 className="mb-2 font-mono text-base md:text-lg font-semibold text-white tracking-tight">
          {title}
        </h3>
        <p className="text-sm leading-relaxed text-zinc-500">{desc}</p>
      </div>
    </motion.div>
  );
}

// ─── Hero ─────────────────────────────────────────────────────────────────────

function Hero() {
  const [isLogoHovered, setIsLogoHovered] = useState(false);

  return (
    // Changed pt-12 to pt-28. 
    // This pushes the content down to clear the navbar, but lets the background stretch to the very top.
    <section className="relative min-h-dvh overflow-hidden bg-black pt-28 md:pt-36 pb-20">
      <div
        className="pointer-events-none absolute inset-0 opacity-[0.025]"
        style={{
          backgroundImage:
            "linear-gradient(rgba(59,130,246,0.8) 1px, transparent 1px), linear-gradient(90deg, rgba(59,130,246,0.8) 1px, transparent 1px)",
          backgroundSize: "80px 80px",
        }}
      />
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_80%_60%_at_50%_-10%,rgba(59,130,246,0.08),transparent)]" />

      {/* Scaled down logo slightly for mobile if applicable in HeroLogo component */}
      <div
        className="mx-auto w-fit scale-75 md:scale-100 origin-top mb-4 md:mb-0"
        onMouseEnter={() => setIsLogoHovered(true)}
        onMouseLeave={() => setIsLogoHovered(false)}
      >
        <HeroLogo />
      </div>

      <div className="relative mx-auto max-w-5xl px-4 sm:px-6 text-center">
        <motion.div
          variants={fadeUp}
          custom={0}
          initial="hidden"
          animate="visible"
          className="mb-6 md:mb-8 flex flex-col items-center justify-center"
        >
          {/* Fluid typography: text-4xl on mobile, text-5xl on tablet/desktop */}
          <span
            className="inline-block font-mono text-4xl md:text-6xl font-extrabold tracking-[0.2em] md:tracking-[0.3em] bg-clip-text text-transparent animate-gradient-x"
            style={{
              backgroundImage:
                "linear-gradient(to right, #93c5fd, #3b82f6, #1e40af, #3b82f6, #93c5fd)",
              backgroundSize: "200% auto",
              backgroundClip: "text",
              WebkitBackgroundClip: "text",
            }}
          >
            NEXUS
          </span>
          <span
            className={`mt-2 font-mono text-sm md:text-[22px] tracking-widest uppercase transition-colors duration-300 ${
              isLogoHovered ? "text-blue-300" : "text-blue-500"
            }`}
          >
            {isLogoHovered ? "System Active" : "Digital Asset Terminal"}
          </span>
        </motion.div>

        <motion.p
          variants={fadeUp}
          custom={0.2}
          initial="hidden"
          animate="visible"
          className="mx-auto mb-8 md:mb-10 max-w-2xl text-sm md:text-lg leading-relaxed text-zinc-500"
        >
          The institutional-grade terminal for domain investors and brand
          managers. Real-time valuations, bulk audits, TCO modeling, and
          arbitrage signals — unified in a single command surface.
        </motion.p>

        <motion.div
          variants={fadeUp}
          custom={0.3}
          initial="hidden"
          animate="visible"
          className="flex flex-col sm:flex-row items-center justify-center gap-3 md:gap-4"
        >
          <button className="w-full sm:w-auto group flex justify-center items-center gap-2 rounded-xl bg-blue-600 px-6 py-3.5 font-mono text-sm font-semibold text-white shadow-[0_0_30px_-5px_rgba(59,130,246,0.4)] transition-all duration-300 hover:bg-blue-500 hover:shadow-[0_0_40px_-5px_rgba(59,130,246,0.55)]">
            Start Auditing
            <ArrowRight className="h-4 w-4 transition-transform duration-200 group-hover:translate-x-0.5" />
          </button>
          <button className="w-full sm:w-auto flex justify-center items-center gap-2 rounded-xl border border-zinc-700/60 px-6 py-3.5 font-mono text-sm font-semibold text-zinc-300 transition-all duration-200 hover:border-zinc-500 hover:text-white">
            <Activity className="h-4 w-4 text-blue-500" />
            View Live Demo
          </button>
        </motion.div>

        <TerminalMockup />
      </div>
    </section>
  );
}

// ─── Stats Strip ─────────────────────────────────────────────────────────────

function StatsStrip() {
  const { ref, inView } = useReveal();

  const stats = [
    { value: "$1B+", label: "Assets Tracked", icon: BarChart3 },
    { value: "10ms", label: "Query Latency", icon: Zap },
    { value: "10k+", label: "Queries / sec", icon: Activity },
  ];

  return (
    <section className="relative border-y border-zinc-800/50 bg-zinc-950">
      <div
        className="pointer-events-none absolute inset-0 opacity-[0.03]"
        style={{
          backgroundImage:
            "repeating-linear-gradient(90deg, rgba(59,130,246,1) 0px, rgba(59,130,246,1) 1px, transparent 1px, transparent 160px)",
        }}
      />
      <div
        ref={ref}
        className="relative mx-auto grid max-w-5xl grid-cols-1 divide-y divide-zinc-800/40 sm:grid-cols-3 sm:divide-x sm:divide-y-0"
      >
        {stats.map(({ value, label, icon: Icon }, i) => (
          <motion.div
            key={label}
            variants={fadeUp}
            custom={i * 0.1}
            initial="hidden"
            animate={inView ? "visible" : "hidden"}
            className="flex flex-col items-center justify-center gap-1 px-6 py-8 md:px-10 md:py-12"
          >
            <div className="mb-2 flex items-center gap-2">
              <Icon className="h-4 w-4 text-blue-500" strokeWidth={1.5} />
              <span className="font-mono text-[10px] text-blue-500 tracking-widest uppercase">
                {label}
              </span>
            </div>
            <span className="font-mono text-3xl md:text-4xl font-bold text-white tracking-tight">
              {value}
            </span>
          </motion.div>
        ))}
      </div>
    </section>
  );
}

// ─── Features (fixed bento grid) ─────────────────────────────────────────────

function Features() {
  const { ref, inView } = useReveal();

  return (
    <section id="features" className="relative bg-black py-20 md:py-28">
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_60%_40%_at_50%_50%,rgba(59,130,246,0.04),transparent)]" />

      <div className="mx-auto max-w-6xl px-4 md:px-6">
        <motion.div
          ref={ref}
          variants={fadeUp}
          custom={0}
          initial="hidden"
          animate={inView ? "visible" : "hidden"}
          className="mb-12 md:mb-16 text-center"
        >
          <span className="mb-3 md:mb-4 inline-block font-mono text-xs text-blue-500 tracking-[0.2em] uppercase">
            Core Capabilities
          </span>
          <h2 className="font-mono text-3xl md:text-4xl lg:text-5xl font-bold text-white tracking-tight">
            Everything you need.
            <br className="hidden sm:block" />
            <span className="text-zinc-500 sm:ml-2">
              Nothing you don&apos;t.
            </span>
          </h2>
        </motion.div>

        <div
          className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3"
          style={{ perspective: "1200px" }}
        >
          <FeatureCard
            icon={BarChart3}
            title="Valuation Core"
            desc="Proprietary ML pricing engine trained on 20M+ historical domain transactions. Sub-second valuations with 94.7% accuracy versus realized sale prices."
            tag="Pricing Engine"
            delay={0}
          />

          <FeatureCard
            icon={Layers}
            title="Bulk Auditor"
            desc="Process thousands of assets in parallel. Extract WHOIS, DNS, SEO metrics, backlink authority, and renewal schedules in a single batch operation."
            tag="Bulk Ops"
            delay={0.08}
          />

          <FeatureCard
            icon={GitFork}
            title="Arbitrage Tracking"
            desc="Continuously scans registrars, aftermarkets, and auctions to surface underpriced assets matching your thesis. First-mover alerts delivered in under 200ms. Advanced signal processing with configurable filters across 40+ marketplaces gives you a decisive edge."
            tag="Signal Layer"
            span="tall"
            delay={0.12}
          />

          <FeatureCard
            icon={TrendingUp}
            title="TCO Projections"
            desc="Model the total cost of ownership across multi-year hold periods. Factor in renewal fees, monetization yield, and opportunity cost to find your optimal exit window."
            tag="Forecasting"
            span="wide"
            delay={0.18}
          />
        </div>
      </div>
    </section>
  );
}

// ─── CTA Card (upgraded) ─────────────────────────────────────────────────────

function CTACard() {
  const { ref, inView } = useReveal();
  const [email, setEmail] = useState("");
  const [submitted, setSubmitted] = useState(false);

  function handleSubmit() {
    if (!email.trim()) return;
    setSubmitted(true);
  }

  const perks = [
    "No credit card required",
    "First access before public launch",
    "Cancel anytime",
  ];

  return (
    <section className="relative bg-black py-20 md:py-28 px-4 md:px-6 overflow-hidden">
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_50%_40%_at_50%_80%,rgba(59,130,246,0.07),transparent)]" />

      <motion.div
        ref={ref}
        variants={fadeUp}
        custom={0}
        initial="hidden"
        animate={inView ? "visible" : "hidden"}
        className="relative mx-auto max-w-4xl overflow-hidden rounded-3xl border border-zinc-800/70 bg-zinc-950 shadow-[0_0_100px_-12px_rgba(59,130,246,0.25),0_0_240px_-40px_rgba(59,130,246,0.14)]"
      >
        <div className="h-px w-full bg-linear-to-r from-transparent via-blue-500/60 to-transparent" />
        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_80%_55%_at_50%_-5%,rgba(59,130,246,0.09),transparent)]" />

        <div className="absolute top-0 left-0 h-20 w-px bg-linear-to-b from-blue-500/60 to-transparent" />
        <div className="absolute top-0 left-0 h-px w-20 bg-linear-to-r from-blue-500/60 to-transparent" />
        <div className="absolute bottom-0 right-0 h-20 w-px bg-linear-to-t from-blue-500/60 to-transparent" />
        <div className="absolute bottom-0 right-0 h-px w-20 bg-linear-to-l from-blue-500/60 to-transparent" />

        <div
          className="pointer-events-none absolute inset-0 opacity-[0.018]"
          style={{
            backgroundImage:
              "linear-gradient(rgba(59,130,246,1) 1px, transparent 1px), linear-gradient(90deg, rgba(59,130,246,1) 1px, transparent 1px)",
            backgroundSize: "50px 50px",
          }}
        />

        <div className="relative z-10 px-6 py-12 text-center sm:px-16 sm:py-20">
          <div>
          </div>
          <h2 className="mb-3 md:mb-4 font-mono text-3xl font-bold tracking-tight text-white sm:text-4xl md:text-5xl">
            Ready to dominate
            <br />
            <span
              style={{
                background:
                  "linear-gradient(135deg, #ffffff 0%, #93c5fd 55%, #3b82f6 100%)",
                WebkitBackgroundClip: "text",
                WebkitTextFillColor: "transparent",
                backgroundClip: "text",
              }}
            >
              the aftermarket?
            </span>
          </h2>

          <p className="mx-auto mb-8 md:mb-10 max-w-md text-sm md:text-base leading-relaxed text-zinc-500">
            Join 2,400+ professionals already on the waitlist. Get first access
            to the terminal before public launch.
          </p>

          <AnimatePresence mode="wait">
            {!submitted ? (
              <motion.div
                key="form"
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -8 }}
                transition={{ duration: 0.3 }}
                className="flex flex-col items-center gap-3 sm:flex-row sm:justify-center"
              >
                <div className="relative w-full max-w-sm sm:min-w-70">
                  <input
                    type="email"
                    placeholder="your@company.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    onKeyDown={(e) => e.key === "Enter" && handleSubmit()}
                    className="w-full rounded-xl border border-zinc-700/60 bg-zinc-900/80 px-4 py-3.5 font-mono text-sm text-white placeholder-zinc-600 outline-none transition-all duration-200 focus:border-blue-500/60 focus:bg-zinc-900 focus:ring-2 focus:ring-blue-500/15"
                  />
                </div>
                <button
                  onClick={handleSubmit}
                  className="group relative flex w-full sm:w-auto shrink-0 items-center justify-center gap-2.5 overflow-hidden rounded-xl bg-blue-600 px-7 py-3.5 font-mono text-sm font-semibold text-white shadow-[0_0_30px_-5px_rgba(59,130,246,0.45)] transition-all duration-300 hover:bg-blue-500 hover:shadow-[0_0_45px_-5px_rgba(59,130,246,0.6)] active:scale-[0.98]"
                >
                  <span className="absolute inset-0 -translate-x-full bg-linear-to-r from-transparent via-white/10 to-transparent transition-transform duration-700 group-hover:translate-x-full" />
                  <span className="relative">Get Early Access</span>
                  <ArrowRight className="relative h-4 w-4 transition-transform duration-200 group-hover:translate-x-0.5" />
                </button>
              </motion.div>
            ) : (
              <motion.div
                key="success"
                initial={{ opacity: 0, scale: 0.92, y: 8 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
                className="flex flex-col items-center gap-2"
              >
                <CheckCircle2
                  className="h-10 w-10 text-emerald-400"
                  strokeWidth={1.5}
                />
                <p className="font-mono text-lg font-semibold text-white">
                  You&apos;re on the list.
                </p>
                <p className="font-mono text-sm text-zinc-500">
                  We&apos;ll reach out to{" "}
                  <span className="text-blue-400">{email}</span> before launch.
                </p>
              </motion.div>
            )}
          </AnimatePresence>

          <div className="mt-8 flex flex-wrap items-center justify-center gap-x-4 md:gap-x-6 gap-y-2">
            {perks.map((p) => (
              <span
                key={p}
                className="flex items-center gap-1.5 font-mono text-[10px] md:text-xs text-zinc-600"
              >
                <span className="h-1 w-1 rounded-full bg-zinc-700" />
                {p}
              </span>
            ))}
          </div>
        </div>

        <div className="h-px w-full bg-linear-to-r from-transparent via-blue-500/30 to-transparent" />
      </motion.div>
    </section>
  );
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function Page() {
  return (
    <div className="min-h-screen bg-black antialiased">
      <Hero />
      <StatsStrip />
      <Features />
      <CTACard />
    </div>
  );
}
