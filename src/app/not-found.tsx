"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { ShieldAlert, Home, ArrowLeft } from "lucide-react";

export default function NotFound() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-black p-4 text-white">
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_60%_40%_at_50%_50%,rgba(59,130,246,0.03),transparent)]" />
      
      {/* Glitchy background text */}
      <div className="pointer-events-none absolute inset-0 flex items-center justify-center opacity-[0.02] select-none overflow-hidden">
        <span className="font-mono text-[20vw] font-bold tracking-tighter leading-none">404 ERROR 404 ERROR 404 ERROR</span>
      </div>

      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.5 }}
        className="relative z-10 text-center"
      >
        <div className="mx-auto mb-8 flex h-20 w-20 items-center justify-center rounded-2xl bg-red-500/10 border border-red-500/20 shadow-[0_0_30px_-5px_rgba(239,68,68,0.3)]">
          <ShieldAlert className="h-10 w-10 text-red-500" />
        </div>

        <h1 className="mb-4 font-mono text-4xl font-bold tracking-tight md:text-6xl">
          <span className="text-zinc-500">ACCESS_</span>
          <span className="text-red-500">DENIED</span>
        </h1>

        <p className="mx-auto mb-10 max-w-md font-mono text-xs md:text-sm text-zinc-500 uppercase tracking-[0.2em] leading-relaxed">
          The requested asset does not exist in our global registry or your authorization clearance is insufficient.
        </p>

        <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
          <Link
            href="/"
            className="group flex w-full sm:w-auto items-center justify-center gap-2 rounded-xl bg-zinc-900 border border-zinc-800 px-6 py-3 font-mono text-xs font-bold text-white transition-all hover:bg-zinc-800"
          >
            <Home className="h-4 w-4 text-zinc-500 group-hover:text-white transition-colors" />
            RETURN HOME
          </Link>
          
          <Link
            href="/terminal"
            className="group flex w-full sm:w-auto items-center justify-center gap-2 rounded-xl bg-blue-600 px-8 py-3 font-mono text-xs font-bold text-white shadow-[0_0_25px_-5px_rgba(59,130,246,0.4)] transition-all hover:bg-blue-500"
          >
            <ArrowLeft className="h-4 w-4 transition-transform group-hover:-translate-x-1" />
            BACK TO TERMINAL
          </Link>
        </div>

        <div className="mt-16 font-mono text-[10px] text-zinc-700 uppercase tracking-widest">
          Error Code: NEXUS_ERR_0404 · Segment: Alpha_9
        </div>
      </motion.div>
    </div>
  );
}
