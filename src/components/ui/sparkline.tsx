"use client";

import { useMemo } from "react";

// ---------------------------------------------------------------------------
// Sparkline — Inline mini SVG chart for metric cards
// ---------------------------------------------------------------------------

interface SparklineProps {
  data: number[];
  color?: string;
  width?: number;
  height?: number;
  strokeWidth?: number;
  filled?: boolean;
}

export function Sparkline({
  data,
  color = "#3b82f6",
  width = 80,
  height = 28,
  strokeWidth = 1.5,
  filled = true,
}: SparklineProps) {
  const path = useMemo(() => {
    if (data.length < 2) return "";
    const min = Math.min(...data);
    const max = Math.max(...data);
    const range = max - min || 1;
    const xStep = width / (data.length - 1);
    const pad = 2;

    const points = data.map((v, i) => ({
      x: i * xStep,
      y: pad + ((1 - (v - min) / range) * (height - pad * 2)),
    }));

    const linePath = points
      .map((p, i) => `${i === 0 ? "M" : "L"} ${p.x.toFixed(2)} ${p.y.toFixed(2)}`)
      .join(" ");

    const fillPath = filled
      ? `${linePath} L ${points[points.length - 1].x.toFixed(2)} ${height} L 0 ${height} Z`
      : "";

    return { linePath, fillPath };
  }, [data, width, height, filled]);

  if (!path || !path.linePath) return null;

  return (
    <svg
      viewBox={`0 0 ${width} ${height}`}
      width={width}
      height={height}
      className="overflow-visible"
      aria-hidden="true"
    >
      {filled && (
        <defs>
          <linearGradient id={`sg-${color.replace("#", "")}`} x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor={color} stopOpacity="0.2" />
            <stop offset="100%" stopColor={color} stopOpacity="0" />
          </linearGradient>
        </defs>
      )}
      {filled && (
        <path
          d={path.fillPath}
          fill={`url(#sg-${color.replace("#", "")})`}
          strokeWidth="0"
        />
      )}
      <path
        d={path.linePath}
        fill="none"
        stroke={color}
        strokeWidth={strokeWidth}
        strokeLinejoin="round"
        strokeLinecap="round"
      />
    </svg>
  );
}
