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
import { ArrowUpDown, ArrowUp, ArrowDown, ExternalLink, Check, X, Shield, ShieldOff } from "lucide-react";
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
        <RegistrarBadge name={row.original.registrar} slug={row.original.logoSlug} />
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
        const isCheapest = val > 0 && val === minReg;
        
        return (
          <div className="flex flex-col">
            <span className={cn("font-mono text-xs", isCheapest ? "text-emerald-400 font-semibold" : "text-zinc-300")}>
              {val === 0 ? <span className="text-zinc-600">—</span> : `${currency === 'INR' ? '₹' : '$'}${val.toFixed(2)}`}
              {isCheapest && <span className="ml-1 text-[9px] text-emerald-500 font-bold tracking-tighter">▼ BEST</span>}
            </span>
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
        const isCheapest = val === minRenewal;
        return (
          <span className={cn("font-mono text-xs", isCheapest ? "text-emerald-400 font-semibold" : "text-zinc-300")}>
            {currency === 'INR' ? '₹' : '$'}{val.toFixed(2)}/yr
            {isCheapest && <span className="ml-1 text-[9px] text-emerald-500 font-bold tracking-tighter">▼ BEST</span>}
          </span>
        );
      },
    },
    {
      accessorKey: "transfer",
      header: "Transfer",
      cell: ({ row }) => {
        const currency = row.original.currency || 'USD';
        return (
          <span className="font-mono text-xs text-zinc-400">
            {row.original.transfer === 0 ? <span className="text-zinc-600">—</span> : `${currency === 'INR' ? '₹' : '$'}${row.original.transfer.toFixed(2)}`}
          </span>
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
  );
}
