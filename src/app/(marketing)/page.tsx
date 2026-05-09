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
  CheckCircle2,
  Search,
  Bookmark,
  Globe,
  ShieldCheck,
  Zap,
  ShoppingCart,
  Activity,
  Clock,
} from "lucide-react";
import Link from "next/link";

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

// ─── Terminal Mockup ─────────────────────────────────────────────────────────
// Reflects the actual dashboard: Domain Terminal (appraisal + registrar
// arbitrage) on the left, and the real Overview metric cards on the right.

function TerminalMockup() {
  const registrars = [
    { name: "Porkbun", price: "$11.44", badge: "LOWEST", highlight: true },
    { name: "Name.com", price: "$13.99", badge: null, highlight: false },
    { name: "GoDaddy", price: "$19.99", badge: "AVOID", highlight: false },
  ];

  const metrics = [
    { label: "Portfolio Value", value: "—", note: "Verified data" },
    { label: "Active Domains", value: "—", note: "Verified data" },
    { label: "Monthly Revenue", value: "—", note: "Verified data" },
    { label: "Watchlist", value: "—", note: "Verified data" },
  ];

  return (
    <motion.div
      initial={{ opacity: 0, y: 40 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.9, delay: 0.5, ease: [0.22, 1, 0.36, 1] }}
      className="relative mx-auto mt-12 md:mt-20 max-w-5xl rounded-2xl border border-zinc-800/60 bg-zinc-950/80 shadow-[0_0_80px_-10px_rgba(59,130,246,0.25)] backdrop-blur-xl overflow-hidden text-left"
    >
      {/* Window chrome */}
      <div className="flex items-center gap-2 border-b border-zinc-800/60 px-4 md:px-5 py-3.5 overflow-hidden">
        <div className="flex shrink-0 gap-2">
          <span className="h-3 w-3 rounded-full bg-zinc-700" />
          <span className="h-3 w-3 rounded-full bg-zinc-700" />
          <span className="h-3 w-3 rounded-full bg-zinc-700" />
        </div>
        <span className="ml-2 md:ml-4 truncate font-mono text-[10px] md:text-xs text-zinc-500 tracking-widest uppercase">
          nexus://terminal — domain_intelligence
        </span>
        <span className="ml-auto flex shrink-0 items-center gap-1.5">
          <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 animate-pulse" />
          <span className="font-mono text-[10px] text-emerald-400 tracking-widest uppercase hidden sm:inline-block">
            authenticated
          </span>
        </span>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 divide-y lg:divide-y-0 lg:divide-x divide-zinc-800/40">
        {/* ── Left: Domain Terminal ── */}
        <div className="col-span-1 lg:col-span-2 p-4 md:p-5 flex flex-col gap-4 min-w-0">
          {/* Mode tabs */}
          <div className="flex items-center gap-1">
            {[
              { label: "Acquisition", icon: ShoppingCart, active: false },
              { label: "Appraisal", icon: Zap, active: true },
              { label: "Exchange", icon: ShieldCheck, active: false },
            ].map(({ label, icon: Icon, active }) => (
              <div
                key={label}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg border font-mono text-[10px] tracking-widest uppercase transition-colors ${
                  active
                    ? "border-blue-500/40 bg-blue-500/10 text-blue-400"
                    : "border-zinc-800/50 bg-transparent text-zinc-600"
                }`}
              >
                <Icon className="h-3 w-3" strokeWidth={1.5} />
                {label}
              </div>
            ))}
          </div>

          {/* Search bar */}
          <div className="flex items-center gap-2 rounded-xl border border-zinc-700/50 bg-zinc-900/60 px-3 py-2.5">
            <Search
              className="h-3.5 w-3.5 text-zinc-600 shrink-0"
              strokeWidth={1.5}
            />
            <span className="font-mono text-sm text-white flex-1">
              protocol.ai
            </span>
            <span className="font-mono text-[10px] text-blue-400 border border-blue-500/30 bg-blue-500/10 px-2 py-0.5 rounded-md tracking-widest">
              ANALYZE
            </span>
          </div>

          {/* Result: score + valuation */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            {[
              {
                label: "ML Score",
                value: "91",
                sub: "/ 100",
                color: "text-emerald-400",
              },
              {
                label: "Est. Value",
                value: "$124.5K",
                sub: "baseline",
                color: "text-white",
              },
              {
                label: "Confidence",
                value: "High",
                sub: "XGBoost",
                color: "text-blue-400",
              },
            ].map(({ label, value, sub, color }) => (
              <div
                key={label}
                className="rounded-xl border border-zinc-800/50 bg-zinc-900/40 p-3 flex flex-col items-center gap-1"
              >
                <span className="font-mono text-[10px] text-zinc-600 tracking-widest uppercase">
                  {label}
                </span>
                <span
                  className={`font-mono text-2xl font-bold tabular-nums ${color}`}
                >
                  {value}
                </span>
                <span className="font-mono text-[10px] text-zinc-700">
                  {sub}
                </span>
              </div>
            ))}
          </div>

          {/* Registrar arbitrage table */}
          <div className="rounded-xl border border-zinc-800/50 bg-zinc-900/30 overflow-hidden">
            <div className="px-3 py-2 border-b border-zinc-800/50 flex items-center justify-between">
              <span className="font-mono text-[10px] text-zinc-500 tracking-widest uppercase flex items-center gap-1.5">
                <Globe className="h-3 w-3" strokeWidth={1.5} />
                Registrar Arbitrage
              </span>
              <span className="font-mono text-[10px] text-zinc-700">
                renewal / yr
              </span>
            </div>
            {registrars.map((r) => (
              <div
                key={r.name}
                className={`flex items-center justify-between px-3 py-2 border-b border-zinc-800/30 last:border-0 transition-colors ${
                  r.highlight ? "bg-emerald-500/5" : ""
                }`}
              >
                <span
                  className={`font-mono text-xs ${r.highlight ? "text-white" : "text-zinc-500"}`}
                >
                  {r.name}
                </span>
                <div className="flex items-center gap-2">
                  {r.badge && (
                    <span
                      className={`font-mono text-[9px] tracking-widest px-1.5 py-0.5 rounded border ${
                        r.badge === "LOWEST"
                          ? "text-emerald-400 border-emerald-500/30 bg-emerald-500/10"
                          : "text-red-400 border-red-500/30 bg-red-500/10"
                      }`}
                    >
                      {r.badge}
                    </span>
                  )}
                  <span
                    className={`font-mono text-sm tabular-nums ${r.highlight ? "text-emerald-400" : "text-zinc-500"}`}
                  >
                    {r.price}
                  </span>
                </div>
              </div>
            ))}
          </div>

          {/* Action row */}
          <div className="flex items-center gap-2">
            <div className="flex items-center gap-1.5 text-zinc-600 font-mono text-[10px]">
              <Bookmark className="h-3 w-3" strokeWidth={1.5} />
              Add to Watchlist
            </div>
            <div className="ml-auto flex items-center gap-1.5 text-zinc-700 font-mono text-[10px]">
              <Activity className="h-3 w-3" strokeWidth={1.5} />
              Contact Owner
            </div>
          </div>
        </div>

        {/* ── Right: Overview metrics (what /overview actually shows) ── */}
        <div className="p-4 md:p-5 flex flex-col gap-3">
          <div className="flex items-center justify-between mb-1">
            <span className="font-mono text-[10px] text-zinc-500 tracking-widest uppercase">
              Nerve Center
            </span>
            <div className="flex items-center gap-1.5">
              <Clock className="h-3 w-3 text-zinc-700" strokeWidth={1.5} />
              <span className="font-mono text-[10px] text-zinc-700">UTC</span>
            </div>
          </div>

          {metrics.map(({ label, value, note }) => (
            <div
              key={label}
              className="rounded-xl border border-zinc-800/50 bg-zinc-900/40 px-3 py-3 flex flex-col gap-1"
            >
              <span className="font-mono text-[9px] text-zinc-600 tracking-widest uppercase">
                {label}
              </span>
              <span className="font-mono text-xl font-bold text-white tabular-nums">
                {value}
              </span>
              <div className="flex items-center gap-1.5">
                <div className="h-1.5 w-1.5 rounded-full bg-blue-500" />
                <span className="font-mono text-[9px] text-zinc-700 uppercase">
                  {note}
                </span>
              </div>
            </div>
          ))}

          <div className="mt-auto pt-2 border-t border-zinc-800/40">
            <span className="font-mono text-[9px] text-zinc-700 uppercase tracking-widest block text-center">
              V 1.0.4 — PROD
            </span>
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
  animateTrigger,
}: {
  icon: React.ElementType;
  title: string;
  desc: string;
  tag: string;
  span?: "normal" | "wide" | "tall";
  delay?: number;
  animateTrigger?: boolean;
}) {
  const cardRef = useRef<HTMLDivElement>(null);

  const rawX = useMotionValue(0);
  const rawY = useMotionValue(0);
  const springCfg = { stiffness: 160, damping: 24, mass: 0.5 };
  const x = useSpring(rawX, springCfg);
  const y = useSpring(rawY, springCfg);

  const glowOpacity = useSpring(0, { stiffness: 120, damping: 18 });
  const borderOpacity = useSpring(0, { stiffness: 120, damping: 18 });

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
      animate={animateTrigger ? "visible" : "hidden"}
      onMouseMove={onMouseMove}
      onMouseLeave={onMouseLeave}
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
          Institutional-grade intelligence for the digital asset class. ML
          appraisals, registrar arbitrage, Aadhaar-verified P2P connections, and
          portfolio tracking — unified in a single command surface.
        </motion.p>

        <motion.div
          variants={fadeUp}
          custom={0.3}
          initial="hidden"
          animate="visible"
          className="flex flex-col sm:flex-row items-center justify-center gap-3 md:gap-4"
        >
          <Link
            href="/register"
            className="w-full sm:w-auto group flex justify-center items-center gap-2 rounded-xl bg-blue-600 px-6 py-3.5 font-mono text-sm font-semibold text-white shadow-[0_0_30px_-5px_rgba(59,130,246,0.4)] transition-all duration-300 hover:bg-blue-500 hover:shadow-[0_0_40px_-5px_rgba(59,130,246,0.55)]"
          >
            Start Auditing
            <ArrowRight className="h-4 w-4 transition-transform duration-200 group-hover:translate-x-0.5" />
          </Link>
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
    { value: "94.7%", label: "Appraisal Accuracy", icon: CheckCircle2 },
    { value: "S-Tier", label: "Institutional Grade", icon: Layers },
  ];

  return (
    <section
      ref={ref}
      className="relative border-y border-zinc-800/50 bg-zinc-950"
    >
      <div
        className="pointer-events-none absolute inset-0 opacity-[0.03]"
        style={{
          backgroundImage:
            "repeating-linear-gradient(90deg, rgba(59,130,246,1) 0px, rgba(59,130,246,1) 1px, transparent 1px, transparent 160px)",
        }}
      />
      <div className="relative mx-auto grid max-w-5xl grid-cols-1 divide-y divide-zinc-800/40 sm:grid-cols-2 sm:divide-y-0 sm:divide-x">
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

// ─── Features ────────────────────────────────────────────────────────────────

function Features() {
  const { ref, inView } = useReveal();

  return (
    <section
      id="features"
      ref={ref}
      className="relative bg-black py-20 md:py-28"
    >
      <div className="mx-auto max-w-6xl px-4 md:px-6">
        <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
          <FeatureCard
            icon={BarChart3}
            title="Valuation Core"
            tag="Intelligence Core"
            desc="High-performance XGBoost regressor trained on 4,000+ institutional sales, providing sub-second quantitative baselines inside the Domain Terminal."
            delay={0}
            animateTrigger={inView}
          />

          <FeatureCard
            icon={GitFork}
            title="Registrar Arbitrage"
            tag="Nerve Center"
            desc="Direct integration with GoDaddy, Porkbun, and Name.com to surface the lowest renewal cost and acquisition path for any domain, in real-time."
            delay={0.12}
            animateTrigger={inView}
          />

          <FeatureCard
            icon={TrendingUp}
            title="P2P Verified Exchange"
            tag="Trust Authority"
            desc="Technical ownership validation via DNS TXT/HTML crawling and Aadhaar-based KYC — so every seller in the network carries institutional-grade trust."
            delay={0.18}
            animateTrigger={inView}
          />
        </div>
      </div>
    </section>
  );
}

// ─── CTA Card ────────────────────────────────────────────────────────────────

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
