"use client";

import { useEffect, useState, useCallback } from "react";
import { motion } from "framer-motion";
import { Clock, TrendingUp, TrendingDown, Minus, ShieldCheck, AlertCircle } from "lucide-react";
import { getDashboardMetrics as getRealDashboardMetrics } from "@/services";
import type { DashboardMetrics } from "@/types";
import { useAppStore } from "@/store/useAppStore";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { PortfolioTable } from "./PortfolioTable";

// ---------------------------------------------------------------------------
// Page
// ---------------------------------------------------------------------------

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

function DashboardSkeleton() {
  return (
    <div className="max-w-7xl mx-auto space-y-8 py-4">
      {/* Header Skeleton */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-zinc-800/50 pb-6">
        <div className="space-y-3">
          <Skeleton className="h-7 w-48 bg-zinc-900" />
          <div className="flex items-center gap-3">
            <Skeleton className="h-4 w-32 bg-zinc-900" />
            <Skeleton className="h-4 w-20 bg-zinc-900" />
          </div>
        </div>
        <Skeleton className="h-6 w-24 bg-zinc-900 rounded-full" />
      </div>

      {/* Cards Skeleton */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {[0, 1, 2].map((i) => (
          <Card key={i} className="border-zinc-800/50 bg-zinc-950/50">
            <CardHeader className="pb-2">
              <Skeleton className="h-3 w-24 bg-zinc-900" />
            </CardHeader>
            <CardContent>
              <div className="flex flex-col gap-3 mt-1">
                <Skeleton className="h-9 w-32 bg-zinc-900" />
                <Skeleton className="h-3 w-16 bg-zinc-900" />
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Table Skeleton Placeholder */}
      <div className="space-y-4">
        <div className="flex items-center justify-between px-2">
          <Skeleton className="h-3 w-48 bg-zinc-900" />
          <Skeleton className="h-3 w-32 bg-zinc-900" />
        </div>
        <Card className="border-zinc-800/50 bg-zinc-950/50 overflow-hidden">
          <div className="p-0">
            <div className="border-b border-zinc-800/50 bg-zinc-900/30 p-4 flex justify-between">
              {[0, 1, 2, 3, 4].map((i) => (
                <Skeleton key={i} className="h-3 w-20 bg-zinc-800/50" />
              ))}
            </div>
            <div className="p-4 space-y-6">
              {[0, 1, 2, 3].map((i) => (
                <div key={i} className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <Skeleton className="h-8 w-8 rounded bg-zinc-900" />
                    <div className="space-y-2">
                      <Skeleton className="h-4 w-32 bg-zinc-900" />
                      <Skeleton className="h-2 w-20 bg-zinc-900" />
                    </div>
                  </div>
                  <Skeleton className="h-4 w-20 bg-zinc-900" />
                  <Skeleton className="h-4 w-20 bg-zinc-900" />
                  <Skeleton className="h-6 w-16 bg-zinc-900 rounded-full" />
                </div>
              ))}
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Overview Page
// ---------------------------------------------------------------------------

export default function OverviewPage() {
  const [metrics, setMetrics] = useState<DashboardMetrics | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const { isLoggedIn, userProfile, updateProfile } = useAppStore();

  const loadMetrics = useCallback(async () => {
    if (!isLoggedIn) return;

    try {
      const data = await getRealDashboardMetrics();
      const metricsData = data as DashboardMetrics;
      setMetrics(metricsData);

      // Update store with latest KYC status from metrics
      if (
        metricsData.kyc_status &&
        userProfile?.kyc_status !== metricsData.kyc_status
      ) {
        updateProfile({
          kyc_status: metricsData.kyc_status,
          kyc_rejection_reason: metricsData.kyc_rejection_reason,
        });
      }
    } catch (err) {
      console.warn("Failed to load metrics", err);
    } finally {
      setIsLoading(false);
    }
  }, [isLoggedIn, userProfile, updateProfile]);

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
    return <DashboardSkeleton />;
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
        <div className="flex items-center gap-4">
          <h1 className="font-mono text-xl font-bold text-white tracking-tighter uppercase">
            Nerve Center
          </h1>
          {userProfile?.kyc_status === "verified" && (
            <Badge
              variant="outline"
              className="bg-purple-500/10 border-purple-500/30 text-purple-400 gap-1 rounded-md px-2 py-0.5"
            >
              <ShieldCheck className="h-3.5 w-3.5" />
              Verified Seller
            </Badge>
          )}
          {userProfile?.kyc_status === "pending" && (
            <Badge
              variant="outline"
              className="bg-amber-500/10 border-amber-500/30 text-amber-400 gap-1 rounded-md px-2 py-0.5"
            >
              <Clock className="h-3.5 w-3.5" />
              Verification Pending
            </Badge>
          )}
          {userProfile?.kyc_status === "rejected" && (
            <Badge
              variant="outline"
              className="bg-red-500/10 border-red-500/30 text-red-400 gap-1 rounded-md px-2 py-0.5"
            >
              <AlertCircle className="h-3.5 w-3.5" />
              Rejected
            </Badge>
          )}
        </div>
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
