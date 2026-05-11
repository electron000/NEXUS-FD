"use client";

import { useEffect, useState, useCallback } from "react";
import { motion } from "framer-motion";
import { Clock, TrendingUp, TrendingDown, Minus } from "lucide-react";
import { getDashboardMetrics as getRealDashboardMetrics } from "@/services";
import type { DashboardMetrics } from "@/types";
import { useAppStore } from "@/store/useAppStore";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { PortfolioTable } from "./PortfolioTable";

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
    <span className="font-mono text-[11px] text-zinc-600 tabular-nums">
      {time}
    </span>
  );
}

// ---------------------------------------------------------------------------
// MetricCard
// ---------------------------------------------------------------------------

interface MetricCardProps {
  label: string;
  value: number | string;
  change: number;
  prefix?: string;
  suffix?: string;
  delay?: number;
}

function formatValue(v: number | string, prefix?: string, suffix?: string) {
  if (typeof v === "string") return `${prefix ?? ""}${v}${suffix ?? ""}`;

  const formatted =
    v >= 100000
      ? `${(v / 1000).toFixed(1)}K`
      : v >= 1000
        ? v.toLocaleString("en-IN", { maximumFractionDigits: 0 })
        : v.toFixed(2);
  return `${prefix ?? ""}${formatted}${suffix ?? ""}`;
}

function ChangeIndicator({ change }: { change: number }) {
  if (change > 0) {
    return (
      <span className="flex items-center gap-1 font-mono text-[10px] text-emerald-400 font-semibold">
        <TrendingUp className="h-3 w-3" />+{change.toFixed(1)}%
      </span>
    );
  }
  if (change < 0) {
    return (
      <span className="flex items-center gap-1 font-mono text-[10px] text-red-400 font-semibold">
        <TrendingDown className="h-3 w-3" />
        {change.toFixed(1)}%
      </span>
    );
  }
  return (
    <span className="flex items-center gap-1 font-mono text-[10px] text-zinc-600">
      <Minus className="h-3 w-3" />
      No change
    </span>
  );
}

function MetricCard({
  label,
  value,
  change,
  prefix,
  suffix,
  delay = 0,
}: MetricCardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay, duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
    >
      <Card className="overflow-hidden border-zinc-800/50 bg-zinc-950/50 backdrop-blur-sm">
        <CardHeader className="pb-2">
          <CardTitle className="text-[10px] uppercase tracking-widest text-zinc-500 font-mono">
            {label}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col gap-2">
            <p className="font-mono text-3xl font-bold text-white tabular-nums tracking-tight">
              {formatValue(value, prefix, suffix)}
            </p>
            <ChangeIndicator change={change} />
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}

// ---------------------------------------------------------------------------
// Overview Page
// ---------------------------------------------------------------------------

export default function OverviewPage() {
  const [metrics, setMetrics] = useState<DashboardMetrics | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const { isLoggedIn } = useAppStore();

  const loadMetrics = useCallback(async () => {
    if (!isLoggedIn) return;

    try {
      const data = await getRealDashboardMetrics();
      setMetrics(data as DashboardMetrics);
    } catch (err) {
      console.warn("Failed to load metrics", err);
    } finally {
      setIsLoading(false);
    }
  }, [isLoggedIn]);

  // Initial load
  useEffect(() => {
    let isMounted = true;

    const initialize = async () => {
      if (!isLoggedIn) {
        setIsLoading(false);
        return;
      }
      await loadMetrics();
      if (isMounted) setIsLoading(false);
    };

    initialize();
    return () => {
      isMounted = false;
    };
  }, [loadMetrics, isLoggedIn]);

  // Polling — single interval only
  useEffect(() => {
    if (!isLoggedIn) return;
    const id = setInterval(loadMetrics, 30_000);
    return () => clearInterval(id);
  }, [loadMetrics, isLoggedIn]);

  if (isLoading && !metrics) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-blue-500 border-t-transparent" />
      </div>
    );
  }

  if (!metrics) return null;

  const metricList = [
    metrics.portfolioValue,
    metrics.activeDomains,
    metrics.totalInvested,
  ];

  return (
    <div className="max-w-7xl mx-auto space-y-8 py-4">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-zinc-800/50 pb-6">
        <div>
          <h1 className="font-mono text-xl font-bold text-white tracking-tighter uppercase">
            Nerve Center
          </h1>
          <div className="flex items-center gap-3 mt-2">
            <div className="flex items-center gap-2">
              <Clock className="h-3 w-3 text-zinc-600" strokeWidth={1.5} />
              <LiveClock />
            </div>
            <span className="text-zinc-800">|</span>
            <span className="flex items-center gap-1.5 font-mono text-[10px] text-emerald-500 font-bold uppercase tracking-widest">
              <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.6)]" />
              Live Feed
            </span>
          </div>
        </div>
        <Badge
          variant="outline"
          className="font-mono text-[10px] border-zinc-800 text-zinc-600 px-3 py-1 self-start sm:self-auto"
        >
          30s refresh
        </Badge>
      </div>

      {/* Metric cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {metricList.map((m, i) => (
          <MetricCard key={m.label} {...m} delay={i * 0.08} />
        ))}
      </div>

      {/* Portfolio Table */}
      <PortfolioTable data={metrics.portfolio} />
    </div>
  );
}
