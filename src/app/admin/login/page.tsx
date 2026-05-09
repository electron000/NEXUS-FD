"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { ShieldAlert, ArrowRight, Lock } from "lucide-react";
import { useAppStore } from "@/store/useAppStore";
import { loginUser } from "@/services/auth";
import { toast } from "sonner";

export default function AdminLoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const { login } = useAppStore();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const result = await loginUser(email, password);
      if (result.success && result.user?.is_admin) {
        login(result.user);
        toast.success("Admin Authentication Successful");
        router.push("/admin/dashboard");
      } else if (result.success && !result.user?.is_admin) {
        toast.error("Unauthorized: Admin privileges required");
      } else {
        toast.error("Invalid credentials");
      }
    } catch (err) {
      toast.error("Internal Server Error");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-black p-4">
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_60%_40%_at_50%_50%,rgba(59,130,246,0.05),transparent)]" />
      
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="relative w-full max-w-md overflow-hidden rounded-2xl border border-zinc-800 bg-zinc-950 p-8 shadow-2xl"
      >
        <div className="mb-8 text-center">
          <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-blue-500/10 border border-blue-500/20">
            <ShieldAlert className="h-6 w-6 text-blue-500" />
          </div>
          <h1 className="font-mono text-xl font-bold text-white tracking-widest uppercase">Admin Terminal</h1>
          <p className="mt-2 font-mono text-[10px] text-zinc-500 tracking-widest uppercase">
            Restricted Access · Level 4 Authorization
          </p>
        </div>

        <form onSubmit={handleLogin} className="space-y-4">
          <div>
            <label className="mb-1.5 block font-mono text-[10px] text-zinc-500 tracking-widest uppercase">Email</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full rounded-lg border border-zinc-800 bg-zinc-900 px-4 py-2.5 font-mono text-sm text-white placeholder-zinc-700 outline-none transition-all focus:border-blue-500/50"
              placeholder="admin@nexus.io"
              required
            />
          </div>

          <div>
            <label className="mb-1.5 block font-mono text-[10px] text-zinc-500 tracking-widest uppercase">Password</label>
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-zinc-600" />
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full rounded-lg border border-zinc-800 bg-zinc-900 pl-10 pr-4 py-2.5 font-mono text-sm text-white placeholder-zinc-700 outline-none transition-all focus:border-blue-500/50"
                placeholder="••••••••"
                required
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="group flex w-full items-center justify-center gap-2 rounded-lg bg-blue-600 py-3 font-mono text-xs font-bold text-white transition-all hover:bg-blue-500 disabled:opacity-50"
          >
            {loading ? "AUTHENTICATING..." : "INITIALIZE SESSION"}
            <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
          </button>
        </form>

        <div className="mt-8 border-t border-zinc-900 pt-6 text-center">
          <p className="font-mono text-[9px] text-zinc-600 uppercase tracking-widest">
            Warning: All access attempts are logged. 
            Unauthorized access is strictly prohibited.
          </p>
        </div>
      </motion.div>
    </div>
  );
}
