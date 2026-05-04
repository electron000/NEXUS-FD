"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Loader2, UserPlus } from "lucide-react";
import { useAppStore } from "@/store/useAppStore";
import { signupUser } from "@/services/auth";
import type { UserProfile } from "@/types";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

// ---------------------------------------------------------------------------
// Schema
// ---------------------------------------------------------------------------

const registerSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters"),
  email: z.string().email("Enter a valid email address"),
  password: z
    .string()
    .min(8, "Password must be at least 8 characters")
    .regex(/[A-Z]/, "Must contain an uppercase letter")
    .regex(/[0-9]/, "Must contain a number"),
  role: z.enum(["investor", "brand_manager", "analyst"]),
});

type RegisterForm = z.infer<typeof registerSchema>;

const ROLES: { value: UserProfile["role"]; label: string; desc: string }[] = [
  { value: "investor",      label: "Domain Investor",    desc: "Portfolio analysis & arbitrage signals" },
  { value: "brand_manager", label: "Brand Manager",       desc: "Bulk discovery & WHOIS intelligence" },
  { value: "analyst",       label: "Financial Analyst",   desc: "TCO modeling & market metrics" },
];

// ---------------------------------------------------------------------------
// Page
// ---------------------------------------------------------------------------

export default function RegisterPage() {
  const router = useRouter();
  const login = useAppStore((s) => s.login);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    formState: { errors },
  } = useForm<RegisterForm>({
    resolver: zodResolver(registerSchema),
    defaultValues: { role: "analyst" },
  });

  // eslint-disable-next-line react-hooks/incompatible-library
  const selectedRole = watch("role");


  async function onSubmit(data: RegisterForm) {
    setIsLoading(true);
    setError(null);

    try {
      const result = await signupUser(data.email, data.password, data.name);
      
      if (!result.success) {
        setError("Registration failed. Please try again.");
        return;
      }

      // Update store with real auth data
      login(result.user!.email, result.user!.name, result.user!.token, data.role);
      router.push("/overview");
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "Registration failed. Please try again.";
      setError(errorMessage);
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <>
      {/* Header */}
      <div className="mb-7">
        <div className="mb-1 flex items-center gap-2">
          <UserPlus className="h-4 w-4 text-blue-400" strokeWidth={1.5} />
          <h1 className="font-mono text-lg font-semibold text-white tracking-tight">
            Create Profile
          </h1>
        </div>
        <p className="font-mono text-xs text-zinc-600">
          Configure your institutional access profile
        </p>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        {/* Name */}
        <div>
          <label className="mb-1.5 block font-mono text-[11px] uppercase tracking-widest text-zinc-500">
            Full Name
          </label>
          <Input
            id="register-name"
            type="text"
            placeholder="Alex Morgan"
            {...register("name")}
            className="w-full"
          />
          {errors.name && <p className="mt-1 font-mono text-[10px] text-red-400">{errors.name.message}</p>}
        </div>

        {/* Email */}
        <div>
          <label className="mb-1.5 block font-mono text-[11px] uppercase tracking-widest text-zinc-500">
            Email
          </label>
          <Input
            id="register-email"
            type="email"
            placeholder="you@fund.com"
            autoComplete="email"
            {...register("email")}
            className="w-full"
          />
          {errors.email && <p className="mt-1 font-mono text-[10px] text-red-400">{errors.email.message}</p>}
        </div>

        {/* Password */}
        <div>
          <label className="mb-1.5 block font-mono text-[11px] uppercase tracking-widest text-zinc-500">
            Password
          </label>
          <Input
            id="register-password"
            type="password"
            placeholder="Min 8 chars, 1 uppercase, 1 number"
            autoComplete="new-password"
            {...register("password")}
            className="w-full"
          />
          {errors.password && <p className="mt-1 font-mono text-[10px] text-red-400">{errors.password.message}</p>}
        </div>

        {/* Role selector */}
        <div>
          <label className="mb-2 block font-mono text-[11px] uppercase tracking-widest text-zinc-500">
            User Profile
          </label>
          <div className="space-y-2">
            {ROLES.map((r) => (
              <button
                key={r.value}
                type="button"
                onClick={() => setValue("role", r.value)}
                className={`w-full flex items-start gap-3 rounded-lg border px-4 py-3 text-left transition-all duration-200 ${
                  selectedRole === r.value
                    ? "border-blue-500/50 bg-blue-500/8 shadow-[0_0_15px_-5px_rgba(59,130,246,0.3)]"
                    : "border-zinc-800 bg-transparent hover:border-zinc-700 hover:bg-zinc-800/20"
                }`}
              >
                <div
                  className={`mt-0.5 h-3.5 w-3.5 shrink-0 rounded-full border-2 transition-colors ${
                    selectedRole === r.value ? "border-blue-400 bg-blue-400" : "border-zinc-600"
                  }`}
                />
                <div>
                  <p className="font-mono text-xs font-semibold text-white">{r.label}</p>
                  <p className="font-mono text-[10px] text-zinc-500 mt-0.5">{r.desc}</p>
                </div>
              </button>
            ))}
          </div>
          {errors.role && <p className="mt-1 font-mono text-[10px] text-red-400">{errors.role.message}</p>}
        </div>

        {error && (
          <div className="rounded-lg border border-red-500/20 bg-red-500/5 px-4 py-3">
            <p className="font-mono text-xs text-red-400">{error}</p>
          </div>
        )}

        <Button
          id="register-submit"
          type="submit"
          disabled={isLoading}
          className="w-full h-11 font-mono text-sm mt-2"
        >
          {isLoading ? (
            <>
              <Loader2 className="h-4 w-4 animate-spin" />
              Creating Profile...
            </>
          ) : (
            <>
              <UserPlus className="h-4 w-4" />
              Activate Terminal Access
            </>
          )}
        </Button>
      </form>

      <p className="mt-6 text-center font-mono text-[11px] text-zinc-600">
        Already have an account?{" "}
        <Link href="/login" className="text-blue-500 hover:text-blue-400 transition-colors">
          Sign in
        </Link>
      </p>
    </>
  );
}
