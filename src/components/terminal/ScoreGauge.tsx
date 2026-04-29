"use client";

import { useEffect, useRef } from "react";

// ---------------------------------------------------------------------------
// ScoreGauge — SVG semi-circle arc gauge for Nexus Value Score components
// ---------------------------------------------------------------------------

interface ScoreGaugeProps {
  value: number;          // 0–100
  label: string;
  color?: string;         // stroke color
  size?: number;          // SVG viewBox size
}

export function ScoreGauge({
  value,
  label,
  color = "#3b82f6",
  size = 140,
}: ScoreGaugeProps) {
  const clampedValue = Math.min(100, Math.max(0, value));
  const pathRef = useRef<SVGPathElement>(null);
  const indicatorRef = useRef<SVGCircleElement>(null);

  // Arc geometry
  const cx = size / 2;
  const cy = size * 0.6;
  const r = size * 0.38;
  const strokeWidth = size * 0.065;
  const startAngle = -210;  // degrees from 3 o'clock (SVG)
  const sweepAngle = 240;   // total arc span

  function polarToCartesian(angle: number) {
    const rad = (angle * Math.PI) / 180;
    return {
      x: cx + r * Math.cos(rad),
      y: cy + r * Math.sin(rad),
    };
  }

  function describeArc(startDeg: number, endDeg: number) {
    const start = polarToCartesian(startDeg);
    const end = polarToCartesian(endDeg);
    const largeArc = endDeg - startDeg > 180 ? 1 : 0;
    return [
      `M ${start.x.toFixed(2)} ${start.y.toFixed(2)}`,
      `A ${r} ${r} 0 ${largeArc} 1 ${end.x.toFixed(2)} ${end.y.toFixed(2)}`,
    ].join(" ");
  }

  const bgPath = describeArc(startAngle, startAngle + sweepAngle);
  const fillEnd = startAngle + (sweepAngle * clampedValue) / 100;
  const fillPath = clampedValue > 0 ? describeArc(startAngle, fillEnd) : "";

  // Indicator dot position
  const dotPos = polarToCartesian(fillEnd);

  // Animate fill on mount using CSS stroke-dasharray
  const arcLen = Math.PI * r * (sweepAngle / 180);
  const dashOffset = arcLen * (1 - clampedValue / 100);

  useEffect(() => {
    if (!pathRef.current) return;
    pathRef.current.style.strokeDasharray = `${arcLen}`;
    pathRef.current.style.strokeDashoffset = `${arcLen}`;
    // Kick off animation on next frame
    requestAnimationFrame(() => {
      if (!pathRef.current) return;
      pathRef.current.style.transition = "stroke-dashoffset 1.2s cubic-bezier(0.4,0,0.2,1)";
      pathRef.current.style.strokeDashoffset = `${dashOffset}`;
    });
  }, [arcLen, dashOffset]);

  // Color based on value
  const scoreColor =
    clampedValue >= 80 ? "#22c55e" :
    clampedValue >= 60 ? "#3b82f6" :
    clampedValue >= 40 ? "#f59e0b" :
    "#ef4444";

  const finalColor = color !== "#3b82f6" ? color : scoreColor;

  return (
    <div className="flex flex-col items-center">
      <svg
        viewBox={`0 0 ${size} ${size * 0.75}`}
        width={size}
        height={size * 0.75}
        role="img"
        aria-label={`${label}: ${clampedValue}`}
      >
        {/* Track */}
        <path
          d={bgPath}
          fill="none"
          stroke="#27272a"
          strokeWidth={strokeWidth}
          strokeLinecap="round"
        />

        {/* Fill */}
        {fillPath && (
          <path
            ref={pathRef}
            d={fillPath}
            fill="none"
            stroke={finalColor}
            strokeWidth={strokeWidth}
            strokeLinecap="round"
            style={{
              filter: `drop-shadow(0 0 6px ${finalColor}55)`,
            }}
          />
        )}

        {/* Indicator dot */}
        {clampedValue > 2 && (
          <circle
            ref={indicatorRef}
            cx={dotPos.x}
            cy={dotPos.y}
            r={strokeWidth * 0.45}
            fill={finalColor}
            style={{ filter: `drop-shadow(0 0 4px ${finalColor})` }}
          />
        )}

        {/* Center value */}
        <text
          x={cx}
          y={cy - r * 0.1}
          textAnchor="middle"
          dominantBaseline="middle"
          fill="white"
          fontSize={size * 0.2}
          fontFamily="monospace"
          fontWeight="700"
          letterSpacing="-1"
        >
          {clampedValue}
        </text>
        <text
          x={cx}
          y={cy + r * 0.25}
          textAnchor="middle"
          dominantBaseline="middle"
          fill="#71717a"
          fontSize={size * 0.08}
          fontFamily="monospace"
          fontWeight="600"
          letterSpacing="2"
        >
          /100
        </text>
      </svg>

      <p className="mt-1 font-mono text-[11px] uppercase tracking-widest text-zinc-500 text-center leading-tight">
        {label}
      </p>
    </div>
  );
}
