/* eslint-disable react-hooks/incompatible-library */
"use client";

import {
  useReactTable,
  getCoreRowModel,
  getSortedRowModel,
  flexRender,
  type ColumnDef,
  type SortingState,
} from "@tanstack/react-table";
import { useState } from "react";
import { ArrowUpDown, ArrowUp, ArrowDown, ExternalLink, Check, X, Shield, ShieldOff, AlertTriangle } from "lucide-react";
import type { RegistrarPricing } from "@/types";

import {
  Table, TableHeader, TableBody, TableRow, TableHead, TableCell,
} from "@/components/ui/table";
import { cn } from "@/lib/utils";

// ---------------------------------------------------------------------------
// ArbitrageTable — Sortable registrar pricing comparison table
// ---------------------------------------------------------------------------

interface ArbitrageTableProps {
  data: RegistrarPricing[];
}

const REGISTRAR_COLORS: Record<string, string> = {
  godaddy:    "text-emerald-400 border-emerald-500/20 bg-emerald-500/5",
  porkbun:    "text-pink-400 border-pink-500/20 bg-pink-500/5",
  namecom:    "text-blue-400 border-blue-500/20 bg-blue-500/5",
};

function RegistrarBadge({ name, slug }: { name: string; slug: string }) {
  const colorClass = REGISTRAR_COLORS[slug] ?? "text-zinc-400 border-zinc-700 bg-zinc-800/20";
  return (
    <span className={cn("inline-flex items-center rounded-md border px-2 py-0.5 font-mono text-[10px] font-semibold uppercase tracking-wider", colorClass)}>
      {name}
    </span>
  );
}

function SortIcon({ sorted }: { sorted: false | "asc" | "desc" }) {
  if (sorted === "asc") return <ArrowUp className="ml-1 h-3 w-3 text-blue-400" />;
  if (sorted === "desc") return <ArrowDown className="ml-1 h-3 w-3 text-blue-400" />;
  return <ArrowUpDown className="ml-1 h-3 w-3 text-zinc-600" />;
}

