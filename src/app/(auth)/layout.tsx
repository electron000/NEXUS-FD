"use client";

import { ReactNode } from "react";
import Image from "next/image";
import Link from "next/link";

export default function AuthLayout({ children }: { children: ReactNode }) {
  return (
    <div className="relative flex min-h-screen flex-col items-center justify-center bg-[#09090b] overflow-hidden">
      {/* Background grid */}
      <div
        className="pointer-events-none absolute inset-0 opacity-[0.022]"
        style={{
          backgroundImage:
            "linear-gradient(rgba(59,130,246,0.8) 1px, transparent 1px), linear-gradient(90deg, rgba(59,130,246,0.8) 1px, transparent 1px)",
          backgroundSize: "60px 60px",
        }}
      />
      {/* Radial glow */}
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_60%_50%_at_50%_-10%,rgba(59,130,246,0.1),transparent)]" />
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_40%_30%_at_50%_110%,rgba(6,182,212,0.06),transparent)]" />

      {/* Logo */}
      <div className="relative z-10 mb-8 flex flex-col items-center gap-3">
        <Link href="/" className="flex items-center gap-3 group">
          <Image
            src="/nexus.webp"
            alt="Nexus Logo"
            width={40}
            height={40}
            className="object-contain opacity-90 group-hover:opacity-100 transition-opacity"
          />
          <span className="font-mono text-xl font-bold tracking-[0.2em] text-white uppercase">
            NEXUS
          </span>
        </Link>
        <p className="font-mono text-[11px] tracking-widest text-zinc-600 uppercase">
          Digital Asset Terminal
        </p>
      </div>

      {/* Auth card */}
      <div className="relative z-10 w-full max-w-md px-4">
        <div className="rounded-2xl border border-zinc-800/70 bg-zinc-950/90 p-8 shadow-[0_0_80px_-20px_rgba(59,130,246,0.2)] backdrop-blur-xl">
          {children}
        </div>
      </div>

      {/* Footer */}
      <p className="relative z-10 mt-8 font-mono text-[10px] text-zinc-700">
        © 2025 Nexus Digital Asset Terminal
      </p>
    </div>
  );
}
