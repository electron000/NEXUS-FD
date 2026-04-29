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
        // Grade variants
        grade_s:     "border-violet-400/40 bg-violet-500/15 text-violet-300 px-2.5 py-1 text-xs",
        grade_a:     "border-emerald-400/40 bg-emerald-500/15 text-emerald-300 px-2.5 py-1 text-xs",
        grade_b:     "border-blue-400/40 bg-blue-500/15 text-blue-300 px-2.5 py-1 text-xs",
        grade_c:     "border-amber-400/40 bg-amber-500/15 text-amber-300 px-2.5 py-1 text-xs",
        grade_d:     "border-orange-400/40 bg-orange-500/15 text-orange-300 px-2.5 py-1 text-xs",
        grade_f:     "border-red-400/40 bg-red-500/15 text-red-300 px-2.5 py-1 text-xs",
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

// Helper: pick the right grade variant automatically
export function GradeBadge({ grade }: { grade: "S" | "A" | "B" | "C" | "D" | "F" }) {
  const variantMap: Record<string, BadgeProps["variant"]> = {
    S: "grade_s", A: "grade_a", B: "grade_b", C: "grade_c", D: "grade_d", F: "grade_f",
  };
  return <Badge variant={variantMap[grade]}>Grade {grade}</Badge>;
}

export { Badge, badgeVariants };