export function ArbitrageTable({ data }: ArbitrageTableProps) {
  const [sorting, setSorting] = useState<SortingState>([]);

  // Find cheapest metrics for highlighting
  const minReg = Math.min(...data.filter(d => d.registration > 0).map(d => d.registration));
  const minRenewal = Math.min(...data.map(d => d.renewal));

  const columns: ColumnDef<RegistrarPricing>[] = [
    {
      accessorKey: "registrar",
      header: "Registrar",
      cell: ({ row }) => (
        <div className="flex items-center gap-2">
          <RegistrarBadge name={row.original.registrar} slug={row.original.logoSlug} />
          {row.original.premium && (
            <span className="inline-flex items-center gap-1 rounded-md border border-amber-500/30 bg-amber-500/10 px-1.5 py-0.5 font-mono text-[8px] font-bold uppercase tracking-wider text-amber-400">
              <AlertTriangle className="h-2.5 w-2.5" />
              Premium
            </span>
          )}
        </div>
      ),
    },
    {
      accessorKey: "registration",
      header: ({ column }) => (
        <button
          className="flex items-center font-mono text-[10px] uppercase tracking-widest text-muted-foreground hover:text-zinc-300 transition-colors"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
        >
          Registration
          <SortIcon sorted={column.getIsSorted()} />
        </button>
      ),
      cell: ({ row }) => {
        const val = row.original.registration;
        const currency = row.original.currency || 'USD';
        const isAvailable = row.original.available;
        const isCheapest = val > 0 && val === minReg && isAvailable;
        
        return (
          <div className="flex flex-col">
            <span className={cn("font-mono text-xs", isCheapest ? "text-emerald-400 font-semibold" : "text-zinc-300")}>
              {val === 0 ? <span className="text-zinc-600">—</span> : `${currency === 'INR' ? '₹' : '$'}${val.toFixed(2)}`}
              {isCheapest && <span className="ml-1 text-[9px] text-emerald-500 font-bold tracking-tighter">▼ BEST</span>}
            </span>
            {val > 0 && (
              <span className={cn("font-mono text-[8px] mt-0.5", row.original.premium ? "text-amber-400" : "text-blue-400")}>
                {row.original.premium ? "Premium Price" : "Tax Excluded"}
              </span>
            )}
          </div>
        );
      },
    },
    {
      accessorKey: "renewal",
      header: ({ column }) => (
        <button
          className="flex items-center font-mono text-[10px] uppercase tracking-widest text-muted-foreground hover:text-zinc-300 transition-colors"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
        >
          Renewal
          <SortIcon sorted={column.getIsSorted()} />
        </button>
      ),
      cell: ({ row }) => {
        const val = row.original.renewal;
        const currency = row.original.currency || 'USD';
        const isAvailable = row.original.available;
        const isCheapest = val === minRenewal && isAvailable;
        return (
          <div className="flex flex-col">
            <span className={cn("font-mono text-xs", isCheapest ? "text-emerald-400 font-semibold" : "text-zinc-300")}>
              {currency === 'INR' ? '₹' : '$'}{val.toFixed(2)}/yr
              {isCheapest && <span className="ml-1 text-[9px] text-emerald-500 font-bold tracking-tighter">▼ BEST</span>}
            </span>
            <span className={cn("font-mono text-[8px] mt-0.5", row.original.premium ? "text-amber-400" : "text-blue-400")}>
              {row.original.premium ? "Premium Price" : "Tax Excluded"}
            </span>
          </div>
        );
      },
    },
    {
      accessorKey: "transfer",
      header: "Transfer",
      cell: ({ row }) => {
        const currency = row.original.currency || 'USD';
        const val = row.original.transfer;
        return (
          <div className="flex flex-col">
            <span className="font-mono text-xs text-zinc-400">
              {val === 0 ? <span className="text-zinc-600">—</span> : `${currency === 'INR' ? '₹' : '$'}${val.toFixed(2)}`}
            </span>
            {val > 0 && <span className="font-mono text-[8px] text-blue-400 mt-0.5">Tax Excluded</span>}
          </div>
        );
      },
    },
    {
      accessorKey: "privacy",
      header: "Privacy",
      cell: ({ row }) => {
        const val = row.original.privacy;
        const currency = row.original.currency || 'USD';
        return (
          <div className="flex flex-col">
            <div className="flex items-center gap-1.5">
              {val === 0 ? (
                 <>
                   <Shield className="h-3 w-3 text-emerald-400" />
                   <span className="font-mono text-[10px] text-emerald-400 uppercase font-bold tracking-tighter">Included</span>
                 </>
              ) : (
                 <>
                   <ShieldOff className="h-3 w-3 text-zinc-600" />
                   <span className="font-mono text-xs text-zinc-500">
                     {currency === 'INR' ? '₹' : '$'}{val.toFixed(2)}
                   </span>
                 </>
              )}
            </div>
            {val > 0 && <span className="font-mono text-[8px] text-blue-400 mt-0.5">Tax Excluded</span>}
          </div>
        );
      },
    },
    {
      accessorKey: "available",
      header: "Available",
      cell: ({ row }) => (
        row.original.available
          ? <span className="flex items-center gap-1 text-emerald-400 font-mono text-[10px] uppercase font-bold tracking-tighter"><Check className="h-3 w-3" /> Yes</span>
          : <span className="flex items-center gap-1 text-red-400 font-mono text-[10px] uppercase font-bold tracking-tighter"><X className="h-3 w-3" /> No</span>
      ),
    },
    {
      id: "action",
      header: "",
      cell: ({ row }) => (
        <a
          href={row.original.affiliateUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-1 rounded-md border border-blue-500/20 bg-blue-500/5 px-2.5 py-1 font-mono text-[10px] text-blue-400 hover:border-blue-500/40 hover:bg-blue-500/10 hover:text-blue-300 transition-all"
        >
          View Registrar <ExternalLink className="h-2.5 w-2.5" />
        </a>
      ),
    },
  ];

  const table = useReactTable({
    data,
    columns,
    state: { sorting },
    onSortingChange: setSorting,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
  });

  return (
    <>
      <div className="hidden md:block">
        <Table>
          <TableHeader>
            {table.getHeaderGroups().map((hg) => (
              <TableRow key={hg.id} className="hover:bg-transparent border-zinc-800/60">
                {hg.headers.map((header) => (
                  <TableHead key={header.id} className="h-10">
                    {header.isPlaceholder
                      ? null
                      : flexRender(header.column.columnDef.header, header.getContext())}
                  </TableHead>
                ))}
              </TableRow>
            ))}
          </TableHeader>
          <TableBody>
            {table.getRowModel().rows.map((row) => (
              <TableRow key={row.id} className="border-zinc-800/40 hover:bg-zinc-800/20 transition-colors">
                {row.getVisibleCells().map((cell) => (
                  <TableCell key={cell.id} className="py-3">
                    {flexRender(cell.column.columnDef.cell, cell.getContext())}
                  </TableCell>
                ))}
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      {/* Mobile Arbitrage Cards */}
      <div className="md:hidden space-y-3">
        {data.map((item, idx) => {
          const isCheapestReg = item.registration > 0 && item.registration === minReg && item.available;
          const isCheapestRenewal = item.renewal === minRenewal && item.available;
          const currency = item.currency || 'USD';
          const sym = currency === 'INR' ? '₹' : '$';

          return (
            <div
              key={`${item.registrar}-${idx}`}
              className={cn(
                "rounded-xl border p-4 transition-all",
                isCheapestReg ? "border-emerald-500/30 bg-emerald-500/5 shadow-[0_0_15px_rgba(16,185,129,0.05)]" : "border-zinc-800/60 bg-zinc-900/20"
              )}
            >
              <div className="flex items-center justify-between mb-4">
                <RegistrarBadge name={item.registrar} slug={item.logoSlug} />
                <div className="flex items-center gap-2">
                  {item.premium && (
                    <span className="inline-flex items-center gap-1 rounded-md border border-amber-500/30 bg-amber-500/10 px-1.5 py-0.5 font-mono text-[8px] font-bold uppercase text-amber-400">
                      Premium
                    </span>
                  )}
                  {item.available ? (
                    <span className="flex items-center gap-1 text-emerald-400 font-mono text-[9px] uppercase font-bold"><Check className="h-2.5 w-2.5" /> Available</span>
                  ) : (
                    <span className="flex items-center gap-1 text-red-400 font-mono text-[9px] uppercase font-bold"><X className="h-2.5 w-2.5" /> Taken</span>
                  )}
                </div>
              </div>

              <div className="grid grid-cols-2 gap-y-4 gap-x-2">
                <div className="space-y-1">
                  <p className="font-mono text-[9px] text-zinc-500 uppercase tracking-wider">Registration</p>
                  <p className={cn("font-mono text-sm font-bold", isCheapestReg ? "text-emerald-400" : "text-white")}>
                    {item.registration === 0 ? "—" : `${sym}${item.registration.toFixed(2)}`}
                    {isCheapestReg && <span className="ml-1 text-[8px] text-emerald-500 block leading-none">Best Entry</span>}
                  </p>
                </div>
                <div className="space-y-1 text-right">
                  <p className="font-mono text-[9px] text-zinc-500 uppercase tracking-wider">Renewal</p>
                  <p className={cn("font-mono text-sm font-bold", isCheapestRenewal ? "text-emerald-400" : "text-white")}>
                    {sym}{item.renewal.toFixed(2)}/yr
                    {isCheapestRenewal && <span className="ml-1 text-[8px] text-emerald-500 block leading-none">Best Renewal</span>}
                  </p>
                </div>
                <div className="space-y-1">
                  <p className="font-mono text-[9px] text-zinc-500 uppercase tracking-wider">Privacy</p>
                  <div className="flex items-center gap-1">
                    {item.privacy === 0 ? (
                      <span className="font-mono text-[10px] text-emerald-400 uppercase font-bold tracking-tighter">Included</span>
                    ) : (
                      <span className="font-mono text-xs text-zinc-500">{sym}{item.privacy.toFixed(2)}</span>
                    )}
                  </div>
                </div>
                <div className="space-y-1 text-right">
                  <p className="font-mono text-[9px] text-zinc-500 uppercase tracking-wider">Transfer</p>
                  <p className="font-mono text-sm text-zinc-500">
                    {item.transfer === 0 ? "—" : `${sym}${item.transfer.toFixed(2)}`}
                  </p>
                </div>
              </div>

              <div className="mt-5">
                <a
                  href={item.affiliateUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center justify-center gap-2 w-full rounded-lg bg-blue-600/10 border border-blue-500/20 py-2.5 font-mono text-[10px] text-blue-400 font-bold uppercase tracking-widest hover:bg-blue-600/20 transition-all"
                >
                  Visit Registrar <ExternalLink className="h-3 w-3" />
                </a>
              </div>
            </div>
          );
        })}
      </div>
    </>
  );
}
