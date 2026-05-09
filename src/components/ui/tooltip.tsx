"use client";

import * as React from "react";
import { cn } from "@/lib/utils";

interface TooltipProps {
  content: string;
  children: React.ReactNode;
  className?: string;
}

/**
 * Edge-aware tooltip. Detects proximity to viewport edges on mouse enter and
 * adjusts horizontal alignment so the panel never overflows off-screen.
 */
export function Tooltip({ content, children, className }: TooltipProps) {
  const [isVisible, setIsVisible] = React.useState(false);
  const [align, setAlign] = React.useState<"left" | "center" | "right">(
    "center",
  );
  const wrapperRef = React.useRef<HTMLDivElement>(null);

  const TOOLTIP_WIDTH = 192; // w-48 = 12rem
  const EDGE_MARGIN = 12; // minimum px from viewport edge

  function handleMouseEnter() {
    if (wrapperRef.current) {
      const rect = wrapperRef.current.getBoundingClientRect();
      const viewportWidth = window.innerWidth;
      const triggerCenter = rect.left + rect.width / 2;

      if (triggerCenter - TOOLTIP_WIDTH / 2 < EDGE_MARGIN) {
        setAlign("left");
      } else if (
        triggerCenter + TOOLTIP_WIDTH / 2 >
        viewportWidth - EDGE_MARGIN
      ) {
        setAlign("right");
      } else {
        setAlign("center");
      }
    }
    setIsVisible(true);
  }

  // Panel position: anchor left/right edge of tooltip to trigger, or center it
  const panelClass =
    align === "left"
      ? "left-0"
      : align === "right"
        ? "right-0"
        : "left-1/2 -translate-x-1/2";

  // Arrow position tracks the visual center of the trigger relative to the panel
  const arrowClass =
    align === "left"
      ? "left-3"
      : align === "right"
        ? "right-3"
        : "left-1/2 -translate-x-1/2";

  return (
    <div
      ref={wrapperRef}
      className="relative inline-block"
      onMouseEnter={handleMouseEnter}
      onMouseLeave={() => setIsVisible(false)}
    >
      {children}
      {isVisible && (
        <div
          className={cn(
            "absolute z-50 bottom-full mb-2 w-48 p-2.5 rounded-lg bg-zinc-900 border border-zinc-800 shadow-2xl animate-in fade-in zoom-in duration-150",
            panelClass,
            className,
          )}
        >
          <p className="font-mono text-[9px] text-zinc-400 leading-relaxed text-center">
            {content}
          </p>
          {/* Caret arrow */}
          <div
            className={cn(
              "absolute top-full border-[6px] border-transparent border-t-zinc-800",
              arrowClass,
            )}
          />
        </div>
      )}
    </div>
  );
}
