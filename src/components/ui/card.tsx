import * as React from "react";
import { cn } from "@/lib/utils";

// ---------------------------------------------------------------------------
// Card — Glassmorphic dark surface for dashboard panels
// ---------------------------------------------------------------------------

const Card = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement> & { glow?: "blue" | "cyan" | "green" | "none" }
>(({ className, glow = "none", ...props }, ref) => {
  const glowClass =
    glow === "blue"
      ? "glow-blue"
      : glow === "cyan"
      ? "glow-cyan"
      : glow === "green"
      ? "glow-green"
      : "";
  return (
    <div
      ref={ref}
      className={cn(
        "rounded-xl border border-zinc-800/60 bg-card text-card-foreground",
        glowClass,
        className
      )}
      {...props}
    />
  );
});
Card.displayName = "Card";

const CardHeader = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={cn("flex flex-col space-y-1 p-5 pb-3", className)}
    {...props}
  />
));
CardHeader.displayName = "CardHeader";

const CardTitle = React.forwardRef<
  HTMLParagraphElement,
  React.HTMLAttributes<HTMLHeadingElement>
>(({ className, ...props }, ref) => (
  <h3
    ref={ref}
    className={cn(
      "font-mono text-xs font-semibold uppercase tracking-widest text-muted-foreground",
      className
    )}
    {...props}
  />
));
CardTitle.displayName = "CardTitle";

const CardContent = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div ref={ref} className={cn("p-5 pt-2", className)} {...props} />
));
CardContent.displayName = "CardContent";

const CardFooter = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={cn("flex items-center p-5 pt-0", className)}
    {...props}
  />
));
CardFooter.displayName = "CardFooter";

export { Card, CardHeader, CardTitle, CardContent, CardFooter };
