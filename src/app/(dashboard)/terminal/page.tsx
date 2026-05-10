"use client";

import { useState, useCallback, FormEvent } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Search,
  Bookmark,
  BookmarkCheck,
  Tag,
  Clock,
  ChevronRight,
  Info,
  X,
  ShieldCheck,
  User,
  Globe,
  Activity,
  Zap,
  TrendingUp,
  ShoppingCart,
  Handshake,
  MessageSquare,
  AlertTriangle,
  Lock,
  BarChart2,
  Layers,
} from "lucide-react";
import type { DomainValuationResponse, LoadingPhase } from "@/types";
import { useAppStore } from "@/store/useAppStore";
import { API_BASE_URL } from "@/services/config";
import { SSEProgressBar } from "@/components/terminal/SSEProgressBar";
import { ScoreGauge } from "@/components/terminal/ScoreGauge";
import { ArbitrageTable } from "@/components/terminal/ArbitrageTable";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { GradeBadge, Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import { Tooltip } from "@/components/ui/tooltip";
import { cn } from "@/lib/utils";
import { InquiryModal } from "@/components/terminal/InquiryModal";

type TerminalMode = "acquisition" | "appraisal" | "exchange";

// ---------------------------------------------------------------------------
// Domain input sanitizer
// ---------------------------------------------------------------------------

function sanitizeDomain(raw: string): string {
  return raw
    .toLowerCase()
    .replace(/^https?:\/\//, "")
    .replace(/\/$/, "")
    .trim();
}

// ---------------------------------------------------------------------------
// Tier colour helper
// ---------------------------------------------------------------------------

function tierColor(tier: string | undefined) {
  if (!tier) return "text-zinc-400";
  const t = tier.toLowerCase();
  if (t === "high") return "text-green-400";
  if (t === "medium") return "text-yellow-400";
  return "text-red-400";
}

function tierBorderColor(tier: string | undefined) {
  if (!tier) return "border-zinc-700/30 bg-zinc-800/20";
  const t = tier.toLowerCase();
  if (t === "high") return "border-green-500/20 bg-green-500/5";
  if (t === "medium") return "border-yellow-500/20 bg-yellow-500/5";
  return "border-red-500/20 bg-red-500/5";
}

// ---------------------------------------------------------------------------
// Loading skeletons
// ---------------------------------------------------------------------------

function ResultSkeleton() {
  return (
    <div className="space-y-5">
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {[0, 1, 2].map((i) => (
          <Card key={i}>
            <CardContent className="flex flex-col items-center py-6 gap-3">
              <Skeleton className="h-24 w-24 rounded-full" />
              <Skeleton className="h-3 w-20" />
            </CardContent>
          </Card>
        ))}
      </div>
      <Card>
        <CardContent className="py-5 space-y-2">
          <Skeleton className="h-3 w-32" />
          <Skeleton className="h-3 w-full" />
          <Skeleton className="h-3 w-5/6" />
        </CardContent>
      </Card>
      <Card>
        <CardContent className="py-5">
          <Skeleton className="h-48 w-full" />
        </CardContent>
      </Card>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Results Panel
// ---------------------------------------------------------------------------

function ResultsPanel({
  data,
  mode,
  onContact,
  setMode,
}: {
  data: DomainValuationResponse;
  mode: TerminalMode;
  onContact: (domain: string) => void;
  setMode: (mode: TerminalMode) => void;
}) {
  const { addToWatchlist, removeFromWatchlist, isInWatchlist } = useAppStore();
  const inWatchlist = isInWatchlist(data.domain);

  const isAvailable = data.pricing.some((p) => p.available);
  const isNexusOwned = data.ownership?.isNexusMember === true;

  // 1. ACQUISITION VIEW
  const renderAcquisition = () => (
    <div className="space-y-5">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        {isAvailable ? (
          <>
            <Card glow="blue" className="lg:col-span-2">
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <ShoppingCart className="h-4 w-4 text-blue-400" />
                    Registrar Arbitrage Terminal
                  </div>
                  <Tooltip content="Live API aggregation from GoDaddy, Porkbun, and Name.com via Nexus Master Keys.">
                    <Info className="h-3.5 w-3.5 text-zinc-600 hover:text-zinc-400 cursor-help" />
                  </Tooltip>
                </CardTitle>
              </CardHeader>
              <CardContent className="overflow-x-auto">
                <ArbitrageTable data={data.pricing} />
              </CardContent>
            </Card>
          </>
        ) : (
          <Card className="lg:col-span-2 border-amber-500/20 bg-amber-500/5">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-amber-500">
                <AlertTriangle className="h-4 w-4" />
                Domain Already Registered
              </CardTitle>
            </CardHeader>
            <CardContent className="py-10 text-center">
              <div className="max-w-md mx-auto">
                <Globe
                  className="h-12 w-12 text-zinc-700 mx-auto mb-4"
                  strokeWidth={1}
                />
                <h3 className="font-mono text-sm font-bold text-white mb-2 uppercase tracking-tight">
                  Currently Registered
                </h3>
                <p className="font-mono text-[11px] text-zinc-500 leading-relaxed mb-6">
                  This domain is already owned and active.{" "}
                  {isNexusOwned
                    ? "It belongs to a Nexus member — secure P2P negotiation is available."
                    : "This owner is not on Nexus; direct negotiation is restricted."}
                </p>
                <Button
                  variant="outline"
                  onClick={() => setMode("exchange")}
                  className="font-mono text-[10px] uppercase border-zinc-800 hover:bg-zinc-800"
                >
                  View Ownership Intelligence
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

        {/* ML Appraisal Summary — replaces null quantitative gauge */}
        <Card className="flex flex-col justify-center py-8 px-5 gap-5 relative">
          <div className="absolute top-4 right-4">
            <Tooltip content="Investment tier and price estimate from the ML tier + price model pipeline.">
              <Info className="h-3 w-3 text-zinc-700" />
            </Tooltip>
          </div>

          {/* Predicted Tier */}
          <div className={cn("rounded-xl border p-4 text-center", tierBorderColor(data.appraisal?.predictedTier))}>
            <p className="font-mono text-[9px] text-zinc-500 uppercase tracking-widest mb-1">
              ML Investment Tier
            </p>
            <p className={cn("font-mono text-2xl font-bold uppercase tracking-tight", tierColor(data.appraisal?.predictedTier))}>
              {data.appraisal?.predictedTier ?? "—"}
            </p>
            <p className="font-mono text-[9px] text-zinc-600 mt-1 uppercase">
              {data.appraisal?.tier ?? ""}
            </p>
          </div>

          {/* Predicted Price */}
          <div className="rounded-xl border border-zinc-800 bg-zinc-900/50 p-4 text-center">
            <p className="font-mono text-[9px] text-zinc-500 uppercase tracking-widest mb-1">
              Predicted Price
            </p>
            <p className="font-mono text-lg font-bold text-blue-400 tracking-tight">
              ₹{data.appraisal?.predictedPrice?.toLocaleString("en-IN") ?? "—"}
            </p>
            <p className="font-mono text-[9px] text-zinc-600 mt-1 uppercase">
              ML estimate
            </p>
          </div>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <div className="flex items-center gap-2 text-zinc-300">
              <ShieldCheck className="h-4 w-4 text-blue-400" />
              Acquisition Intelligence
            </div>
            <Tooltip content="Synthesized financial model comparing entry-cost arbitrage and registrar reliability.">
              <Info className="h-3.5 w-3.5 text-zinc-600 cursor-help" />
            </Tooltip>
          </CardTitle>
        </CardHeader>
        <CardContent className="py-8">
          <div className="flex flex-col items-center text-center max-w-2xl mx-auto">
            <div
              className={cn(
                "h-12 w-12 rounded-full flex items-center justify-center mb-4",
                isAvailable
                  ? "bg-blue-500/10"
                  : isNexusOwned
                    ? "bg-purple-500/10"
                    : "bg-zinc-800",
              )}
            >
              {isAvailable ? (
                <ShieldCheck className="h-6 w-6 text-blue-400" />
              ) : isNexusOwned ? (
                <Handshake className="h-6 w-6 text-purple-500" />
              ) : (
                <Lock className="h-6 w-6 text-zinc-600" />
              )}
            </div>
            <p className="font-mono text-sm text-zinc-300 mb-2">
              Primary Recommendation
            </p>
            <p className="font-mono text-xs text-zinc-500 leading-relaxed">
              {isAvailable ? (
                <>
                  Based on current registrar pricing and ML tier assessment,{" "}
                  {data.domain} is a {data.score.grade}-grade{" "}
                  <span className={tierColor(data.appraisal?.predictedTier)}>
                    {data.appraisal?.predictedTier ?? "unrated"}
                  </span>{" "}
                  tier asset. We recommend acquisition via{" "}
                  {
                    data.pricing.sort(
                      (a, b) => a.registration - b.registration,
                    )[0]?.registrar
                  }{" "}
                  for optimal entry cost.
                </>
              ) : isNexusOwned ? (
                <>
                  This is a {data.score.grade}-grade asset owned by a{" "}
                  <strong>Nexus Member</strong>. Acquisition is possible via
                  secure P2P negotiation. The owner is currently{" "}
                  {data.ownership?.isForSale
                    ? "accepting offers"
                    : "holding for investment"}
                  .
                </>
              ) : (
                <>
                  This is a {data.score.grade}-grade{" "}
                  <strong>External Asset</strong>. Ownership is not verified on
                  the Nexus network. We recommend adding to your Watchlist to
                  monitor for expiration or future listing.
                </>
              )}
            </p>
            {isNexusOwned && !isAvailable && (
              <Button
                onClick={() => onContact(data.domain)}
                className="mt-6 bg-purple-600 hover:bg-purple-700 text-white font-mono text-[10px] h-9 px-6 uppercase"
              >
                Initiate Peer-to-Peer Offer
              </Button>
            )}
            {!isNexusOwned && !isAvailable && (
              <Button
                variant="outline"
                onClick={() =>
                  inWatchlist
                    ? removeFromWatchlist(data.domain)
                    : addToWatchlist(data.domain)
                }
                className="mt-6 font-mono text-[10px] h-9 px-6 uppercase border-zinc-800"
              >
                {inWatchlist ? "Stop Monitoring Asset" : "Monitor for Changes"}
              </Button>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );

  // 2. APPRAISAL VIEW
  const renderAppraisal = () => (
    <div className="space-y-5">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">

        {/* Tier Intelligence — replaces null FMV card */}
        <Card glow="green">
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Layers className="h-4 w-4 text-green-400" />
                Tier Intelligence
              </div>
              <Tooltip content="Investment tier predicted by the RandomForest tier model trained on domain market data.">
                <Info className="h-3.5 w-3.5 text-zinc-600 cursor-help" />
              </Tooltip>
            </CardTitle>
          </CardHeader>
          <CardContent className="py-10 text-center">
            <p className="font-mono text-[10px] text-zinc-500 uppercase tracking-widest mb-2">
              ML Investment Tier
            </p>
            <h3 className={cn("font-mono text-5xl font-bold tracking-tighter uppercase", tierColor(data.appraisal?.predictedTier))}>
              {data.appraisal?.predictedTier ?? "—"}
            </h3>
            <div className="flex items-center justify-center gap-2 mt-4">
              <Badge
                variant="outline"
                className={cn("font-mono border", tierBorderColor(data.appraisal?.predictedTier))}
              >
                {data.appraisal?.tier ?? "Standard"} Category
              </Badge>
              <Badge
                variant="outline"
                className="font-mono border-zinc-700 text-zinc-400"
              >
                Grade {data.score.grade}
              </Badge>
            </div>
          </CardContent>
        </Card>

        {/* Predicted Sale Price */}
        <Card glow="cyan">
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Zap className="h-4 w-4 text-purple-400" />
                Predicted Sale Price
              </div>
              <Tooltip content="Machine learning prediction from the price model trained on domain market transactions.">
                <Info className="h-3.5 w-3.5 text-zinc-600 cursor-help" />
              </Tooltip>
            </CardTitle>
          </CardHeader>
          <CardContent className="py-10 text-center">
            <p className="font-mono text-[10px] text-zinc-500 uppercase tracking-widest mb-2">
              ML Price Estimate
            </p>
            <h3 className="font-mono text-4xl font-bold text-blue-400 tracking-tighter">
              ₹{data.appraisal?.predictedPrice?.toLocaleString("en-IN") ?? "—"}
            </h3>
            <p className="mt-3 font-mono text-[11px] text-zinc-600">
              Tier:{" "}
              <span className={cn("font-semibold uppercase", tierColor(data.appraisal?.predictedTier))}>
                {data.appraisal?.predictedTier ?? "—"}
              </span>
            </p>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
        <Card className="flex flex-col items-center py-8 relative">
          <div className="absolute top-4 right-4">
            <Tooltip content="NLP sentiment analysis and linguistic affinity matching.">
              <Info className="h-3 w-3 text-zinc-700" />
            </Tooltip>
          </div>
          <ScoreGauge
            value={data.score.semantic}
            label="Semantic Score"
            color="#8b5cf6"
          />
          <p className="mt-4 font-mono text-[10px] text-zinc-600 uppercase">
            Brand Affinity & Sentiment
          </p>
        </Card>
        <Card className="flex flex-col items-center py-8 relative">
          <div className="absolute top-4 right-4">
            <Tooltip content="Real-time search momentum and keyword velocity from Google Trends API.">
              <Info className="h-3 w-3 text-zinc-700" />
            </Tooltip>
          </div>
          <ScoreGauge
            value={data.score.trend}
            label="Trend Momentum"
            color="#06b6d4"
          />
          <p className="mt-4 font-mono text-[10px] text-zinc-600 uppercase">
            Search Trends & Momentum
          </p>
        </Card>
      </div>
    </div>
  );

  // 3. EXCHANGE VIEW
  const renderExchange = () => (
    <div className="space-y-5">
      <Card glow={isNexusOwned ? "blue" : undefined}>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <div className="flex items-center gap-2 text-zinc-300">
              <User className="h-4 w-4 text-purple-400" />
              Peer-to-Peer Ownership Intelligence
            </div>
            <div className="flex items-center gap-3">
              {data.ownership?.isVerified && (
                <Badge variant="positive" className="flex items-center gap-1">
                  <ShieldCheck className="h-3 w-3" /> Verified Nexus Seller
                </Badge>
              )}
              <Tooltip content="Verified Peer-to-Peer registry data retrieved via global RDAP/WHOIS protocols.">
                <Info className="h-3.5 w-3.5 text-zinc-600 cursor-help" />
              </Tooltip>
            </div>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="space-y-6">
              <div className="p-5 rounded-xl border border-zinc-800 bg-zinc-900/50">
                <h4 className="font-mono text-xs font-bold text-zinc-500 uppercase tracking-widest mb-4">
                  Ownership Snapshot
                </h4>
                <div className="space-y-3">
                  <div className="flex justify-between">
                    <span className="font-mono text-[11px] text-zinc-600 uppercase">
                      Owner
                    </span>
                    <span className="font-mono text-sm text-white">
                      {data.ownership?.ownerName || "Redacted"}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="font-mono text-[11px] text-zinc-600 uppercase">
                      Location
                    </span>
                    <span className="font-mono text-sm text-white">
                      {data.ownership?.country || "Unknown"}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="font-mono text-[11px] text-zinc-600 uppercase">
                      Last WHOIS Update
                    </span>
                    <span className="font-mono text-sm text-zinc-400">
                      {data.ownership?.lastUpdated
                        ? new Date(
                            data.ownership.lastUpdated,
                          ).toLocaleDateString()
                        : "N/A"}
                    </span>
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-2 p-3 bg-blue-500/5 border border-blue-500/10 rounded-lg">
                <Globe className="h-4 w-4 text-blue-400" />
                <p className="font-mono text-[10px] text-blue-300/80 italic">
                  Data retrieved via secure RDAP/WHOIS protocol.
                </p>
              </div>
            </div>

            <div className="flex flex-col justify-center">
              {isNexusOwned ? (
                <div className="p-6 rounded-xl border border-purple-500/20 bg-purple-500/5 text-center relative">
                  <div className="absolute top-3 right-3">
                    <Tooltip content="Immutable Nexus Ledger for verified seller listings and bid history.">
                      <Info className="h-3 w-3 text-purple-400/50" />
                    </Tooltip>
                  </div>
                  {data.ownership?.isForSale ? (
                    <>
                      <p className="font-mono text-[10px] text-purple-400 uppercase tracking-widest mb-1">
                        Nexus Listed Asking Price
                      </p>
                      <p className="font-mono text-3xl font-bold text-white tracking-tighter mb-6">
                        ${data.ownership.askingPrice?.toLocaleString()}
                      </p>
                      <Button
                        onClick={() => onContact(data.domain)}
                        className="w-full bg-purple-600 hover:bg-purple-700 text-white font-mono text-xs h-12 shadow-lg shadow-purple-900/20"
                      >
                        <Handshake className="h-4 w-4 mr-2" />
                        Initiate P2P Negotiation
                      </Button>
                    </>
                  ) : (
                    <>
                      <p className="font-mono text-sm font-bold text-white mb-2 uppercase">
                        Verified Member Asset
                      </p>
                      <p className="font-mono text-[11px] text-zinc-500 mb-6">
                        This asset is not actively listed, but the owner is a
                        Nexus member. You can send a direct buyout proposal.
                      </p>
                      <Button
                        onClick={() => onContact(data.domain)}
                        className="w-full bg-zinc-800 hover:bg-zinc-700 text-white font-mono text-xs h-12"
                      >
                        <MessageSquare className="h-4 w-4 mr-2" />
                        Send Buyout Proposal
                      </Button>
                    </>
                  )}
                </div>
              ) : (
                <div className="p-6 rounded-xl border border-zinc-800 bg-zinc-900/50 text-center">
                  <div className="h-12 w-12 rounded-full bg-zinc-800 flex items-center justify-center mx-auto mb-4">
                    <Lock className="h-5 w-5 text-zinc-500" />
                  </div>
                  <p className="font-mono text-sm font-bold text-white mb-2 uppercase">
                    External Asset
                  </p>
                  <p className="font-mono text-[11px] text-zinc-500 mb-6 leading-relaxed">
                    This domain owner is not a verified Nexus member. Direct
                    peer-to-peer negotiation is currently restricted.
                  </p>
                  <Button
                    variant="outline"
                    onClick={() =>
                      inWatchlist
                        ? removeFromWatchlist(data.domain)
                        : addToWatchlist(data.domain)
                    }
                    className="w-full font-mono text-xs border-zinc-700 text-zinc-300"
                  >
                    {inWatchlist ? "Watching Asset" : "Monitor for Listing"}
                  </Button>
                </div>
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* ML Appraisal Summary — replaces null overall score gauge */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
        <Card className="flex flex-col items-center py-8 relative">
          <div className="absolute top-4 right-4">
            <Tooltip content="NLP sentiment analysis and linguistic affinity matching.">
              <Info className="h-3 w-3 text-zinc-700" />
            </Tooltip>
          </div>
          <ScoreGauge
            value={data.score.semantic}
            label="Semantic Score"
            color="#8b5cf6"
          />
          <p className="mt-4 font-mono text-[10px] text-zinc-600 uppercase tracking-widest text-center">
            Brand Affinity
          </p>
        </Card>

        <Card className="flex flex-col items-center py-8 relative">
          <div className="absolute top-4 right-4">
            <Tooltip content="Real-time search momentum from Google Trends.">
              <Info className="h-3 w-3 text-zinc-700" />
            </Tooltip>
          </div>
          <ScoreGauge
            value={data.score.trend}
            label="Trend Momentum"
            color="#06b6d4"
          />
          <p className="mt-4 font-mono text-[10px] text-zinc-600 uppercase tracking-widest text-center">
            Search Momentum
          </p>
        </Card>

        {/* Negotiation context: tier + price */}
        <Card className="flex flex-col items-center justify-center py-8 px-5 gap-4 relative">
          <div className="absolute top-4 right-4">
            <Tooltip content="ML tier and price estimate — useful context for setting a negotiation floor.">
              <Info className="h-3 w-3 text-zinc-700" />
            </Tooltip>
          </div>
          <BarChart2 className="h-6 w-6 text-purple-400" strokeWidth={1.5} />
          <div className="text-center">
            <p className="font-mono text-[9px] text-zinc-500 uppercase tracking-widest mb-1">
              Negotiation Floor
            </p>
            <p className={cn("font-mono text-xl font-bold uppercase", tierColor(data.appraisal?.predictedTier))}>
              {data.appraisal?.predictedTier ?? "—"}
            </p>
            <p className="font-mono text-xs text-blue-400 font-semibold mt-1">
              ₹{data.appraisal?.predictedPrice?.toLocaleString("en-IN") ?? "—"}
            </p>
            <p className="font-mono text-[9px] text-zinc-600 mt-1 uppercase">
              ML estimate
            </p>
          </div>
        </Card>
      </div>
    </div>
  );

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
      className="space-y-5"
    >
      {/* Universal Domain Header */}
      <Card
        glow={
          mode === "acquisition"
            ? "blue"
            : mode === "appraisal"
              ? "green"
              : "purple"
        }
      >
        <CardContent className="py-5">
          <div className="flex flex-wrap items-start justify-between gap-4">
            <div className="flex-1 min-w-0">
              <div className="flex flex-wrap items-center gap-3 mb-2">
                <h2 className="font-mono text-xl font-bold text-white tracking-tight uppercase">
                  {data.domain}
                </h2>
                <GradeBadge grade={data.score.grade} />
                <Badge variant="default" className="font-mono text-[10px]">
                  Trust: {(data.score.confidence * 100).toFixed(0)}%
                </Badge>
                <Badge
                  variant="outline"
                  className={cn("font-mono text-[10px] border", tierBorderColor(data.appraisal?.predictedTier))}
                >
                  <span className={tierColor(data.appraisal?.predictedTier)}>
                    {data.appraisal?.predictedTier
                      ? `${data.appraisal.predictedTier.charAt(0).toUpperCase() + data.appraisal.predictedTier.slice(1)} Tier`
                      : "Unrated"}
                  </span>
                </Badge>
              </div>
              <p className="font-mono text-[11px] text-zinc-500 leading-relaxed max-w-3xl">
                {data.summary}
              </p>
              <div className="flex flex-wrap gap-2 mt-3">
                {data.tags.map((tag: string) => (
                  <span
                    key={tag}
                    className="flex items-center gap-1 rounded-md border border-zinc-800 px-2 py-0.5 font-mono text-[9px] text-zinc-600 uppercase tracking-tighter"
                  >
                    <Tag className="h-2.5 w-2.5" />
                    {tag}
                  </span>
                ))}
              </div>
            </div>

            <div className="flex items-center gap-2 shrink-0">
              <Button
                variant={inWatchlist ? "accent" : "terminal"}
                size="sm"
                className="h-8 font-mono text-[10px]"
                onClick={() =>
                  inWatchlist
                    ? removeFromWatchlist(data.domain)
                    : addToWatchlist(data.domain)
                }
              >
                {inWatchlist ? (
                  <BookmarkCheck className="h-3.5 w-3.5" />
                ) : (
                  <Bookmark className="h-3.5 w-3.5" />
                )}
                {inWatchlist ? "Watching" : "Watch"}
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* ── MODE SPECIFIC CONTENT ── */}
      <div className="w-full">
        {mode === "acquisition" && renderAcquisition()}
        {mode === "appraisal" && renderAppraisal()}
        {mode === "exchange" && renderExchange()}
      </div>

      {/* Footer Timestamp */}
      <div className="flex items-center justify-end gap-2 text-zinc-800 font-mono text-[9px] uppercase tracking-widest pt-4">
        <Activity className="h-2.5 w-2.5" />
        Analysis generated: {new Date(data.timestamp).toLocaleString()}
      </div>
    </motion.div>
  );
}

export default function TerminalPage() {
  const [terminalMode, setTerminalMode] = useState<TerminalMode>("acquisition");
  const [query, setQuery] = useState("");
  const [isQuerying, setIsQuerying] = useState(false);
  const [result, setResult] = useState<DomainValuationResponse | null>(null);
  const [validationError, setValidationError] = useState<string | null>(null);
  const [contactDomain, setContactDomain] = useState<string | null>(null);

  const [loadingPhase, setLoadingPhase] = useState<LoadingPhase>("idle");
  const [progress, setProgress] = useState(0);
  const [isComplete, setIsComplete] = useState(false);

  const { queryHistory, setLastValuation, lastValuation, lastQuery } =
    useAppStore();

  const activeResult = result ?? lastValuation;

  const runQuery = useCallback(
    async (domain: string) => {
      const clean = sanitizeDomain(domain);
      if (!clean || !clean.includes(".")) {
        setValidationError("Enter a valid domain (e.g. quantum.ai)");
        return;
      }
      setValidationError(null);
      setIsQuerying(true);
      setResult(null);
      setIsComplete(false);
      setProgress(0);
      setLoadingPhase("idle");

      const eventSource = new EventSource(
        `${API_BASE_URL}/api/domains/valuation-stream/${encodeURIComponent(clean)}`,
        { withCredentials: true },
      );

      eventSource.addEventListener("progress", (e: MessageEvent) => {
        const data = JSON.parse(e.data);
        setLoadingPhase(data.stage);
        setProgress(data.pct);
        if (data.stage === "complete") {
          setIsComplete(true);
        }
      });

      eventSource.addEventListener("complete", (e: MessageEvent) => {
        const data = JSON.parse(e.data) as DomainValuationResponse;
        setResult(data);
        setLastValuation(clean, data);
        setIsQuerying(false);
        eventSource.close();
      });

      eventSource.addEventListener("error", () => {
        setValidationError(
          "Analysis failed. Please check the domain and try again.",
        );
        setIsQuerying(false);
        eventSource.close();
      });
    },
    [setLastValuation],
  );

  function handleSubmit(e: FormEvent) {
    e.preventDefault();
    if (!isQuerying) runQuery(query);
  }

  return (
    <div className="space-y-6 w-full">
      {/* Header */}
      <div>
        <h1 className="font-mono text-lg font-bold text-white tracking-tight">
          Domain Terminal
        </h1>
        <p className="mt-1 font-mono text-xs text-zinc-600">
          Real-time registrar pricing, ML appraisal, and ownership intelligence.
        </p>
      </div>

      {/* Terminal Mode Switcher */}
      <div className="flex p-1 w-full max-w-md bg-zinc-900/50 border border-zinc-800 rounded-xl">
        {(["acquisition", "appraisal", "exchange"] as const).map((m) => (
          <button
            key={m}
            onClick={() => setTerminalMode(m)}
            className={cn(
              "flex-1 flex items-center justify-center gap-2 py-2 rounded-lg font-mono text-[10px] uppercase tracking-wider transition-all",
              terminalMode === m
                ? "bg-zinc-800 text-white shadow-sm"
                : "text-zinc-600 hover:text-zinc-400",
            )}
          >
            {m === "acquisition" && <ShoppingCart className="h-3 w-3" />}
            {m === "appraisal" && <TrendingUp className="h-3 w-3" />}
            {m === "exchange" && <Handshake className="h-3 w-3" />}
            {m}
          </button>
        ))}
      </div>

      {/* Command bar */}
      <form onSubmit={handleSubmit} className="relative">
        <div
          className={cn(
            "flex items-center rounded-xl border bg-zinc-900/80 transition-all duration-200",
            isQuerying
              ? "border-blue-500/40 shadow-[0_0_20px_-5px_rgba(59,130,246,0.3)]"
              : validationError
                ? "border-red-500/40"
                : "border-zinc-800 hover:border-zinc-600 focus-within:border-blue-500/40 focus-within:shadow-[0_0_20px_-5px_rgba(59,130,246,0.2)]",
          )}
        >
          <Search
            className="ml-4 h-4 w-4 shrink-0 text-zinc-500"
            strokeWidth={1.5}
          />
          <input
            id="terminal-search"
            type="text"
            value={query}
            onChange={(e) => {
              setQuery(e.target.value);
              setValidationError(null);
            }}
            placeholder="quantum.ai, apple.com, nexus.io..."
            disabled={isQuerying}
            autoComplete="off"
            autoFocus
            className="flex-1 bg-transparent px-4 py-4 font-mono text-sm text-white placeholder-zinc-700 outline-none disabled:opacity-50"
          />
          {query && !isQuerying && (
            <button
              type="button"
              onClick={() => setQuery("")}
              className="mr-2 text-zinc-600 hover:text-zinc-400"
            >
              <X className="h-3.5 w-3.5" />
            </button>
          )}
          <Button
            id="terminal-search-btn"
            type="submit"
            disabled={isQuerying || !query.trim()}
            className="m-1.5 h-9 px-5 font-mono text-xs"
          >
            {isQuerying ? "Analyzing..." : "Analyze"}
            {!isQuerying && <ChevronRight className="h-3.5 w-3.5" />}
          </Button>
        </div>
        {validationError && (
          <p className="mt-1.5 font-mono text-[11px] text-red-400 pl-1">
            {validationError}
          </p>
        )}
      </form>

      {/* Query history chips */}
      {queryHistory.length > 0 && (
        <div className="flex flex-wrap items-center gap-2">
          <Clock className="h-3 w-3 text-zinc-700 shrink-0" strokeWidth={1.5} />
          {queryHistory.slice(0, 6).map((q) => (
            <button
              key={q}
              onClick={() => {
                setQuery(q);
                runQuery(q);
              }}
              disabled={isQuerying}
              className={cn(
                "rounded-md border px-2.5 py-1 font-mono text-[11px] transition-colors disabled:opacity-40",
                lastQuery === q
                  ? "border-blue-500/30 bg-blue-500/8 text-blue-400"
                  : "border-zinc-800 text-zinc-600 hover:border-zinc-600 hover:text-zinc-400",
              )}
            >
              {q}
            </button>
          ))}
        </div>
      )}

      {/* SSE Progress */}
      <AnimatePresence>
        {isQuerying && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.3 }}
          >
            <SSEProgressBar
              phase={loadingPhase}
              progress={progress}
              isComplete={isComplete}
            />
          </motion.div>
        )}
      </AnimatePresence>

      {/* Loading skeletons */}
      <AnimatePresence>
        {isQuerying && !isComplete && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <ResultSkeleton />
          </motion.div>
        )}
      </AnimatePresence>

      {/* Results */}
      <AnimatePresence mode="wait">
        {!isQuerying && activeResult && (
          <ResultsPanel
            key={activeResult.domain}
            data={activeResult}
            mode={terminalMode}
            onContact={(d) => setContactDomain(d)}
            setMode={(m) => setTerminalMode(m)}
          />
        )}
      </AnimatePresence>

      {/* Inquiry Modal */}
      {contactDomain && (
        <InquiryModal
          domain={contactDomain}
          onClose={() => setContactDomain(null)}
        />
      )}

      {/* Empty state */}
      {!isQuerying && !activeResult && (
        <div className="flex flex-col items-center gap-4 py-20 text-center">
          <div className="h-16 w-16 flex items-center justify-center rounded-2xl border border-zinc-800 bg-zinc-900/40">
            <Search className="h-7 w-7 text-zinc-700" strokeWidth={1} />
          </div>
          <div>
            <p className="font-mono text-sm text-zinc-500 font-semibold">
              Enter a domain to begin
            </p>
            <p className="font-mono text-xs text-zinc-700 mt-1">
              Try <span className="text-zinc-600">quantum.ai</span> or any
              domain you want to evaluate
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
