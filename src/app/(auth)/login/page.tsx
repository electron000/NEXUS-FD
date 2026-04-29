"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Loader2, LogIn, Zap } from "lucide-react";
import { useAppStore } from "@/store/useAppStore";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

// ---------------------------------------------------------------------------
// Schema
// ---------------------------------------------------------------------------

const loginSchema = z.object({
  email: z.string().email("Enter a valid email address"),
  password: z.string().min(6, "Password must be at least 6 characters"),
});

type LoginForm = z.infer<typeof loginSchema>;

// ---------------------------------------------------------------------------
// Page
// ---------------------------------------------------------------------------

export default function LoginPage() {
  const router = useRouter();
  const login = useAppStore((s) => s.login);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    setValue,
    formState: { errors },
  } = useForm<LoginForm>({ resolver: zodResolver(loginSchema) });

  async function onSubmit(data: LoginForm) {
    setIsLoading(true);
    setError(null);
    // Simulate auth latency (NFR-03)
    await new Promise((res) => setTimeout(res, 1200));

    // Mock auth — any valid format passes
    const name = data.email.split("@")[0].replace(/[._-]/g, " ").replace(/\b\w/g, (c) => c.toUpperCase());
    login(data.email, name, "analyst");
    router.push("/overview");
  }

  function prefill() {
    setValue("email", "demo@nexus.io");
    setValue("password", "password");
  }

  return (
    <>
      {/* Header */}
      <div className="mb-8">
        <div className="mb-1 flex items-center gap-2">
          <LogIn className="h-4 w-4 text-blue-400" strokeWidth={1.5} />
          <h1 className="font-mono text-lg font-semibold text-white tracking-tight">
            Sign In
          </h1>
        </div>
        <p className="font-mono text-xs text-zinc-600">
          Access your institutional intelligence terminal
        </p>
      </div>

      {/* Demo prefill */}
      <button
        type="button"
        onClick={prefill}
        className="mb-6 w-full flex items-center gap-2 rounded-lg border border-blue-500/20 bg-blue-500/5 px-4 py-3 text-left transition-colors hover:border-blue-500/40 hover:bg-blue-500/10"
      >
        <Zap className="h-3.5 w-3.5 shrink-0 text-blue-400" strokeWidth={1.5} />
        <div>
          <p className="font-mono text-[11px] text-blue-400 tracking-wider uppercase">Demo Access</p>
          <p className="font-mono text-[10px] text-zinc-600 mt-0.5">demo@nexus.io · password</p>
        </div>
      </button>

      {/* Form */}
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <div>
          <label className="mb-1.5 block font-mono text-[11px] uppercase tracking-widest text-zinc-500">
            Email
          </label>
          <Input
            id="login-email"
            type="email"
            placeholder="analyst@fund.com"
            autoComplete="email"
            {...register("email")}
            className="w-full"
          />
          {errors.email && (
            <p className="mt-1 font-mono text-[10px] text-red-400">{errors.email.message}</p>
          )}
        </div>

        <div>
          <label className="mb-1.5 block font-mono text-[11px] uppercase tracking-widest text-zinc-500">
            Password
          </label>
          <Input
            id="login-password"
            type="password"
            placeholder="••••••••"
            autoComplete="current-password"
            {...register("password")}
            className="w-full"
          />
          {errors.password && (
            <p className="mt-1 font-mono text-[10px] text-red-400">{errors.password.message}</p>
          )}
        </div>

        {error && (
          <div className="rounded-lg border border-red-500/20 bg-red-500/5 px-4 py-3">
            <p className="font-mono text-xs text-red-400">{error}</p>
          </div>
        )}

        <Button
          id="login-submit"
          type="submit"
          disabled={isLoading}
          className="w-full h-11 font-mono text-sm"
        >
          {isLoading ? (
            <>
              <Loader2 className="h-4 w-4 animate-spin" />
              Authenticating...
            </>
          ) : (
            <>
              <LogIn className="h-4 w-4" />
              Access Terminal
            </>
          )}
        </Button>
      </form>

      {/* Footer link */}
      <p className="mt-6 text-center font-mono text-[11px] text-zinc-600">
        No account?{" "}
        <Link
          href="/register"
          className="text-blue-500 hover:text-blue-400 transition-colors"
        >
          Create one
        </Link>
      </p>
    </>
  );
}
