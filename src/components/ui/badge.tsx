import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

// ---------------------------------------------------------------------------
// Badge — Status pills for grades, tags, availability, etc.
// ---------------------------------------------------------------------------

const badgeVariants = cva(
  "inline-flex items-center rounded-md border font-mono text-[10px] font-semibold uppercase tracking-widest transition-colors",
  {
    variants: {
      variant: {
        default:     "border-zinc-700 bg-zinc-800 text-zinc-300 px-2 py-0.5",
        outline:     "border-zinc-700 bg-transparent text-zinc-400 px-2 py-0.5",
        positive:    "border-emerald-500/30 bg-emerald-500/10 text-emerald-400 px-2 py-0.5",
        negative:    "border-red-500/30 bg-red-500/10 text-red-400 px-2 py-0.5",
        warning:     "border-amber-500/30 bg-amber-500/10 text-amber-400 px-2 py-0.5",
        accent:      "border-cyan-500/30 bg-cyan-500/10 text-cyan-400 px-2 py-0.5",
        primary:     "border-blue-500/30 bg-blue-500/10 text-blue-400 px-2 py-0.5",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  }
);

export interface BadgeProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof badgeVariants> {}

function Badge({ className, variant, ...props }: BadgeProps) {
  return (
    <div className={cn(badgeVariants({ variant }), className)} {...props} />
  );
}

export { Badge, badgeVariants };
