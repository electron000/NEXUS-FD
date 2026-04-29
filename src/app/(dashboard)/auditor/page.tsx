"use client";

import { useState, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Papa from "papaparse";
import { FileSpreadsheet, AlertCircle, Info, Zap } from "lucide-react";
import { processAuditorRows, type AuditorRowData } from "@/services/mock";
import { DropZone } from "@/components/auditor/DropZone";
import { AuditorTable } from "@/components/auditor/AuditorTable";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";

// ---------------------------------------------------------------------------
// Auditor Page
// ---------------------------------------------------------------------------

function sanitizeDomain(raw: string): string {
  return raw.toLowerCase().replace(/^https?:\/\//, "").replace(/\/$/, "").replace(/\s/g, "").trim();
}

function hasDomainColumn(fields: string[]): string | null {
  const normalized = fields.map((f) => f.toLowerCase().trim());
  if (normalized.includes("domain")) return fields[normalized.indexOf("domain")];
  if (normalized.includes("domain name")) return fields[normalized.indexOf("domain name")];
  return null;
}

export default function AuditorPage() {
  const [isProcessing, setIsProcessing] = useState(false);
  const [parseProgress, setParseProgress] = useState(0);
  const [rows, setRows] = useState<AuditorRowData[] | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [rawCount, setRawCount] = useState<number>(0);

  const handleFile = useCallback((file: File) => {
    setIsProcessing(true);
    setErrorMessage(null);
    setRows(null);
    setParseProgress(0);
    setRawCount(0);

    let headerField: string | null = null;
    const domainBuffer: string[] = [];
    let totalRows = 0;

    Papa.parse<Record<string, string>>(file, {
      header: true,
      skipEmptyLines: true,
      worker: false, // keep main thread for demo visibility
      step: (result, parser) => {
        totalRows++;

        // Validate header on first row
        if (totalRows === 1) {
          const fields = result.meta.fields ?? [];
          headerField = hasDomainColumn(fields);
          if (!headerField) {
            parser.abort();
            setIsProcessing(false);
            setErrorMessage('Missing required column: "Domain" or "Domain Name"');
            return;
          }
        }

        // Collect up to 50 valid domains (FR-14, Section 10)
        if (domainBuffer.length < 50) {
          const raw = result.data[headerField ?? ""] ?? "";
          const cleaned = sanitizeDomain(raw);
          // XSS sanitization: strip script injection attempts (Section 12)
          const safe = cleaned.replace(/<[^>]*>/g, "").replace(/[<>"']/g, "");
          if (safe && safe.includes(".") && safe.length < 128) {
            domainBuffer.push(safe);
          }
        }

        // Simulate progress for user feedback
        setParseProgress(Math.min(99, Math.round((domainBuffer.length / 50) * 80) + 10));
      },

      complete: () => {
        setRawCount(totalRows);
        setParseProgress(100);

        // Attach mock valuations (NFR-03 latency for processing feel)
        setTimeout(() => {
          const processed = processAuditorRows(domainBuffer);
          setRows(processed);
          setIsProcessing(false);
        }, 800);
      },

      error: (err) => {
        setIsProcessing(false);
        setErrorMessage(`Parse error: ${err.message}`);
      },
    });
  }, []);

  return (
    <div className="space-y-6 w-full">
      {/* Header */}
      <div className="flex items-start justify-between gap-4">
        <div>
          <h1 className="font-mono text-lg font-bold text-white tracking-tight">
            Portfolio Auditor
            <span className="ml-2 text-zinc-600">// Bulk Analysis Engine</span>
          </h1>
          <p className="mt-1 font-mono text-xs text-zinc-600">
            Upload a CSV with a "Domain" column · Client-side parsing · Up to 50 rows processed
          </p>
        </div>
        <Badge variant="primary" className="hidden sm:flex items-center gap-1.5 shrink-0">
          <Zap className="h-3 w-3" strokeWidth={2} />
          Browser-side compute
        </Badge>
      </div>

      {/* Upload area */}
      <DropZone
        onFileAccepted={handleFile}
        isProcessing={isProcessing}
        rowCount={rows?.length}
        errorMessage={errorMessage}
      />

      {/* CSV format hint */}
      {!rows && !isProcessing && !errorMessage && (
        <div className="flex items-start gap-2 rounded-lg border border-blue-500/15 bg-blue-500/5 px-4 py-3">
          <Info className="h-3.5 w-3.5 shrink-0 mt-0.5 text-blue-500" strokeWidth={1.5} />
          <div className="font-mono text-[11px] text-zinc-500">
            <span className="text-zinc-300 font-semibold">Required CSV format:</span>{" "}
            Your file must contain a header row with either <code className="text-blue-400">Domain</code> or{" "}
            <code className="text-blue-400">Domain Name</code> as a column. Additional columns are ignored.{" "}
            The first 50 valid domain rows will be processed and enriched with simulated Nexus valuations.
          </div>
        </div>
      )}

      {/* Parsing progress */}
      <AnimatePresence>
        {isProcessing && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
          >
            <Card>
              <CardContent className="py-5 space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <FileSpreadsheet className="h-4 w-4 text-cyan-400 animate-pulse" strokeWidth={1.5} />
                    <span className="font-mono text-xs text-zinc-400">
                      Parsing CSV stream...
                    </span>
                  </div>
                  <span className="font-mono text-xs text-zinc-600">{Math.round(parseProgress)}%</span>
                </div>
                <Progress value={parseProgress} color="cyan" />
                <p className="font-mono text-[10px] text-zinc-700">
                  Chunking rows · Validating domain strings · Attaching Nexus valuations
                </p>
              </CardContent>
            </Card>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Results */}
      <AnimatePresence>
        {rows && rows.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
            className="space-y-4"
          >
            {/* Stats bar */}
            <div className="flex flex-wrap items-center gap-4">
              <div className="flex items-center gap-2">
                <Badge variant="positive">{rows.length} valuations generated</Badge>
                {rawCount > rows.length && (
                  <Badge variant="default">{rawCount} rows total (capped at 50)</Badge>
                )}
              </div>
              <div className="ml-auto flex items-center gap-3">
                <span className="font-mono text-[10px] text-zinc-600">Avg. score:</span>
                <span className="font-mono text-xs font-semibold text-white">
                  {Math.round(rows.reduce((a, r) => a + r.semanticScore, 0) / rows.length)}/100
                </span>
                <span className="font-mono text-[10px] text-zinc-600">Best est.:</span>
                <span className="font-mono text-xs font-semibold text-emerald-400">
                  ${Math.max(...rows.map(r => r.simulatedValuation)).toLocaleString()}
                </span>
              </div>
            </div>

            {/* Table */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <FileSpreadsheet className="h-3.5 w-3.5 text-blue-400" strokeWidth={1.5} />
                  Bulk Portfolio Analysis
                </CardTitle>
              </CardHeader>
              <CardContent className="pt-1">
                <AuditorTable data={rows} />
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
            exit={{ opacity: 0 }}
            className="flex items-start gap-3 rounded-xl border border-red-500/20 bg-red-500/5 p-4"
          >
            <AlertCircle className="h-4 w-4 shrink-0 mt-0.5 text-red-400" strokeWidth={1.5} />
            <div>
              <p className="font-mono text-sm font-semibold text-red-400">Parse Error</p>
              <p className="font-mono text-xs text-zinc-500 mt-1">{errorMessage}</p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
