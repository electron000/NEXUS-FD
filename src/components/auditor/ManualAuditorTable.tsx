"use client";

import { Trash2, Plus, Zap } from "lucide-react";

import { Button } from "@/components/ui/button";


interface ManualRow {
  domain: string;
  purchasePrice: string;
}

interface ManualAuditorTableProps {
  rows: ManualRow[];
  onChange: (rows: ManualRow[]) => void;
  onAnalyze: () => void;
  isProcessing: boolean;
}

export function ManualAuditorTable({ rows, onChange, onAnalyze, isProcessing }: ManualAuditorTableProps) {
  
  const updateRow = (index: number, field: keyof ManualRow, value: string) => {
    const newRows = [...rows];
    newRows[index][field] = value;
    
    // Auto-expand logic: if we edit a row within the last 2 rows, add 10 more
    if (index >= newRows.length - 1 && value.trim() !== "") {
      for (let i = 0; i < 10; i++) {
        newRows.push({ domain: "", purchasePrice: "" });
      }
    }
    
    onChange(newRows);
  };

  const removeRow = (index: number) => {
    if (rows.length <= 1) return;
    const newRows = rows.filter((_, i) => i !== index);
    onChange(newRows);
  };

  const addTenRows = () => {
    const newRows = [...rows];
    for (let i = 0; i < 10; i++) {
      newRows.push({ domain: "", purchasePrice: "" });
    }
    onChange(newRows);
  };

  const activeCount = rows.filter(r => r.domain.trim() !== "").length;

  return (
    <div className="space-y-4">
      <div className="overflow-hidden rounded-xl border border-zinc-800 bg-zinc-900/40">
        <table className="w-full border-collapse text-left">
          <thead>
            <tr className="border-b border-zinc-800 bg-zinc-900/60 font-mono text-[10px] uppercase tracking-widest text-zinc-500">
              <th className="px-4 py-3 font-medium w-12 text-center">#</th>
              <th className="px-4 py-3 font-medium">Domain Name</th>
              <th className="px-4 py-3 font-medium w-40">Purchase Price ($)</th>
              <th className="px-4 py-3 font-medium w-12 text-center"></th>
            </tr>
          </thead>
          <tbody className="divide-y divide-zinc-800/50">
            {rows.map((row, idx) => (
              <tr key={idx} className="group hover:bg-white/[0.02] transition-colors">
                <td className="px-4 py-2 text-center font-mono text-[10px] text-zinc-700 group-hover:text-zinc-500">
                  {idx + 1}
                </td>
                <td className="px-2 py-1">
                  <input
                    type="text"
                    value={row.domain}
                    onChange={(e) => updateRow(idx, "domain", e.target.value)}
                    placeholder="e.g. quantum-asset.ai"
                    className="w-full bg-transparent px-2 py-1.5 font-mono text-xs text-white placeholder:text-zinc-700 focus:outline-none focus:ring-1 focus:ring-blue-500/30 rounded"
                  />
                </td>
                <td className="px-2 py-1">
                  <div className="relative">
                    <span className="absolute left-2 top-1/2 -translate-y-1/2 text-zinc-700 font-mono text-xs">$</span>
                    <input
                      type="number"
                      value={row.purchasePrice}
                      onChange={(e) => updateRow(idx, "purchasePrice", e.target.value)}
                      placeholder="0.00"
                      className="w-full bg-transparent pl-5 pr-2 py-1.5 font-mono text-xs text-white placeholder:text-zinc-700 focus:outline-none focus:ring-1 focus:ring-blue-500/30 rounded [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                    />
                  </div>
                </td>
                <td className="px-2 py-1 text-center">
                  <button
                    onClick={() => removeRow(idx)}
                    className="p-1.5 text-zinc-700 hover:text-red-400 opacity-0 group-hover:opacity-100 transition-all"
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        
        <div className="p-3 border-t border-zinc-800/50 bg-zinc-900/20 flex items-center justify-between">
          <button
            onClick={addTenRows}
            className="flex items-center gap-1.5 font-mono text-[10px] text-zinc-500 hover:text-zinc-300 transition-colors px-2 py-1"
          >
            <Plus className="h-3 w-3" /> Add 10 more rows
          </button>
          <span className="font-mono text-[10px] text-zinc-700 italic">
            Excel-style manual entry mode
          </span>
        </div>
      </div>

      <div className="flex items-center justify-end gap-4 pt-2">
        <div className="flex flex-col items-end">
          <span className="font-mono text-[10px] text-zinc-500">Ready for analysis</span>
          <span className="font-mono text-xs text-white font-bold">{activeCount} assets identified</span>
        </div>
        <Button
          onClick={onAnalyze}
          disabled={activeCount === 0 || isProcessing}
          variant="terminal"
          className="h-11 px-8 gap-2 shadow-lg shadow-blue-500/10"
        >

          {isProcessing ? (
            <div className="h-4 w-4 animate-spin rounded-full border-2 border-white/20 border-t-white" />
          ) : (
            <Zap className="h-4 w-4" fill="currentColor" />
          )}
          Run Nexus Analysis
        </Button>
      </div>
    </div>
  );
}
