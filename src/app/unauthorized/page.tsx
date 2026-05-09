"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { Lock, LayoutDashboard, ArrowLeft } from "lucide-react";

export default function UnauthorizedPage() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-black p-4 text-white">
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_60%_40%_at_50%_50%,rgba(168,85,247,0.03),transparent)]" />
      
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="relative z-10 text-center"
      >
        <div className="mx-auto mb-8 flex h-20 w-20 items-center justify-center rounded-2xl bg-purple-500/10 border border-purple-500/20 shadow-[0_0_30px_-5px_rgba(168,85,247,0.3)]">
          <Lock className="h-10 w-10 text-purple-500" />
        </div>

        <h1 className="mb-4 font-mono text-4xl font-bold tracking-tight md:text-6xl">
          <span className="text-zinc-500">CLEARANCE_</span>
          <span className="text-purple-500">LOW</span>
        </h1>

        <p className="mx-auto mb-10 max-w-md font-mono text-xs md:text-sm text-zinc-500 uppercase tracking-[0.2em] leading-relaxed">
          Your current security clearance level is insufficient to access the Admin Nerve Center. 
          Please contact system administrators for elevated privileges.
        </p>

        <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
          <Link
            href="/overview"
            className="group flex w-full sm:w-auto items-center justify-center gap-2 rounded-xl bg-zinc-900 border border-zinc-800 px-6 py-3 font-mono text-xs font-bold text-white transition-all hover:bg-zinc-800"
          >
            <LayoutDashboard className="h-4 w-4 text-zinc-500 group-hover:text-white transition-colors" />
            MY DASHBOARD
          </Link>
          
          <Link
            href="/terminal"
            className="group flex w-full sm:w-auto items-center justify-center gap-2 rounded-xl bg-purple-600 px-8 py-3 font-mono text-xs font-bold text-white shadow-[0_0_25px_-5px_rgba(168,85,247,0.4)] transition-all hover:bg-purple-500"
          >
            <ArrowLeft className="h-4 w-4 transition-transform group-hover:-translate-x-1" />
            BACK TO SAFETY
          </Link>
        </div>

        <div className="mt-16 font-mono text-[10px] text-zinc-700 uppercase tracking-widest">
          Auth Context: FORBIDDEN · Clearance Level: Standard_User
        </div>
      </motion.div>
    </div>
  );
}
