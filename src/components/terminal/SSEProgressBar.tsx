"use client";

import { motion, AnimatePresence } from "framer-motion";
import type { LoadingPhase } from "@/types";

import { Progress } from "@/components/ui/progress";
import {
  Radio,
  Brain,
  TrendingUp,
  Cpu,
  CheckCircle2,
} from "lucide-react";

// ---------------------------------------------------------------------------
// SSEProgressBar — Visual simulation of the backend streaming pipeline
// ---------------------------------------------------------------------------

const PHASE_META: Record<string, { icon: React.ElementType; color: string }> = {
  "Scraping Registrars...":     { icon: Radio,        color: "text-blue-400" },
  "Analyzing Linguistics...":   { icon: Brain,        color: "text-purple-400" },
  "Querying Google Trends...":  { icon: TrendingUp,   color: "text-cyan-400" },
  "Synthesizing Intelligence...": { icon: Cpu,        color: "text-emerald-400" },
  "complete":                   { icon: CheckCircle2, color: "text-emerald-400" },
  "idle":                       { icon: Radio,        color: "text-zinc-500" },
};

interface SSEProgressBarProps {
  phase: LoadingPhase;
  progress: number;
  isComplete: boolean;
}

export function SSEProgressBar({ phase, progress, isComplete }: SSEProgressBarProps) {
  const meta = PHASE_META[phase] ?? PHASE_META["idle"];
  const Icon = meta.icon;

  const PHASES: LoadingPhase[] = [
    "Scraping Registrars...",
    "Analyzing Linguistics...",
    "Querying Google Trends...",
    "Synthesizing Intelligence...",
  ];
  const currentIndex = PHASES.indexOf(phase);

  return (
    <div className="w-full rounded-xl border border-zinc-800/60 bg-zinc-900/60 p-5 space-y-4">
      {/* Phase label */}
      <div className="flex items-center gap-3">
        <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-zinc-800 shrink-0">
          <Icon className={`h-4 w-4 ${meta.color}`} strokeWidth={1.5} />
        </div>
        <div className="flex-1 min-w-0">
          <AnimatePresence mode="wait">
            <motion.p
              key={phase}
              initial={{ opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -6 }}
              transition={{ duration: 0.25 }}
              className={`font-mono text-sm font-semibold ${isComplete ? "text-emerald-400" : "text-white"}`}
            >
              {isComplete ? "Analysis Complete" : phase === "idle" ? "Initializing..." : phase}
            </motion.p>
          </AnimatePresence>
          <p className="font-mono text-[10px] text-zinc-600 mt-0.5 uppercase tracking-widest">
            Intelligence Core Pipeline
          </p>
        </div>
        <span className="font-mono text-sm font-bold text-zinc-400 shrink-0">
          {Math.round(progress)}%
        </span>
      </div>

      {/* Progress bar */}
      <Progress value={progress} color={isComplete ? "green" : "gradient"} className="h-1.5" />

      {/* Step indicators */}
      <div className="flex items-center gap-2">
        {PHASES.map((p, i) => {
          const isDone = isComplete || currentIndex > i;
          const isCurrent = currentIndex === i;
          const meta2 = PHASE_META[p];
          const StepIcon = meta2.icon;

          return (
            <div key={p} className="flex items-center gap-2 flex-1 min-w-0">
              <div
                className={`flex h-5 w-5 shrink-0 items-center justify-center rounded-full border transition-all duration-300 ${
                  isDone
                    ? "border-emerald-500/40 bg-emerald-500/15"
                    : isCurrent
                    ? "border-blue-500/40 bg-blue-500/10"
                    : "border-zinc-800 bg-zinc-900"
                }`}
              >
                <StepIcon
                  className={`h-2.5 w-2.5 ${isDone ? "text-emerald-400" : isCurrent ? "text-blue-400 animate-pulse" : "text-zinc-700"}`}
                  strokeWidth={2}
                />
              </div>
              {i < PHASES.length - 1 && (
                <div
                  className={`h-px flex-1 transition-colors duration-500 ${isDone ? "bg-emerald-500/30" : "bg-zinc-800"}`}
                />
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
