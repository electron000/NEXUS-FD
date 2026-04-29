"use client";

import { useState, useEffect, useRef } from "react";

// ---------------------------------------------------------------------------
// TYPES
// ---------------------------------------------------------------------------

export type LoadingPhase =
  | "idle"
  | "Scraping Registrars..."
  | "Analyzing Linguistics..."
  | "Querying Google Trends..."
  | "Synthesizing Intelligence..."
  | "complete";

interface SSEMockResult {
  loadingPhase: LoadingPhase;
  isComplete: boolean;
  progress: number; // 0–100
}

// Phase definitions: label and duration before advancing to the next phase
const PHASES: { label: LoadingPhase; duration: number }[] = [
  { label: "Scraping Registrars...",      duration: 800 },
  { label: "Analyzing Linguistics...",    duration: 800 },
  { label: "Querying Google Trends...",   duration: 800 },
  { label: "Synthesizing Intelligence...", duration: 600 },
];

// ---------------------------------------------------------------------------
// HOOK
// ---------------------------------------------------------------------------

/**
 * useSSEMock
 *
 * Simulates a Server-Sent Events stream by stepping through sequential
 * loading phases via chained setTimeout calls. Automatically cleans up
 * all pending timers on component unmount to prevent memory leaks and
 * stale state updates (NFR-10, Section 13).
 *
 * @param isQuerying - Set to true to start the simulation; false to reset.
 */
export function useSSEMock(isQuerying: boolean): SSEMockResult {
  const [loadingPhase, setLoadingPhase] = useState<LoadingPhase>("idle");
  const [isComplete, setIsComplete] = useState(false);
  const [progress, setProgress] = useState(0);
  const timerRefs = useRef<ReturnType<typeof setTimeout>[]>([]);

  // Clear all pending timers — called on cleanup and on reset
  const clearAllTimers = () => {
    timerRefs.current.forEach(clearTimeout);
    timerRefs.current = [];
  };

  useEffect(() => {
    if (!isQuerying) {
      clearAllTimers();
      setLoadingPhase("idle");
      setIsComplete(false);
      setProgress(0);
      return;
    }

    // Reset to start state
    setIsComplete(false);
    setProgress(0);
    setLoadingPhase(PHASES[0].label);

    let elapsed = 0;
    const totalDuration = PHASES.reduce((sum, p) => sum + p.duration, 0);

    // Schedule each subsequent phase transition
    PHASES.forEach((phase, index) => {
      elapsed += phase.duration;
      const pct = Math.round(((index + 1) / PHASES.length) * 90);

      const phaseTimer = setTimeout(() => {
        const nextPhase = PHASES[index + 1];
        if (nextPhase) {
          setLoadingPhase(nextPhase.label);
        }
        setProgress(pct);
      }, elapsed);

      timerRefs.current.push(phaseTimer);
    });

    // Final completion — slight delay past the last phase to allow the
    // getDomainValuation Promise to settle alongside the animation
    const completeTimer = setTimeout(() => {
      setLoadingPhase("complete");
      setIsComplete(true);
      setProgress(100);
    }, totalDuration + 200);

    timerRefs.current.push(completeTimer);

    // Smooth progress interpolation between phase milestones
    const progressTimer = setInterval(() => {
      setProgress((prev) => Math.min(prev + 0.6, 95));
    }, 50);
    timerRefs.current.push(progressTimer);

    return () => {
      clearAllTimers();
      clearInterval(progressTimer);
    };

  }, [isQuerying]);

  return { loadingPhase, isComplete, progress };
}
