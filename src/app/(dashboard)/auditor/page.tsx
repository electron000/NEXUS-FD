"use client";

import { useState, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { FileSpreadsheet, AlertCircle, Zap, Upload, RefreshCcw } from "lucide-react";
import { DropZone } from "@/components/auditor/DropZone";
import { ManualAuditorTable } from "@/components/auditor/ManualAuditorTable";
import { AuditorTable } from "@/components/auditor/AuditorTable";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";

import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

import { useAppStore } from "@/store/useAppStore";
import { uploadPortfolioCsv, getPortfolioJob, analyzeManualPortfolio } from "@/services";
import type { AuditorResult } from "@/types";


// ---------------------------------------------------------------------------
// Auditor Page
// ---------------------------------------------------------------------------


const INITIAL_ROWS = Array(10).fill(null).map(() => ({ domain: "", purchasePrice: "" }));

export default function AuditorPage() {
  const [isProcessing, setIsProcessing] = useState(false);
  const [parseProgress, setParseProgress] = useState(0);
  const [results, setResults] = useState<AuditorResult[] | null>(null);


  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [manualRows, setManualRows] = useState(INITIAL_ROWS);
  const [showCsvUpload, setShowCsvUpload] = useState(false);
  const { sessionToken } = useAppStore();

  const startPolling = useCallback((jobId: string) => {
    const poll = setInterval(async () => {
      try {
        const job = await getPortfolioJob<AuditorResult>(jobId, sessionToken!);

        
        if (job.status === 'complete') {
          setResults(job.results || []);
          setIsProcessing(false);
          setParseProgress(100);
          clearInterval(poll);
        } else if (job.status === 'failed') {
          setErrorMessage(job.error || "Analysis failed.");
          setIsProcessing(false);
          clearInterval(poll);
        } else {
          setParseProgress(prev => Math.min(prev + 5, 95));
        }
      } catch (err) {
        console.error("Polling error", err);
      }
    }, 2000);
  }, [sessionToken]);

  const handleManualAnalyze = async () => {
    if (!sessionToken) {
      setErrorMessage("Please log in to use the Auditor.");
      return;
    }

    const entries = manualRows
      .filter(r => r.domain.trim() !== "")
      .map(r => ({
        domain: r.domain.trim(),
        purchasePrice: r.purchasePrice ? parseFloat(r.purchasePrice) : undefined
      }));

    if (entries.length === 0) return;

    setIsProcessing(true);
    setErrorMessage(null);
    setResults(null);
    setParseProgress(10);

    try {
      const { jobId } = await analyzeManualPortfolio<AuditorResult>(entries, sessionToken);
      startPolling(jobId);
    } catch (err: unknown) {
      setIsProcessing(false);
      setErrorMessage(err instanceof Error ? err.message : "Analysis failed.");
    }
  };

  const handleCsvUpload = useCallback(async (file: File) => {
    if (!sessionToken) {
      setErrorMessage("Please log in to use the Auditor.");
      return;
    }

    setIsProcessing(true);
    setErrorMessage(null);
    setResults(null);
    setParseProgress(10);
    setShowCsvUpload(false);

    try {
      const { jobId } = await uploadPortfolioCsv(file, sessionToken);
      startPolling(jobId);
    } catch (err: unknown) {
      setIsProcessing(false);
      setErrorMessage(err instanceof Error ? err.message : "Upload failed.");
    }
  }, [sessionToken, startPolling]);


  const reset = () => {
    setResults(null);
    setManualRows(INITIAL_ROWS);
    setErrorMessage(null);
  };

  return (
    <div className="space-y-6 w-full max-w-6xl mx-auto pb-20">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="font-mono text-lg font-bold text-white tracking-tight">
            Portfolio Auditor
            <span className="ml-2 text-zinc-600">- Bulk Analysis Engine</span>
          </h1>
          <p className="mt-1 font-mono text-xs text-zinc-600">
            Audit your digital asset portfolio with institutional-grade ML intelligence
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant="terminal"
            size="sm"
            className="gap-2"
            onClick={() => setShowCsvUpload(!showCsvUpload)}
          >
            <Upload className="h-3.5 w-3.5" />
            Bulk CSV Upload
          </Button>
          {results && (
            <Button variant="ghost" size="icon-sm" onClick={reset}>
              <RefreshCcw className="h-3.5 w-3.5 text-zinc-600" />
            </Button>
          )}
        </div>
      </div>

      {/* Manual Entry Table or CSV Upload */}
      <AnimatePresence mode="wait">
        {showCsvUpload ? (
          <motion.div
            key="csv"
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
          >
            <DropZone
              onFileAccepted={handleCsvUpload}
              isProcessing={isProcessing}
              rowCount={results?.length}
              errorMessage={errorMessage}
            />
          </motion.div>
        ) : !results && !isProcessing ? (
          <motion.div
            key="manual"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <ManualAuditorTable
              rows={manualRows}
              onChange={setManualRows}
              onAnalyze={handleManualAnalyze}
              isProcessing={isProcessing}
            />
          </motion.div>
        ) : null}
      </AnimatePresence>

      {/* Processing State */}
      <AnimatePresence>
        {isProcessing && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-4"
          >
            <Card className="border-blue-500/20 bg-blue-500/5">
              <CardContent className="py-8 space-y-6 flex flex-col items-center text-center">
                <div className="relative">
                  <div className="absolute inset-0 animate-ping rounded-full bg-blue-500/20" />
                  <div className="relative flex h-16 w-16 items-center justify-center rounded-full bg-zinc-900 border border-blue-500/30">
                    <Zap className="h-8 w-8 text-blue-400" fill="currentColor" />
                  </div>
                </div>
                <div className="space-y-2 max-w-md">
                  <h3 className="font-mono text-sm font-bold text-white uppercase tracking-widest">
                    Nexus Intelligence Core Analysis
                  </h3>
                  <p className="font-mono text-[11px] text-zinc-500 leading-relaxed">
                    Executing high-dimensional linguistic analysis and registrar arbitrage simulations across your portfolio batch.
                  </p>
                </div>
                <div className="w-full max-w-sm space-y-2">
                  <div className="flex items-center justify-between font-mono text-[10px] text-zinc-600">
                    <span>PROGRESS</span>
                    <span>{Math.round(parseProgress)}%</span>
                  </div>
                  <Progress value={parseProgress} color="blue" className="h-1" />
                </div>
              </CardContent>
            </Card>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Results View */}
      <AnimatePresence>
        {results && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-6"
          >
            {/* Summary Stats */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              {[
                { label: "Assets Audited", value: results.length, color: "text-blue-400" },
                { label: "Avg. Grade", value: results.reduce((a, r) => a + r.simulatedValuation, 0) / results.length > 500 ? "A" : "B", color: "text-emerald-400" },
                { label: "Total Est. Value", value: `$${results.reduce((a, r) => a + r.simulatedValuation, 0).toLocaleString()}`, color: "text-white" },
              ].map((stat, i) => (
                <Card key={i} className="bg-zinc-900/40 border-zinc-800/50">
                  <CardContent className="p-4 flex flex-col items-center justify-center">
                    <span className="font-mono text-[10px] text-zinc-600 uppercase tracking-widest">{stat.label}</span>
                    <span className={cn("mt-1 font-mono text-xl font-bold", stat.color)}>{stat.value}</span>
                  </CardContent>
                </Card>
              ))}
            </div>

            {/* Main Results Table */}
            <Card className="border-zinc-800/80 shadow-2xl shadow-black/40">
              <CardHeader className="border-b border-zinc-800/50 bg-zinc-900/40">
                <CardTitle className="flex items-center gap-2 font-mono text-xs uppercase tracking-widest">
                  <FileSpreadsheet className="h-3.5 w-3.5 text-blue-500" strokeWidth={2} />
                  Analysis Report
                </CardTitle>
              </CardHeader>
              <CardContent className="pt-0 px-0">
                <AuditorTable data={results} />
              </CardContent>
            </Card>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Error state */}
      <AnimatePresence>
        {errorMessage && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="flex items-start gap-3 rounded-xl border border-red-500/20 bg-red-500/5 p-4"
          >
            <AlertCircle className="h-4 w-4 shrink-0 mt-0.5 text-red-400" strokeWidth={1.5} />
            <div>
              <p className="font-mono text-sm font-semibold text-red-400">Analysis Error</p>
              <p className="font-mono text-xs text-zinc-500 mt-1">{errorMessage}</p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

