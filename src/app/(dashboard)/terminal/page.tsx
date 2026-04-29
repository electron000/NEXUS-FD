"use client";

import { useState, useCallback, FormEvent } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Search, Bookmark, BookmarkCheck, Tag, Clock,
  ChevronRight, Info, X,
} from "lucide-react";
import { getDomainValuation, type DomainValuationResponse } from "@/services/mock";
import { useSSEMock } from "@/hooks/useSSEMock";
import { useAppStore } from "@/store/useAppStore";
import { SSEProgressBar } from "@/components/terminal/SSEProgressBar";
import { ScoreGauge } from "@/components/terminal/ScoreGauge";
import { TCOChart } from "@/components/terminal/TCOChart";
import { ArbitrageTable } from "@/components/terminal/ArbitrageTable";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { GradeBadge, Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

// ---------------------------------------------------------------------------
// Demo domain hints
// ---------------------------------------------------------------------------

const DEMO_DOMAINS = ["quantum.ai", "apple.com", "nexus.io", "matrix.ai", "stripe.com"];

// ---------------------------------------------------------------------------
// Domain input sanitizer
// ---------------------------------------------------------------------------

function sanitizeDomain(raw: string): string {
  return raw.toLowerCase().replace(/^https?:\/\//, "").replace(/\/$/, "").trim();
}

// ---------------------------------------------------------------------------
// Loading skeletons
// ---------------------------------------------------------------------------

function ResultSkeleton() {
  return (
    <div className="space-y-5">
      <div className="grid grid-cols-3 gap-4">
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

function ResultsPanel({ data }: { data: DomainValuationResponse }) {
  const { addToWatchlist, removeFromWatchlist, isInWatchlist } = useAppStore();
  const inWatchlist = isInWatchlist(data.domain);

  const overallColor =
    data.score.overall >= 80 ? "#22c55e" :
    data.score.overall >= 60 ? "#3b82f6" :
    data.score.overall >= 40 ? "#f59e0b" : "#ef4444";

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
      className="space-y-5"
    >
      {/* Domain header */}
      <Card glow="blue">
        <CardContent className="py-5">
          <div className="flex flex-wrap items-start gap-4">
            <div className="flex-1 min-w-0">
              <div className="flex flex-wrap items-center gap-3 mb-2">
                <h2 className="font-mono text-xl font-bold text-white tracking-tight">
                  {data.domain}
                </h2>
                <GradeBadge grade={data.score.grade} />
                <Badge variant="default" className="font-mono text-[10px]">
                  Confidence: {(data.score.confidence * 100).toFixed(0)}%
                </Badge>
              </div>
              <p className="font-mono text-xs text-zinc-500 leading-relaxed">{data.summary}</p>
              {/* Tags */}
              <div className="flex flex-wrap gap-2 mt-3">
                {data.tags.map((tag) => (
                  <span key={tag} className="flex items-center gap-1 rounded-md border border-zinc-800 px-2 py-0.5 font-mono text-[10px] text-zinc-600">
                    <Tag className="h-2.5 w-2.5" />
                    {tag}
                  </span>
                ))}
              </div>
            </div>

            {/* Actions */}
            <div className="flex items-center gap-2 shrink-0">
              <Button
                id="terminal-watchlist-btn"
                variant={inWatchlist ? "accent" : "terminal"}
                size="sm"
                onClick={() => inWatchlist ? removeFromWatchlist(data.domain) : addToWatchlist(data.domain)}
              >
                {inWatchlist
                  ? <><BookmarkCheck className="h-3.5 w-3.5" /> Watching</>
                  : <><Bookmark className="h-3.5 w-3.5" /> Watch</>
                }
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Nexus Value Score gauges */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Info className="h-3.5 w-3.5 text-blue-400" strokeWidth={1.5} />
            Nexus Value Score — {data.score.overall}/100
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 py-2">
            <div className="flex flex-col items-center">
              <ScoreGauge value={data.score.quantitative} label="Quantitative Baseline" color={overallColor} />
              <p className="mt-2 text-center font-mono text-[10px] text-zinc-600">
                XGBoost Pricing Model
              </p>
            </div>
            <div className="flex flex-col items-center">
              <ScoreGauge value={data.score.semantic} label="Semantic Score" color="#8b5cf6" />
              <p className="mt-2 text-center font-mono text-[10px] text-zinc-600">
                Gemini Linguistic Analysis
              </p>
            </div>
            <div className="flex flex-col items-center">
              <ScoreGauge value={data.score.trend} label="Trend Momentum" color="#06b6d4" />
              <p className="mt-2 text-center font-mono text-[10px] text-zinc-600">
                PyTrends Velocity
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Arbitrage Table */}
      <Card>
        <CardHeader>
          <CardTitle>Registrar Arbitrage</CardTitle>
        </CardHeader>
        <CardContent className="pt-1">
          <ArbitrageTable data={data.pricing} />
        </CardContent>
      </Card>

      {/* TCO Chart */}
      <Card>
        <CardHeader>
          <CardTitle>5-Year TCO Trajectory</CardTitle>
        </CardHeader>
        <CardContent>
          <TCOChart data={data.tco} />
        </CardContent>
      </Card>

      {/* Timestamp */}
      <p className="font-mono text-[10px] text-zinc-700 text-right">
        Analysis generated: {new Date(data.timestamp).toLocaleString()}
      </p>
    </motion.div>
  );
}

// ---------------------------------------------------------------------------
// Terminal Page
// ---------------------------------------------------------------------------

export default function TerminalPage() {
  const [query, setQuery] = useState("");
  const [isQuerying, setIsQuerying] = useState(false);
  const [result, setResult] = useState<DomainValuationResponse | null>(null);
  const [validationError, setValidationError] = useState<string | null>(null);

  const { loadingPhase, isComplete, progress } = useSSEMock(isQuerying);
  const { queryHistory, setLastValuation, lastValuation, lastQuery } = useAppStore();

  // Restore last session result
  const activeResult = result ?? lastValuation;

  const runQuery = useCallback(async (domain: string) => {
    const clean = sanitizeDomain(domain);
    if (!clean || !clean.includes(".")) {
      setValidationError("Enter a valid domain (e.g. quantum.ai)");
      return;
    }
    setValidationError(null);
    setIsQuerying(true);
    setResult(null);

    try {
      const data = await getDomainValuation(clean);
      setResult(data);
      setLastValuation(clean, data);
    } finally {
      setIsQuerying(false);
    }
  }, [setLastValuation]);

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
          <span className="ml-2 text-zinc-600">// Valuation Engine</span>
        </h1>
        <p className="mt-1 font-mono text-xs text-zinc-600">
          Enter any domain to receive a full Nexus Intelligence Core analysis
        </p>
      </div>

      {/* Command bar */}
      <form onSubmit={handleSubmit} className="relative">
        <div className={cn(
          "flex items-center rounded-xl border bg-zinc-900/80 transition-all duration-200",
          isQuerying
            ? "border-blue-500/40 shadow-[0_0_20px_-5px_rgba(59,130,246,0.3)]"
            : validationError
            ? "border-red-500/40"
            : "border-zinc-800 hover:border-zinc-600 focus-within:border-blue-500/40 focus-within:shadow-[0_0_20px_-5px_rgba(59,130,246,0.2)]"
        )}>
          <Search className="ml-4 h-4 w-4 shrink-0 text-zinc-500" strokeWidth={1.5} />
          <input
            id="terminal-search"
            type="text"
            value={query}
            onChange={(e) => { setQuery(e.target.value); setValidationError(null); }}
            placeholder="quantum.ai, apple.com, nexus.io..."
            disabled={isQuerying}
            autoComplete="off"
            autoFocus
            className="flex-1 bg-transparent px-4 py-4 font-mono text-sm text-white placeholder-zinc-700 outline-none disabled:opacity-50"
          />
          {query && !isQuerying && (
            <button type="button" onClick={() => setQuery("")} className="mr-2 text-zinc-600 hover:text-zinc-400">
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
          <p className="mt-1.5 font-mono text-[11px] text-red-400 pl-1">{validationError}</p>
        )}
      </form>

      {/* Demo quick-access chips */}
      <div className="flex flex-wrap items-center gap-2">
        <span className="font-mono text-[10px] text-zinc-700 uppercase tracking-wider">Try:</span>
        {DEMO_DOMAINS.map((d) => (
          <button
            key={d}
            onClick={() => { setQuery(d); runQuery(d); }}
            disabled={isQuerying}
            className="rounded-md border border-zinc-800 px-2.5 py-1 font-mono text-[11px] text-zinc-500 hover:border-zinc-600 hover:text-zinc-300 transition-colors disabled:opacity-40"
          >
            {d}
          </button>
        ))}
      </div>

      {/* Query history chips */}
      {queryHistory.length > 0 && (
        <div className="flex flex-wrap items-center gap-2">
          <Clock className="h-3 w-3 text-zinc-700 shrink-0" strokeWidth={1.5} />
          {queryHistory.slice(0, 6).map((q) => (
            <button
              key={q}
              onClick={() => { setQuery(q); runQuery(q); }}
              disabled={isQuerying}
              className={cn(
                "rounded-md border px-2.5 py-1 font-mono text-[11px] transition-colors disabled:opacity-40",
                lastQuery === q
                  ? "border-blue-500/30 bg-blue-500/8 text-blue-400"
                  : "border-zinc-800 text-zinc-600 hover:border-zinc-600 hover:text-zinc-400"
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
            <SSEProgressBar phase={loadingPhase} progress={progress} isComplete={isComplete} />
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
          <ResultsPanel key={activeResult.domain} data={activeResult} />
        )}
      </AnimatePresence>

      {/* Empty state */}
      {!isQuerying && !activeResult && (
        <div className="flex flex-col items-center gap-4 py-20 text-center">
          <div className="h-16 w-16 flex items-center justify-center rounded-2xl border border-zinc-800 bg-zinc-900/40">
            <Search className="h-7 w-7 text-zinc-700" strokeWidth={1} />
          </div>
          <div>
            <p className="font-mono text-sm text-zinc-500 font-semibold">Ready for analysis</p>
            <p className="font-mono text-xs text-zinc-700 mt-1">
              Enter a domain above or click a demo to begin
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
