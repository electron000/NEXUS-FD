"use client";

import * as React from "react";
import { cn } from "@/lib/utils";

// ---------------------------------------------------------------------------
// Progress — Animated progress bar for SSE simulation
// ---------------------------------------------------------------------------

interface ProgressProps extends React.HTMLAttributes<HTMLDivElement> {
  value?: number;   // 0–100
  color?: "blue" | "cyan" | "green" | "gradient";
}

const Progress = React.forwardRef<HTMLDivElement, ProgressProps>(
  ({ className, value = 0, color = "gradient", ...props }, ref) => {
    const fillClass =
      color === "blue"
        ? "bg-blue-500"
        : color === "cyan"
        ? "bg-cyan-500"
        : color === "green"
        ? "bg-emerald-500"
        : ""; // gradient handled inline

    return (
      <div
        ref={ref}
        className={cn(
          "relative h-1 w-full overflow-hidden rounded-full bg-zinc-800",
          className
        )}
        {...props}
      >
        <div
          className={cn(
            "h-full rounded-full transition-all duration-300 ease-out",
            fillClass
          )}
          style={{
            width: `${Math.min(100, Math.max(0, value))}%`,
            background:
              color === "gradient"
                ? "linear-gradient(90deg, #3b82f6, #06b6d4, #3b82f6)"
                : undefined,
            backgroundSize: color === "gradient" ? "200% 100%" : undefined,
          }}
        />
        {/* Shimmer overlay */}
        <div className="absolute inset-0 animate-pulse-soft opacity-30 rounded-full bg-white/5" />
      </div>
    );
  }
);
Progress.displayName = "Progress";

export { Progress };
