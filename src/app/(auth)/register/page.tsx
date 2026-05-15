"use client";

import { useState, useEffect, useCallback } from "react";
import { useForm, useWatch } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Loader2, UserPlus, CheckCircle2, ShieldCheck } from "lucide-react";
import { useAppStore } from "@/store/useAppStore";
import { signupUser, sendOTP, verifyOTP } from "@/services/auth";
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
  
  // Registration States
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  // OTP States
  const [isEmailVerified, setIsEmailVerified] = useState(false);
  const [showOtpInput, setShowOtpInput] = useState(false);
  const [otpCode, setOtpCode] = useState("");
  const [isOtpSending, setIsOtpSending] = useState(false);
  const [isOtpVerifying, setIsOtpVerifying] = useState(false);

  const {
    register,
    handleSubmit,
    control,
    formState: { errors },
  } = useForm<RegisterForm>({
    resolver: zodResolver(registerSchema),
  });

  const emailValue = useWatch({
    control,
    name: "email",
  });

  const handleVerifyOTP = useCallback(async () => {
    setIsOtpVerifying(true);
    setError(null);

    try {
      const result = await verifyOTP(emailValue, otpCode);
      if (result.success) {
        setIsEmailVerified(true);
        setShowOtpInput(false);
      } else {
        setError(result.message);
      }
    } catch {
      setError("Verification failed. Please check the code.");
    } finally {
      setIsOtpVerifying(false);
    }
  }, [emailValue, otpCode]);

  // Auto-verify OTP when 6 digits are reached
  useEffect(() => {
    if (otpCode.length === 6 && !isEmailVerified) {
      const verify = async () => {
        await handleVerifyOTP();
      };
      verify();
    }
  }, [otpCode, isEmailVerified, handleVerifyOTP]);

  async function handleSendOTP() {
    if (!emailValue || errors.email) {
      setError("Please enter a valid email address first.");
      return;
    }

    setIsOtpSending(true);
    setError(null);

    try {
      const result = await sendOTP(emailValue);
      if (result.success) {
        setShowOtpInput(true);
      } else {
        setError(result.message);
      }
    } catch {
      setError("Failed to send verification code.");
    } finally {
      setIsOtpSending(false);
    }
  }

  async function onSubmit(data: RegisterForm) {
    if (!isEmailVerified) {
      setError("Please verify your email first.");
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const result = await signupUser(data.email, data.password, data.name);

      if (!result.success) {
        setError("Registration failed. Please try again.");
        return;
      }

      if (!result.user) {
        setError("Registration succeeded, but user profile data is missing.");
        return;
      }

      login(result.user);
      router.push("/overview");
      
    } catch (err) {
      setError(err instanceof Error ? err.message : "Registration failed.");
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
        
        {/* Email Field with Verify Trigger */}
        <div className="relative">
          <label className="mb-1.5 block font-mono text-[11px] uppercase tracking-widest text-zinc-500">
            Email Address
          </label>
          <div className="relative flex items-center">
            <Input
              id="register-email"
              type="email"
              placeholder="you@fund.com"
              autoComplete="email"
              {...register("email")}
              disabled={isEmailVerified || isOtpSending}
              className={`w-full pr-20 ${isEmailVerified ? 'border-emerald-500/50 bg-emerald-500/5 text-zinc-300' : ''}`}
            />
            
            <div className="absolute right-3">
              {isEmailVerified ? (
                <div className="flex items-center gap-1.5 text-emerald-400 font-mono text-[10px] uppercase tracking-wider font-bold">
                  <CheckCircle2 className="h-3.5 w-3.5" />
                  Verified
                </div>
              ) : (
                emailValue && !errors.email && (
                  <button
                    type="button"
                    onClick={handleSendOTP}
                    disabled={isOtpSending}
                    className="text-blue-400 hover:text-blue-300 font-mono text-[10px] uppercase tracking-wider font-bold transition-colors disabled:opacity-50"
                  >
                    {isOtpSending ? <Loader2 className="h-3 w-3 animate-spin" /> : "Verify"}
                  </button>
                )
              )}
            </div>
          </div>
          {errors.email && <p className="mt-1 font-mono text-[10px] text-red-400">{errors.email.message}</p>}
        </div>

        {/* OTP Input Section */}
        {showOtpInput && !isEmailVerified && (
          <div className="space-y-3 p-4 rounded-lg border border-blue-500/20 bg-blue-500/5 animate-in fade-in slide-in-from-top-2 duration-300">
            <div>
              <label className="mb-1.5 block font-mono text-[11px] uppercase tracking-widest text-blue-400">
                Verification Code
              </label>
              <Input
                id="register-otp"
                type="text"
                maxLength={6}
                placeholder="000000"
                value={otpCode}
                onChange={(e) => setOtpCode(e.target.value.replace(/[^0-9]/g, ""))}
                className="w-full text-center tracking-[1em] font-bold text-lg"
              />
              <div className="mt-2 flex justify-between items-center">
                <p className="font-mono text-[10px] text-zinc-500 italic">
                  Check your email for the 6-digit code.
                </p>
                <button
                  type="button"
                  onClick={handleSendOTP}
                  className="font-mono text-[10px] text-blue-400 hover:underline transition-all"
                >
                  Resend Code
                </button>
              </div>
            </div>
            {isOtpVerifying && (
              <div className="flex items-center justify-center gap-2 font-mono text-[10px] text-blue-400">
                <Loader2 className="h-3 w-3 animate-spin" />
                Authenticating...
              </div>
            )}
          </div>
        )}

        {/* Progressive Disclosure: Name & Password */}
        {isEmailVerified && (
          <div className="space-y-4 animate-in fade-in slide-in-from-top-4 duration-500">
            <div className="pt-2 border-t border-zinc-800/50 my-4" />
            
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

            {/* Password */}
            <div>
              <label className="mb-1.5 block font-mono text-[11px] uppercase tracking-widest text-zinc-500">
                Security Password
              </label>
              <Input
                id="register-password"
                type="password"
                placeholder="••••••••"
                autoComplete="new-password"
                {...register("password")}
                className="w-full"
              />
              {errors.password && <p className="mt-1 font-mono text-[10px] text-red-400">{errors.password.message}</p>}
            </div>
          </div>
        )}

        {error && (
          <div className="rounded-lg border border-red-500/20 bg-red-500/5 px-4 py-3">
            <p className="font-mono text-xs text-red-400">{error}</p>
          </div>
        )}

        <Button
          id="register-submit"
          type="submit"
          disabled={isLoading || !isEmailVerified}
          className={`w-full h-11 font-mono text-sm mt-4 transition-all duration-500 ${
            isEmailVerified 
              ? 'bg-blue-600 hover:bg-blue-500 text-white shadow-lg shadow-blue-500/20' 
              : 'bg-zinc-800 text-zinc-500 cursor-not-allowed border border-zinc-700'
          }`}
        >
          {isLoading ? (
            <>
              <Loader2 className="h-4 w-4 animate-spin" />
              Initializing Terminal...
            </>
          ) : isEmailVerified ? (
            <>
              <ShieldCheck className="h-4 w-4" />
              Activate Access
            </>
          ) : (
            "Verify Email to Continue"
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
