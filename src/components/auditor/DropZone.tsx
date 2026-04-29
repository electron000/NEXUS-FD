"use client";

import { useState, useRef, useCallback } from "react";
import { Upload, FileSpreadsheet, CheckCircle2, AlertCircle, X } from "lucide-react";
import { cn } from "@/lib/utils";

// ---------------------------------------------------------------------------
// DropZone — Drag-and-drop CSV upload zone
// ---------------------------------------------------------------------------

type DropState = "idle" | "dragging" | "processing" | "done" | "error";

interface DropZoneProps {
  onFileAccepted: (file: File) => void;
  isProcessing: boolean;
  rowCount?: number;
  errorMessage?: string | null;
}

export function DropZone({ onFileAccepted, isProcessing, rowCount, errorMessage }: DropZoneProps) {
  const [dragState, setDragState] = useState<DropState>("idle");
  const [fileName, setFileName] = useState<string | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const state: DropState = isProcessing
    ? "processing"
    : errorMessage
    ? "error"
    : rowCount !== undefined
    ? "done"
    : dragState;

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setDragState("dragging");
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setDragState("idle");
  }, []);

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      setDragState("idle");
      const file = e.dataTransfer.files[0];
      if (file && (file.name.endsWith(".csv") || file.type === "text/csv")) {
        setFileName(file.name);
        onFileAccepted(file);
      } else {
        setDragState("error");
      }
    },
    [onFileAccepted]
  );

  const handleFileInput = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      if (file) {
        setFileName(file.name);
        onFileAccepted(file);
      }
    },
    [onFileAccepted]
  );

  function reset() {
    setFileName(null);
    setDragState("idle");
    if (inputRef.current) inputRef.current.value = "";
  }

  const borderClass =
    state === "dragging"  ? "border-blue-500/60 bg-blue-500/5 shadow-[0_0_30px_-5px_rgba(59,130,246,0.3)]" :
    state === "processing" ? "border-cyan-500/40 bg-cyan-500/4" :
    state === "done"       ? "border-emerald-500/40 bg-emerald-500/4" :
    state === "error"      ? "border-red-500/40 bg-red-500/4" :
    "border-zinc-800 hover:border-zinc-600 hover:bg-zinc-800/20";

  return (
    <div
      id="auditor-dropzone"
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
      onClick={() => state === "idle" && inputRef.current?.click()}
      className={cn(
        "relative flex flex-col items-center justify-center gap-4 rounded-xl border-2 border-dashed p-8 sm:p-12 transition-all duration-300 cursor-pointer select-none",
        borderClass,
        state !== "idle" && "cursor-default"
      )}
    >
      <input
        ref={inputRef}
        type="file"
        accept=".csv,text/csv"
        className="sr-only"
        onChange={handleFileInput}
        id="auditor-file-input"
      />

      {/* Icon */}
      <div className={cn(
        "flex h-14 w-14 items-center justify-center rounded-2xl border transition-colors",
        state === "done"       ? "border-emerald-500/30 bg-emerald-500/10" :
        state === "error"      ? "border-red-500/30 bg-red-500/10" :
        state === "processing" ? "border-cyan-500/30 bg-cyan-500/10" :
        state === "dragging"   ? "border-blue-500/30 bg-blue-500/10" :
        "border-zinc-800 bg-zinc-900"
      )}>
        {state === "done"       ? <CheckCircle2 className="h-6 w-6 text-emerald-400" strokeWidth={1.5} /> :
         state === "error"      ? <AlertCircle className="h-6 w-6 text-red-400" strokeWidth={1.5} /> :
         state === "processing" ? <FileSpreadsheet className="h-6 w-6 text-cyan-400 animate-pulse" strokeWidth={1.5} /> :
         <Upload className={cn("h-6 w-6", state === "dragging" ? "text-blue-400" : "text-zinc-500")} strokeWidth={1.5} />
        }
      </div>

      {/* Text */}
      <div className="text-center space-y-1">
        {state === "idle" && (
          <>
            <p className="font-mono text-sm font-semibold text-white">
              Drop your CSV here, or click to browse
            </p>
            <p className="font-mono text-xs text-zinc-600">
              Accepts .csv · Requires "Domain" or "Domain Name" column · Up to 10,000 rows (first 50 processed)
            </p>
          </>
        )}
        {state === "dragging" && (
          <p className="font-mono text-sm font-semibold text-blue-400 animate-pulse-soft">
            Release to upload
          </p>
        )}
        {state === "processing" && (
          <>
            <p className="font-mono text-sm font-semibold text-cyan-400">
              Parsing {fileName}...
            </p>
            <p className="font-mono text-xs text-zinc-600">
              Streaming rows · Attaching valuations
            </p>
          </>
        )}
        {state === "done" && (
          <>
            <p className="font-mono text-sm font-semibold text-emerald-400">
              {rowCount} domains processed
            </p>
            <p className="font-mono text-xs text-zinc-600">{fileName}</p>
          </>
        )}
        {state === "error" && (
          <>
            <p className="font-mono text-sm font-semibold text-red-400">
              {errorMessage ?? "Invalid file — please upload a .csv"}
            </p>
            <p className="font-mono text-xs text-zinc-600">
              Required: "Domain" or "Domain Name" column header
            </p>
          </>
        )}
      </div>

      {/* Clear button */}
      {(state === "done" || state === "error") && (
        <button
          onClick={(e) => { e.stopPropagation(); reset(); }}
          className="absolute top-3 right-3 flex h-6 w-6 items-center justify-center rounded-md bg-zinc-800 text-zinc-500 hover:bg-zinc-700 hover:text-zinc-300 transition-colors"
        >
          <X className="h-3.5 w-3.5" />
        </button>
      )}
    </div>
  );
}
