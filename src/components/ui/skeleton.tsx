import { cn } from "@/lib/utils";

// ---------------------------------------------------------------------------
// Skeleton — Loading placeholder blocks
// ---------------------------------------------------------------------------

function Skeleton({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn(
        "animate-pulse rounded-md bg-zinc-800/70",
        className
      )}
      {...props}
    />
  );
}

export { Skeleton };
