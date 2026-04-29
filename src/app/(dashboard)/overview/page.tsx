"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import {
  TrendingUp, TrendingDown, Activity, Globe,
  ArrowUpRight, ArrowDownRight, Clock, Bookmark,
} from "lucide-react";
import { getDashboardMetrics, type DashboardMetrics } from "@/services/mock";
import { useAppStore } from "@/store/useAppStore";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Sparkline } from "@/components/ui/sparkline";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import Link from "next/link";

// ---------------------------------------------------------------------------
// LiveClock
// ---------------------------------------------------------------------------

function LiveClock() {
  const [time, setTime] = useState("");
  useEffect(() => {
    function tick() {
      setTime(new Date().toUTCString().split(" ").slice(4).join(" "));
    }
    tick();
    const id = setInterval(tick, 1000);
    return () => clearInterval(id);
  }, []);
  return (
    <span className="font-mono text-[11px] text-zinc-600 tabular-nums">{time}</span>
  );
}

// ---------------------------------------------------------------------------
// MetricCard
// ---------------------------------------------------------------------------

interface MetricCardProps {
  label: string;
  value: number;
  change: number;
  prefix?: string;
  suffix?: string;
  sparkline: number[];
  delay?: number;
}

function formatValue(v: number, prefix?: string, suffix?: string) {
  const formatted = v >= 100000
    ? `${(v / 1000).toFixed(1)}K`
    : v >= 1000
    ? v.toLocaleString("en-US", { maximumFractionDigits: 0 })
    : v.toFixed(2);
  return `${prefix ?? ""}${formatted}${suffix ?? ""}`;
}

function MetricCard({ label, value, change, prefix, suffix, sparkline, delay = 0 }: MetricCardProps) {
  const isUp = change >= 0;
  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay, duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
    >
      <Card className="overflow-hidden">
        <CardHeader>
          <CardTitle>{label}</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-end justify-between gap-2">
            <div>
              <p className="font-mono text-2xl font-bold text-white tabular-nums">
                {formatValue(value, prefix, suffix)}
              </p>
              <div className={cn(
                "mt-1 flex items-center gap-1 font-mono text-[11px]",
                isUp ? "text-emerald-400" : "text-red-400"
              )}>
                {isUp
                  ? <ArrowUpRight className="h-3 w-3" />
                  : <ArrowDownRight className="h-3 w-3" />}
                {Math.abs(change).toFixed(2)}%
                <span className="text-zinc-600 ml-1">24h</span>
              </div>
            </div>
            <div className="h-10 w-20 shrink-0">
              <Sparkline
                data={sparkline}
                color={isUp ? "#22c55e" : "#ef4444"}
                width={80}
                height={40}
              />
            </div>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}

// ---------------------------------------------------------------------------
// MarketSentimentGauge
// ---------------------------------------------------------------------------

function MarketSentimentGauge({ value }: { value: number }) {
  const label =
    value >= 75 ? "Extreme Greed" :
    value >= 60 ? "Greed" :
    value >= 50 ? "Neutral" :
    value >= 35 ? "Fear" : "Extreme Fear";

  const color =
    value >= 75 ? "#22c55e" :
    value >= 60 ? "#84cc16" :
    value >= 50 ? "#f59e0b" :
    value >= 35 ? "#f97316" : "#ef4444";

  const angle = -135 + (value / 100) * 270;

  return (
    <Card className="flex flex-col items-center py-5">
      <CardHeader className="pb-2 w-full">
        <CardTitle>Market Sentiment</CardTitle>
      </CardHeader>
      <div className="relative flex items-center justify-center">
        <svg viewBox="0 0 120 75" width={160} height={100}>
          {/* Track */}
          <path
            d="M 15 65 A 46 46 0 0 1 105 65"
            fill="none" stroke="#27272a" strokeWidth="10" strokeLinecap="round"
          />
          {/* Fill — approximated with rotation */}
          {value > 0 && (
            <path
              d="M 15 65 A 46 46 0 0 1 105 65"
              fill="none"
              stroke={color}
              strokeWidth="10"
              strokeLinecap="round"
              strokeDasharray={`${(value / 100) * 144} 144`}
              style={{ filter: `drop-shadow(0 0 5px ${color}88)` }}
            />
          )}
          {/* Needle */}
          <g transform={`rotate(${angle}, 60, 65)`}>
            <line x1="60" y1="65" x2="60" y2="25" stroke={color} strokeWidth="2.5" strokeLinecap="round" />
            <circle cx="60" cy="65" r="4" fill={color} />
          </g>
          {/* Value */}
          <text x="60" y="58" textAnchor="middle" fill="white"
            fontSize="14" fontFamily="monospace" fontWeight="700">{value}</text>
        </svg>
      </div>
      <p className="font-mono text-xs font-semibold" style={{ color }}>{label}</p>
      <div className="mt-2 flex w-full items-center justify-between px-6">
        <span className="font-mono text-[9px] text-red-500 uppercase tracking-wider">Fear</span>
        <span className="font-mono text-[9px] text-emerald-500 uppercase tracking-wider">Greed</span>
      </div>
    </Card>
  );
}

