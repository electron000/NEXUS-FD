/* eslint-disable @typescript-eslint/no-explicit-any */
// app/admin/dashboard/page.tsx
"use client";

import React, { useEffect, useState } from "react";
import Image from "next/image";
import {
  Users,
  ShieldCheck,
  Mail,
  LayoutDashboard,
  Check,
  X,
  Eye,
  BarChart3,
  ShieldAlert,
  LogOut,
} from "lucide-react";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  getAdminStats,
  getPendingKYCs,
  reviewKYC,
  AdminStats,
  PendingKYC,
} from "@/services/admin";
import { cn } from "@/lib/utils";
import { useRouter } from "next/navigation";
import { useAppStore } from "@/store/useAppStore";
import { logoutUser, getCurrentUser } from "@/services/auth";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001";

function AdminGuard({ children }: { children: React.ReactNode }) {
  const { isLoggedIn, userProfile } = useAppStore();
  const router = useRouter();

  useEffect(() => {
    if (!isLoggedIn) {
      router.replace("/admin/login");
    } else if (!userProfile?.is_admin) {
      router.replace("/unauthorized");
    }
  }, [isLoggedIn, userProfile, router]);

  if (!isLoggedIn || !userProfile?.is_admin) {
    return (
      <div className="flex h-screen items-center justify-center bg-zinc-950">
        <div className="font-mono text-xs text-zinc-700 animate-pulse uppercase tracking-widest">
          Verifying Admin Credentials...
        </div>
      </div>
    );
  }

  return <>{children}</>;
}

