"use client";

import { motion } from "framer-motion";
import { TrendingUp, TrendingDown, ArrowUpRight, ExternalLink } from "lucide-react";
import type { PortfolioDomain } from "@/types";
import { Card, CardContent } from "@/components/ui/card";

interface PortfolioTableProps {
  data: PortfolioDomain[];
}

export function PortfolioTable({ data }: PortfolioTableProps) {
  if (!data || data.length === 0) {
    return (
      <Card className="border-zinc-800/50 bg-zinc-950/50 backdrop-blur-sm">
        <CardContent className="py-12 text-center text-zinc-500 font-mono text-sm uppercase tracking-widest">
          No verified assets found in portfolio
        </CardContent>
      </Card>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.4, duration: 0.5 }}
      className="space-y-4"
    >
      <div className="flex items-center justify-between px-2">
        <h2 className="font-mono text-xs font-bold text-zinc-500 uppercase tracking-[0.2em]">
          Verified Assets & Valuations
        </h2>
        <span className="font-mono text-[10px] text-zinc-600 uppercase">
          Live Market Estimations
        </span>
      </div>

      <Card className="overflow-hidden border-zinc-800/50 bg-zinc-950/50 backdrop-blur-md shadow-2xl">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-zinc-800/50 bg-zinc-900/30">
                <th className="p-4 font-mono text-[10px] uppercase tracking-wider text-zinc-500">Domain Asset</th>
                <th className="p-4 font-mono text-[10px] uppercase tracking-wider text-zinc-500 text-right">Bought Price</th>
                <th className="p-4 font-mono text-[10px] uppercase tracking-wider text-zinc-500 text-right">Nexus Valuation</th>
                <th className="p-4 font-mono text-[10px] uppercase tracking-wider text-zinc-500 text-right">Total Growth</th>
                <th className="p-4 font-mono text-[10px] uppercase tracking-wider text-zinc-500 text-center">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-800/30">
              {data.map((item, idx) => (
                <motion.tr
                  key={item.domain}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.5 + idx * 0.05 }}
                  className="group hover:bg-white/[0.02] transition-colors cursor-default"
                >
                  <td className="p-4">
                    <div className="flex items-center gap-3">
                      <div className="h-8 w-8 rounded-lg bg-zinc-900 flex items-center justify-center border border-zinc-800 group-hover:border-blue-500/50 transition-colors">
                        <span className="text-[10px] font-bold text-zinc-400 uppercase">{item.domain.charAt(0)}</span>
                      </div>
                      <div>
                        <div className="font-mono text-sm font-bold text-white tracking-tight flex items-center gap-2">
                          {item.domain}
                          <ArrowUpRight className="h-3 w-3 text-zinc-700 opacity-0 group-hover:opacity-100 transition-opacity" />
                        </div>
                        <div className="text-[9px] text-zinc-600 font-mono uppercase tracking-tighter">Verified Ownership</div>
                      </div>
                    </div>
                  </td>
                  <td className="p-4 text-right">
                    <div className="font-mono text-sm text-zinc-400">
                      ₹{item.boughtPrice.toLocaleString('en-IN')}
                    </div>
                  </td>
                  <td className="p-4 text-right">
                    <div className="font-mono text-sm font-bold text-white">
                      ₹{item.valuation.toLocaleString('en-IN')}
                    </div>
                    <div className="text-[9px] text-zinc-600 font-mono uppercase tracking-tighter">Model Prediction</div>
                  </td>
                  <td className="p-4 text-right">
                    <div className={`flex items-center justify-end gap-1 font-mono text-sm font-bold ${item.growth >= 0 ? 'text-emerald-400' : 'text-red-400'}`}>
                      {item.growth >= 0 ? <TrendingUp className="h-3 w-3" /> : <TrendingDown className="h-3 w-3" />}
                      {item.growth >= 0 ? '+' : ''}{item.growth.toFixed(2)}%
                    </div>
                  </td>
                  <td className="p-4 text-center">
                    <div className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-emerald-500/10 border border-emerald-500/20">
                      <div className="h-1 w-1 rounded-full bg-emerald-500 animate-pulse" />
                      <span className="text-[9px] font-mono font-bold text-emerald-500 uppercase tracking-widest">Active</span>
                    </div>
                  </td>
                </motion.tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>
      <div className="flex items-center gap-4 px-2 text-[9px] font-mono text-zinc-600 uppercase tracking-widest">
        <span className="flex items-center gap-1">
          <div className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
          Growth Positive
        </span>
        <span className="flex items-center gap-1">
          <div className="h-1.5 w-1.5 rounded-full bg-red-500" />
          Growth Negative
        </span>
        <span className="ml-auto flex items-center gap-1">
          <ExternalLink className="h-2.5 w-2.5" />
          Terminal Data Updated 30s ago
        </span>
      </div>
    </motion.div>
  );
}