// ---------------------------------------------------------------------------
// TopMovers
// ---------------------------------------------------------------------------

function TopMovers({ movers }: { movers: DashboardMetrics["topMovers"] }) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Activity className="h-3.5 w-3.5 text-blue-400" strokeWidth={1.5} />
          Top Movers
        </CardTitle>
      </CardHeader>
      <CardContent className="pt-1 space-y-1">
        {movers.map((m) => (
          <div
            key={m.domain}
            className="flex items-center justify-between rounded-lg px-3 py-2 hover:bg-zinc-800/30 transition-colors group"
          >
            <div className="flex items-center gap-2 min-w-0">
              <Globe className="h-3 w-3 text-zinc-600 shrink-0" strokeWidth={1.5} />
              <span className="font-mono text-xs text-zinc-200 truncate">{m.domain}</span>
            </div>
            <div className="flex items-center gap-3 shrink-0">
              <span className="font-mono text-[11px] text-zinc-500">${m.value.toLocaleString()}</span>
              <span className={cn(
                "flex items-center gap-0.5 font-mono text-[11px] font-semibold",
                m.change >= 0 ? "text-emerald-400" : "text-red-400"
              )}>
                {m.change >= 0 ? <TrendingUp className="h-3 w-3" /> : <TrendingDown className="h-3 w-3" />}
                {m.change >= 0 ? "+" : ""}{m.change.toFixed(2)}%
              </span>
            </div>
          </div>
        ))}
      </CardContent>
    </Card>
  );
}

// ---------------------------------------------------------------------------
// Watchlist Panel
// ---------------------------------------------------------------------------

function WatchlistPanel() {
  const { watchlist } = useAppStore();

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Bookmark className="h-3.5 w-3.5 text-blue-400" strokeWidth={1.5} />
          Watchlist
          {watchlist.length > 0 && (
            <Badge variant="primary" className="ml-auto">{watchlist.length}</Badge>
          )}
        </CardTitle>
      </CardHeader>
      <CardContent className="pt-1">
        {watchlist.length === 0 ? (
          <div className="flex flex-col items-center gap-2 py-6">
            <Bookmark className="h-8 w-8 text-zinc-800" strokeWidth={1} />
            <p className="font-mono text-xs text-zinc-600 text-center">
              No domains tracked yet.{" "}
              <Link href="/terminal" className="text-blue-500 hover:text-blue-400">
                Search the Terminal
              </Link>{" "}
              to add assets.
            </p>
          </div>
        ) : (
          <div className="space-y-1">
            {watchlist.slice(0, 8).map((entry) => (
              <div key={entry.domain} className="flex items-center justify-between rounded-lg px-3 py-2 hover:bg-zinc-800/30 transition-colors">
                <span className="font-mono text-xs text-zinc-300">{entry.domain}</span>
                <span className="font-mono text-[10px] text-zinc-600">
                  {new Date(entry.addedAt).toLocaleDateString()}
                </span>
              </div>
            ))}
            {watchlist.length > 8 && (
              <p className="font-mono text-[10px] text-zinc-600 text-center pt-1">
                +{watchlist.length - 8} more
              </p>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
}

// ---------------------------------------------------------------------------
// Overview Page
// ---------------------------------------------------------------------------

export default function OverviewPage() {
  const [metrics, setMetrics] = useState<DashboardMetrics>(() => getDashboardMetrics());

  // Refresh metrics every 3 seconds (FR-03 live simulation)
  useEffect(() => {
    const id = setInterval(() => {
      setMetrics(getDashboardMetrics());
    }, 3000);
    return () => clearInterval(id);
  }, []);

  const metricList = [
    metrics.portfolioValue,
    metrics.activeDomains,
    metrics.monthlyRevenue,
    metrics.watchlistSize,
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-mono text-lg font-bold text-white tracking-tight">
            Nerve Center
            <span className="ml-2 text-zinc-600">// Portfolio Overview</span>
          </h1>
          <div className="flex items-center gap-2 mt-1">
            <Clock className="h-3 w-3 text-zinc-700" strokeWidth={1.5} />
            <LiveClock />
            <span className="text-zinc-800">·</span>
            <span className="flex items-center gap-1 font-mono text-[10px] text-blue-500">
              <span className="h-1.5 w-1.5 rounded-full bg-blue-500 animate-pulse-soft" />
              Live Market Feed
            </span>
          </div>
        </div>
        <Badge variant="accent" className="hidden sm:flex items-center gap-1.5">
          <Activity className="h-3 w-3" strokeWidth={2} />
          Auto-refresh: 3s
        </Badge>
      </div>

      {/* Metric cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
        {metricList.map((m, i) => (
          <MetricCard key={m.label} {...m} delay={i * 0.06} />
        ))}
      </div>

      {/* Lower grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* Top Movers — takes 2 cols */}
        <div className="lg:col-span-2">
          <TopMovers movers={metrics.topMovers} />
        </div>

        {/* Sentiment + Watchlist */}
        <div className="flex flex-col gap-4">
          <MarketSentimentGauge value={metrics.marketSentiment} />
          <WatchlistPanel />
        </div>
      </div>
    </div>
  );
}
