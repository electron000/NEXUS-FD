"use client";

import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from "recharts";
import type { TCODataPoint } from "@/types";




// ---------------------------------------------------------------------------
// TCOChart — 5-year Total Cost of Ownership trajectory area chart
// ---------------------------------------------------------------------------

interface TCOChartProps {
  data: TCODataPoint[];
}


function CustomTooltip({ active, payload, label }: {
  active?: boolean;
  payload?: { name: string; value: number; color: string }[];
  label?: string;
}) {
  if (!active || !payload?.length) return null;
  return (
    <div className="rounded-xl border border-zinc-700/60 bg-zinc-900/95 p-3 shadow-xl backdrop-blur-sm">
      <p className="mb-2 font-mono text-[10px] uppercase tracking-widest text-zinc-500">
        Year {label}
      </p>
      {payload.map((entry) => (
        <div key={entry.name} className="flex items-center gap-2 font-mono text-xs">
          <span className="h-2 w-2 rounded-full flex-shrink-0" style={{ background: entry.color }} />
          <span className="text-zinc-400 capitalize">{entry.name.replace(/([A-Z])/g, " $1").trim()}:</span>
          <span className="text-white font-semibold">${entry.value.toFixed(2)}</span>
        </div>
      ))}
    </div>
  );
}

export function TCOChart({ data }: TCOChartProps) {
  return (
    <div className="h-64 w-full">
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart
          data={data}
          margin={{ top: 8, right: 16, left: 8, bottom: 0 }}
        >
          <defs>
            <linearGradient id="gradBest" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#22c55e" stopOpacity={0.18} />
              <stop offset="95%" stopColor="#22c55e" stopOpacity={0} />
            </linearGradient>
            <linearGradient id="gradExpected" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.25} />
              <stop offset="95%" stopColor="#3b82f6" stopOpacity={0} />
            </linearGradient>
            <linearGradient id="gradWorst" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#f59e0b" stopOpacity={0.18} />
              <stop offset="95%" stopColor="#f59e0b" stopOpacity={0} />
            </linearGradient>
          </defs>

          <CartesianGrid
            strokeDasharray="3 3"
            stroke="#27272a"
            vertical={false}
          />

          <XAxis
            dataKey="year"
            tickFormatter={(v) => `Yr ${v}`}
            tick={{ fontFamily: "monospace", fontSize: 10, fill: "#52525b" }}
            axisLine={false}
            tickLine={false}
            dy={6}
          />

          <YAxis
            tickFormatter={(v) => `$${v}`}
            tick={{ fontFamily: "monospace", fontSize: 10, fill: "#52525b" }}
            axisLine={false}
            tickLine={false}
            width={52}
          />

          <Tooltip content={<CustomTooltip />} />

          <Legend
            wrapperStyle={{ fontFamily: "monospace", fontSize: 10, color: "#71717a", paddingTop: 12 }}
            formatter={(value) => value.replace(/([A-Z])/g, " $1").trim()}
          />

          <Area
            type="monotone"
            dataKey="worstCase"
            name="worstCase"
            stroke="#f59e0b"
            strokeWidth={1.5}
            fill="url(#gradWorst)"
            dot={false}
            activeDot={{ r: 4, fill: "#f59e0b", strokeWidth: 0 }}
          />
          <Area
            type="monotone"
            dataKey="expected"
            name="expected"
            stroke="#3b82f6"
            strokeWidth={2}
            fill="url(#gradExpected)"
            dot={false}
            activeDot={{ r: 4, fill: "#3b82f6", strokeWidth: 0 }}
          />
          <Area
            type="monotone"
            dataKey="bestCase"
            name="bestCase"
            stroke="#22c55e"
            strokeWidth={1.5}
            fill="url(#gradBest)"
            dot={false}
            activeDot={{ r: 4, fill: "#22c55e", strokeWidth: 0 }}
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
}