function AdminDashboard() {
  const { logout, login } = useAppStore();
  const router = useRouter();
  const [stats, setStats] = useState<AdminStats | null>(null);
  const [pendingKyc, setPendingKyc] = useState<PendingKYC[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedKyc, setSelectedKyc] = useState<PendingKYC | null>(null);
  const [rejectionReason, setRejectionReason] = useState("");

  const fetchData = async () => {
    try {
      const [s, k] = await Promise.all([getAdminStats(), getPendingKYCs()]);
      setStats(s);
      setPendingKyc(k);
    } catch (err) {
      console.error("Failed to fetch admin data", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    // Wrap the verification in an async function for cleaner type handling
    const verifyAdminSession = async () => {
      try {
        const res = await getCurrentUser();
        // Safely extract the user object.
        // Cast to 'any' to bypass strict TS enforcement of the AxiosResponse shape.
        const userData = (res as any)?.data?.user || (res as any)?.user;

        if (userData && userData.is_admin) {
          login(userData as any); // Cast payload to satisfy the store's UserProfile type
          fetchData();
        } else {
          router.replace("/unauthorized");
        }
      } catch (error) {
        console.error("Admin session verification failed:", error);
        logout();
        router.replace("/admin/login");
      }
    };

    verifyAdminSession();
  }, [login, logout, router]);

  const handleReview = async (
    userId: string,
    status: "verified" | "rejected",
  ) => {
    try {
      await reviewKYC(
        userId,
        status,
        status === "rejected" ? rejectionReason : undefined,
      );
      fetchData();
      setSelectedKyc(null);
      setRejectionReason("");
    } catch {
      alert("Review action failed");
    }
  };

  const handleLogout = async () => {
    await logoutUser();
    logout();
    router.push("/admin/login");
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen font-mono text-zinc-500">
        Initializing Admin Nerve Center...
      </div>
    );
  }

  return (
    <div className="p-8 space-y-8 animate-in fade-in duration-500 bg-black min-h-screen text-white">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="h-10 w-10 rounded-xl bg-purple-600 flex items-center justify-center">
            <LayoutDashboard className="h-6 w-6 text-white" />
          </div>
          <div>
            <h1 className="text-2xl font-bold tracking-tight">
              Admin Nerve Center
            </h1>
            <p className="text-zinc-500 font-mono text-xs uppercase tracking-widest">
              Platform Oversight & Verification
            </p>
          </div>
        </div>
        <div className="flex items-center gap-4">
          <Badge
            variant="outline"
            className="border-green-500/50 text-green-400 bg-green-500/5 font-mono uppercase text-[10px]"
          >
            Live Monitoring
          </Badge>
          <Button
            variant="ghost"
            size="sm"
            onClick={handleLogout}
            className="text-zinc-500 hover:text-red-400 hover:bg-red-500/10 transition-all font-mono text-[10px] uppercase tracking-widest"
          >
            <LogOut className="h-3.5 w-3.5 mr-2" />
            Terminate Session
          </Button>
        </div>
      </div>

      {/* Stats Overview */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        {[
          {
            label: "Total Users",
            value: stats?.totalUsers,
            icon: Users,
            color: "text-blue-400",
          },
          {
            label: "Verified Sellers",
            value: stats?.totalSellers,
            icon: ShieldCheck,
            color: "text-green-400",
          },
          {
            label: "Total Inquiries",
            value: stats?.totalInquiries,
            icon: Mail,
            color: "text-purple-400",
          },
          {
            label: "Connections",
            value: stats?.activeConnections,
            icon: BarChart3,
            color: "text-orange-400",
          },
        ].map((stat, i) => (
          <Card key={i} className="bg-zinc-900/50 border-zinc-800">
            <CardContent className="pt-6">
              <div className="flex items-center justify-between mb-2">
                <p className="font-mono text-[10px] text-zinc-500 uppercase tracking-widest">
                  {stat.label}
                </p>
                <stat.icon className={cn("h-4 w-4", stat.color)} />
              </div>
              <h3 className="text-3xl font-bold tabular-nums">
                {stat.value?.toLocaleString()}
              </h3>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* KYC Table */}
      <Card className="bg-zinc-900/50 border-zinc-800 overflow-hidden">
        <CardHeader className="border-b border-zinc-800 bg-zinc-900/80">
          <CardTitle className="text-lg flex items-center gap-2">
            <ShieldAlert className="h-5 w-5 text-yellow-500" />
            Pending Verification Queue
          </CardTitle>
          <CardDescription className="font-mono text-[11px]">
            Manual review required for Aadhaar documentation.
          </CardDescription>
        </CardHeader>
        <CardContent className="p-0">
          <Table>
            <TableHeader className="bg-black/40">
              <TableRow className="border-zinc-800 hover:bg-transparent">
                <TableHead className="font-mono text-[10px] uppercase text-zinc-500">
                  Applicant
                </TableHead>
                <TableHead className="font-mono text-[10px] uppercase text-zinc-500">
                  Legal Name
                </TableHead>
                <TableHead className="font-mono text-[10px] uppercase text-zinc-500">
                  Parents
                </TableHead>
                <TableHead className="font-mono text-[10px] uppercase text-zinc-500">
                  Submission Date
                </TableHead>
                <TableHead className="font-mono text-[10px] uppercase text-zinc-500 text-right">
                  Actions
                </TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {pendingKyc.length === 0 ? (
                <TableRow>
                  <TableCell
                    colSpan={5}
                    className="h-32 text-center font-mono text-zinc-600 text-xs italic"
                  >
                    Verification queue is currently empty.
                  </TableCell>
                </TableRow>
              ) : (
                pendingKyc.map((kyc) => (
                  <TableRow
                    key={kyc.id}
                    className="border-zinc-800 hover:bg-zinc-800/20"
                  >
                    <TableCell className="font-medium">
                      <div className="flex flex-col">
                        <span className="text-sm">{kyc.name}</span>
                        <span className="text-[10px] font-mono text-zinc-500">
                          {kyc.email}
                        </span>
                      </div>
                    </TableCell>
                    <TableCell className="font-mono text-xs">
                      {kyc.first_name} {kyc.middle_name} {kyc.last_name}
                    </TableCell>
                    <TableCell className="font-mono text-[10px] text-zinc-400">
                      F: {kyc.father_name}
                      <br />
                      M: {kyc.mother_name}
                    </TableCell>
                    <TableCell className="font-mono text-[10px] text-zinc-500">
                      {new Date(kyc.created_at).toLocaleDateString()}
                    </TableCell>
                    <TableCell className="text-right">
                      <Button
                        variant="terminal"
                        size="sm"
                        className="h-8 text-[10px]"
                        onClick={() => setSelectedKyc(kyc)}
                      >
                        <Eye className="h-3.5 w-3.5 mr-1.5" /> Review
                      </Button>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Review Modal */}
      {selectedKyc && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-md p-4">
          <div className="bg-zinc-900 border border-zinc-800 rounded-2xl w-full max-w-4xl max-h-[90vh] overflow-y-auto animate-in zoom-in-95 duration-300">
            <div className="p-6 border-b border-zinc-800 flex items-center justify-between">
              <h2 className="text-xl font-bold">
                Verification Review: {selectedKyc.name}
              </h2>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setSelectedKyc(null)}
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
            <div className="p-8 grid grid-cols-1 md:grid-cols-2 gap-8">
              <div className="space-y-6">
                <div className="space-y-2">
                  <h4 className="font-mono text-[10px] text-zinc-500 uppercase ml-1">
                    Document Evidence
                  </h4>
                  <div className="space-y-4">
                    <div className="group relative rounded-xl border border-zinc-800 overflow-hidden bg-black">
                      <Image
                        src={`${API_URL.replace(/\/$/, "")}${selectedKyc.aadhaar_front_path}`}
                        alt="Front"
                        width={800}
                        height={500}
                        className="w-full h-auto grayscale group-hover:grayscale-0 transition-all duration-500"
                        unoptimized
                      />
                      <div className="absolute top-2 left-2 px-2 py-0.5 rounded bg-black/60 font-mono text-[9px]">
                        FRONT
                      </div>
                    </div>
                    <div className="group relative rounded-xl border border-zinc-800 overflow-hidden bg-black">
                      <Image
                        src={`${API_URL.replace(/\/$/, "")}${selectedKyc.aadhaar_back_path}`}
                        alt="Back"
                        width={800}
                        height={500}
                        className="w-full h-auto grayscale group-hover:grayscale-0 transition-all duration-500"
                        unoptimized
                      />
                      <div className="absolute top-2 left-2 px-2 py-0.5 rounded bg-black/60 font-mono text-[9px]">
                        BACK
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <div className="space-y-6">
                <div className="space-y-4 rounded-xl bg-black/40 border border-zinc-800 p-5">
                  <h4 className="font-mono text-[10px] text-zinc-500 uppercase tracking-widest">
                    Applicant Profile
                  </h4>
                  <div className="space-y-3">
                    <div>
                      <p className="text-[10px] font-mono text-zinc-600">
                        Legal Full Name
                      </p>
                      <p className="text-sm font-bold text-white">
                        {selectedKyc.first_name} {selectedKyc.middle_name}{" "}
                        {selectedKyc.last_name}
                      </p>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <p className="text-[10px] font-mono text-zinc-600">
                          Father&apos;s Name
                        </p>
                        <p className="text-xs text-white">
                          {selectedKyc.father_name}
                        </p>
                      </div>
                      <div>
                        <p className="text-[10px] font-mono text-zinc-600">
                          Mother&apos;s Name
                        </p>
                        <p className="text-xs text-white">
                          {selectedKyc.mother_name}
                        </p>
                      </div>
                    </div>
                    <div>
                      <p className="text-[10px] font-mono text-zinc-600">
                        Residential Address
                      </p>
                      <p className="text-xs text-white leading-relaxed">
                        {selectedKyc.address}
                      </p>
                    </div>
                  </div>
                </div>

                <div className="space-y-3 pt-4 border-t border-zinc-800">
                  <h4 className="font-mono text-[10px] text-zinc-500 uppercase ml-1">
                    Administrative Action
                  </h4>
                  <div className="flex gap-4">
                    <Button
                      className="flex-1 bg-green-600 hover:bg-green-700 text-white"
                      onClick={() => handleReview(selectedKyc.id, "verified")}
                    >
                      <Check className="h-4 w-4 mr-2" /> Approve Seller
                    </Button>
                    <Button
                      variant="destructive"
                      className="flex-1"
                      onClick={() => handleReview(selectedKyc.id, "rejected")}
                    >
                      <X className="h-4 w-4 mr-2" /> Reject
                    </Button>
                  </div>
                  <textarea
                    placeholder="Reason for rejection (if applicable)"
                    value={rejectionReason}
                    onChange={(e) => setRejectionReason(e.target.value)}
                    className="w-full bg-black border border-zinc-800 rounded-lg p-3 font-mono text-[10px] h-20 outline-none focus:border-red-500/50"
                  />
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default function AdminDashboardPage() {
  return (
    <AdminGuard>
      <AdminDashboard />
    </AdminGuard>
  );
}
