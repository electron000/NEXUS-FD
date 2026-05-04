"use client";

import {
  useReactTable,
  getCoreRowModel,
  getSortedRowModel,
  getPaginationRowModel,
  flexRender,
  type ColumnDef,
  type SortingState,
} from "@tanstack/react-table";
import { useState } from "react";
import { ArrowUpDown, ArrowUp, ArrowDown, ChevronLeft, ChevronRight } from "lucide-react";
import {
  Table, TableHeader, TableBody, TableRow, TableHead, TableCell,
} from "@/components/ui/table";
import { GradeBadge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import type { AuditorResult } from "@/types";


interface AuditorTableProps {
  data: AuditorResult[];
}

function SortIcon({ sorted }: { sorted: false | "asc" | "desc" }) {
  if (sorted === "asc") return <ArrowUp className="ml-1 h-3 w-3 text-blue-400" />;
  if (sorted === "desc") return <ArrowDown className="ml-1 h-3 w-3 text-blue-400" />;
  return <ArrowUpDown className="ml-1 h-3 w-3 text-zinc-600" />;
}

function SortableHeader({
  label,
  toggleSorting,
  getIsSorted,
}: {
  label: string;
  toggleSorting: (desc: boolean) => void;
  getIsSorted: () => false | "asc" | "desc";
}) {
  return (
    <button
      className="flex items-center font-mono text-[10px] uppercase tracking-widest text-muted-foreground hover:text-zinc-300 transition-colors"
      onClick={() => toggleSorting(getIsSorted() === "asc")}
    >
      {label}
      <SortIcon sorted={getIsSorted()} />
    </button>
  );
}

function ValuationBar({ value, max, isLive, currency = "USD" }: { value: number; max: number; isLive?: boolean; currency?: string }) {
  const pct = Math.min(100, (value / max) * 100);
  const color = pct >= 66 ? "#22c55e" : pct >= 33 ? "#3b82f6" : "#f59e0b";
  const symbol = currency === "INR" ? "₹" : "$";
  return (
    <div className="flex items-center gap-2 min-w-0">
      <div className="flex flex-col">
        <span className="font-mono text-xs text-white shrink-0">
          {symbol}{value.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
        </span>

        {isLive && (
          <span className="inline-flex items-center gap-1 mt-1">
            <span className="relative flex h-1.5 w-1.5">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-emerald-500"></span>
            </span>
            <span className="text-[9px] font-mono font-bold text-emerald-400 uppercase tracking-wider leading-none">
              Live Market Data
            </span>
          </span>
        )}

      </div>
      <div className="h-1 flex-1 rounded-full bg-zinc-800 min-w-8 max-w-24">
        <div
          className="h-full rounded-full transition-all duration-500"
          style={{ width: `${pct}%`, background: color }}
        />
      </div>
    </div>
  );
}


export function AuditorTable({ data }: AuditorTableProps) {
  const [sorting, setSorting] = useState<SortingState>([{ id: "simulatedValuation", desc: true }]);

  const maxVal = Math.max(...data.map(d => d.simulatedValuation), 1);

  const columns: ColumnDef<AuditorResult>[] = [

    {
      id: "index",
      header: "#",
      cell: ({ row }) => (

        <span className="font-mono text-[10px] text-zinc-700">{row.index + 1}</span>
      ),
      size: 40,
    },
    {
      accessorKey: "domain",
      header: "Domain",
      cell: ({ row }) => (
        <div className="flex items-center gap-2 min-w-0">
          <span className="font-mono text-xs text-white truncate max-w-40">{row.original.domain}</span>
          <span className="text-[10px] font-mono text-zinc-700 border border-zinc-800 rounded px-1 shrink-0 uppercase">.{row.original.tld}</span>
        </div>
      ),
    },
    {
      accessorKey: "simulatedValuation",
      header: ({ column }) => (
        <SortableHeader label="Est. Value" toggleSorting={(d) => column.toggleSorting(d)} getIsSorted={() => column.getIsSorted()} />
      ),
      cell: ({ row }) => (
        <ValuationBar 
          value={row.original.simulatedValuation} 
          max={maxVal} 
          isLive={row.original.isLive} 
          currency={row.original.currency}
        />
      ),


    },
    {
      accessorKey: "semanticScore",
      header: ({ column }) => (
        <SortableHeader label="Semantic" toggleSorting={(d) => column.toggleSorting(d)} getIsSorted={() => column.getIsSorted()} />
      ),
      cell: ({ row }) => {
        const v = row.original.semanticScore;
        const color = v >= 75 ? "text-emerald-400" : v >= 50 ? "text-blue-400" : "text-amber-400";
        return <span className={cn("font-mono text-xs font-semibold", color)}>{v}/100</span>;
      },
    },
    {
      accessorKey: "trendMomentum",
      header: ({ column }) => (
        <SortableHeader label="Momentum" toggleSorting={(d) => column.toggleSorting(d)} getIsSorted={() => column.getIsSorted()} />
      ),
      cell: ({ row }) => (
        <span className="font-mono text-xs text-zinc-400">×{row.original.trendMomentum.toFixed(2)}</span>
      ),
    },
    {
      accessorKey: "grade",
      header: "Grade",
      cell: ({ row }) => <GradeBadge grade={row.original.grade} />,
    },
    {
      accessorKey: "purchasePrice",
      header: "Purchase",
      cell: ({ row }) => {
        const symbol = row.original.currency === "INR" ? "₹" : "$";
        return (
          <span className="font-mono text-xs text-zinc-500">
            {row.original.purchasePrice != null ? `${symbol}${row.original.purchasePrice.toLocaleString()}` : "—"}
          </span>
        );
      },

    },
  ];

  // eslint-disable-next-line react-hooks/incompatible-library
  const table = useReactTable({

    data,
    columns,
    state: { sorting },
    onSortingChange: setSorting,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    initialState: { pagination: { pageSize: 25 } },
  });

  return (
    <div className="space-y-3">
      <div className="overflow-x-auto -mx-1">
        <div className="min-w-[540px] px-1">
          <Table>
        <TableHeader>
          {table.getHeaderGroups().map((hg) => (
            <TableRow key={hg.id} className="hover:bg-transparent border-zinc-800/60">
              {hg.headers.map((header) => (
                <TableHead key={header.id}>
                  {header.isPlaceholder ? null : flexRender(header.column.columnDef.header, header.getContext())}
                </TableHead>
              ))}
            </TableRow>
          ))}
        </TableHeader>
        <TableBody>
          {table.getRowModel().rows.map((row) => (
            <TableRow key={row.id}>
              {row.getVisibleCells().map((cell) => (
                <TableCell key={cell.id}>
                  {flexRender(cell.column.columnDef.cell, cell.getContext())}
                </TableCell>
              ))}
            </TableRow>
          ))}
        </TableBody>
        </Table>
        </div>
      </div>

      {/* Pagination */}
      {table.getPageCount() > 1 && (
        <div className="flex items-center justify-between px-1">
          <span className="font-mono text-[10px] text-zinc-600">
            Showing {table.getState().pagination.pageIndex * table.getState().pagination.pageSize + 1}–
            {Math.min(
              (table.getState().pagination.pageIndex + 1) * table.getState().pagination.pageSize,
              data.length
            )}{" "}
            of {data.length} rows
          </span>
          <div className="flex items-center gap-2">
            <Button
              variant="terminal"
              size="icon-sm"
              onClick={() => table.previousPage()}
              disabled={!table.getCanPreviousPage()}
            >
              <ChevronLeft className="h-3.5 w-3.5" />
            </Button>
            <span className="font-mono text-[10px] text-zinc-500">
              {table.getState().pagination.pageIndex + 1} / {table.getPageCount()}
            </span>
            <Button
              variant="terminal"
              size="icon-sm"
              onClick={() => table.nextPage()}
              disabled={!table.getCanNextPage()}
            >
              <ChevronRight className="h-3.5 w-3.5" />
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
