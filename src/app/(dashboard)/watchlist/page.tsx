"use client";

import { Bookmark, Terminal, Trash2 } from "lucide-react";
import { useAppStore } from "@/store/useAppStore";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import Link from "next/link";

export default function WatchlistPage() {
  const { watchlist, removeFromWatchlist } = useAppStore();

  return (
    <div className="space-y-6 w-full">
      <div>
        <h1 className="font-mono text-lg font-bold text-white tracking-tight">
          Watchlist
          <span className="ml-2 text-zinc-600">- Tracked Assets</span>
        </h1>
        <p className="mt-1 font-mono text-xs text-zinc-600">
          Domains you&apos;re monitoring for price movements and availability changes
        </p>
      </div>

      {watchlist.length === 0 ? (
        <div className="flex flex-col items-center gap-5 py-24 text-center">
          <div className="h-16 w-16 flex items-center justify-center rounded-2xl border border-zinc-800 bg-zinc-900/40">
            <Bookmark className="h-7 w-7 text-zinc-700" strokeWidth={1} />
          </div>
          <div>
            <p className="font-mono text-sm font-semibold text-zinc-500">No assets tracked</p>
            <p className="font-mono text-xs text-zinc-700 mt-1">
              Run a domain through the Terminal and click &quot;Watch&quot; to add it here
            </p>
          </div>
          <Link href="/terminal">
            <Button variant="terminal" size="sm">
              <Terminal className="h-3.5 w-3.5" />
              Open Terminal
            </Button>
          </Link>
        </div>
      ) : (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Bookmark className="h-3.5 w-3.5 text-blue-400" strokeWidth={1.5} />
              Tracked Domains
              <Badge variant="primary" className="ml-auto">{watchlist.length}</Badge>
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-1">
            <div className="divide-y divide-zinc-800/60">
              {watchlist.map((entry) => (
                <div
                  key={entry.domain}
                  className="flex items-center justify-between gap-4 py-3 hover:bg-zinc-800/10 transition-colors rounded-lg px-2"
                >
                  <div className="min-w-0">
                    <p className="font-mono text-sm text-white truncate">{entry.domain}</p>
                    <p className="font-mono text-[10px] text-zinc-600 mt-0.5">
                      Added {new Date(entry.addedAt).toLocaleDateString()}
                    </p>
                    {entry.notes && (
                      <p className="font-mono text-[11px] text-zinc-500 mt-1">{entry.notes}</p>
                    )}
                  </div>
                  <div className="flex items-center gap-2 shrink-0">
                    <Link href={`/terminal?q=${entry.domain}`}>
                      <Button variant="terminal" size="sm">
                        <Terminal className="h-3 w-3" />
                        Analyze
                      </Button>
                    </Link>
                    <Button
                      variant="ghost"
                      size="icon-sm"
                      onClick={() => removeFromWatchlist(entry.domain)}
                      className="text-zinc-600 hover:text-red-400 hover:bg-red-500/8"
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
