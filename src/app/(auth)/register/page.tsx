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
});

type RegisterForm = z.infer<typeof registerSchema>;


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
    formState: { errors },
  } = useForm<RegisterForm>({
    resolver: zodResolver(registerSchema),
  });

  async function onSubmit(data: RegisterForm) {
    setIsLoading(true);
    setError(null);

    try {
      const result = await signupUser(data.email, data.password, data.name);

      if (!result.success) {
        setError("Registration failed. Please try again.");
        return;
      }

      // ADDED: Type guard to ensure result.user is defined
      if (!result.user) {
        setError("Registration succeeded, but user profile data is missing. Please contact support.");
        return;
      }

      // Update store with real auth data safely
      login(result.user);
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
