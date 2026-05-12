/* eslint-disable @typescript-eslint/no-explicit-any */
// app/(dashboard)/portfolio/page.tsx
"use client";

import { useState, useEffect } from "react";
import {
  AlertCircle,
  Briefcase,
  Plus,
  Globe,
  CheckCircle2,
  Clock,
  ShieldCheck,
  Upload,
  FileCheck,
  ArrowRight,
  User as UserIcon,
  Home,
  X,
  Trash2,
  Copy,
  Info,
  Check,
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
import { Input } from "@/components/ui/input";
import { Progress } from "@/components/ui/progress";
import { useAppStore } from "@/store/useAppStore";
import { apiClient } from "@/services/config";
import { submitKYC, deletePortfolioItem } from "@/services/user";
import { cn } from "@/lib/utils";
import { toast } from "sonner";

interface PortfolioDomain {
  id: string;
  domain: string;
  is_for_sale: boolean;
  asking_price: number | null;
  bought_price: number;
  verification_status: "pending" | "verified" | "failed";
  verification_token: string;
  created_at: string;
}

export default function PortfolioPage() {
  const [domains, setDomains] = useState<PortfolioDomain[]>([]);
  const [newDomain, setNewDomain] = useState("");
  const [boughtPrice, setBoughtPrice] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { userProfile, updateProfile } = useAppStore();

  // KYC Modal State
  const [isKycModalOpen, setIsKycModalOpen] = useState(false);
  const [step, setStep] = useState(1);
  const [isSubmittingKyc, setIsSubmittingKyc] = useState(false);
  const [kycStatus, setKycStatus] = useState<"idle" | "success" | "error">(
    "idle",
  );
  const [kycErrorMessage, setKycErrorMessage] = useState("");

  // Shared Action Modal State
  const [actionModal, setActionModal] = useState<{
    isOpen: boolean;
    type: "delete" | "verify_success" | "dns_guide";
    domain?: PortfolioDomain;
  }>({ isOpen: false, type: "delete" });

  const [copiedToken, setCopiedToken] = useState<string | null>(null);

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedToken(text);
    setTimeout(() => setCopiedToken(null), 2000);
  };

  const [formData, setFormData] = useState({
    firstName: "",
    middleName: "",
    lastName: "",
    fatherName: "",
    motherName: "",
    address: "",
  });

  const [files, setFiles] = useState<{ front: File | null; back: File | null }>(
    {
      front: null,
      back: null,
    },
  );

  const fetchPortfolio = async () => {
    try {
      const res = await apiClient.get("/api/user/portfolio");
      setDomains(res as unknown as PortfolioDomain[]);
    } catch {
      console.error("Failed to fetch portfolio");
    }
  };

  useEffect(() => {
    const loadPortfolio = async () => {
      await fetchPortfolio();
    };
    loadPortfolio();
  }, []);

  const handleAddDomain = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newDomain || !boughtPrice) return;

    // Enforcement: Must be a verified seller to list assets
    if (userProfile?.kyc_status !== "verified") {
      setStep(0);
      setIsKycModalOpen(true);
      return;
    }

    setIsSubmitting(true);
    try {
      await apiClient.post("/api/user/portfolio", {
        domain: newDomain.toLowerCase().trim(),
        boughtPrice: parseFloat(boughtPrice),
      });
      setNewDomain("");
      setBoughtPrice("");
      toast.success(`${newDomain.toLowerCase()} added to portfolio`);
      fetchPortfolio();
    } catch (err: any) {
      const msg = err.response?.data?.error || err.message || "Unknown error";
      toast.error(`Failed to add domain: ${msg}`);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleVerify = async (domain: string, method: "dns") => {
    try {
      const res: { success?: boolean; error?: string } = await apiClient.post(
        "/api/user/portfolio/verify",
        {
          domain,
          method,
        },
      );
      if (res.success) {
        setActionModal({
          isOpen: true,
          type: "verify_success",
          domain: domains.find((d) => d.domain === domain),
        });
        fetchPortfolio();
      } else {
        toast.error(
          res.error || "Verification failed. Ensure records are correctly set.",
        );
      }
    } catch {
      toast.error("Technical error during verification.");
    }
  };

  const handleDeleteDomain = async (domain: PortfolioDomain) => {
    setActionModal({ isOpen: true, type: "delete", domain });
  };

  const confirmDelete = async () => {
    if (!actionModal.domain) return;
    try {
      await deletePortfolioItem(actionModal.domain.id);
      toast.success("Domain deleted from portfolio");
      fetchPortfolio();
      setActionModal({ ...actionModal, isOpen: false });
    } catch {
      toast.error("Failed to delete domain.");
    }
  };

  // KYC Methods
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleFileChange = (
    e: React.ChangeEvent<HTMLInputElement>,
    side: "front" | "back",
  ) => {
    if (e.target.files && e.target.files[0]) {
      setFiles({ ...files, [side]: e.target.files[0] });
    }
  };

  const handleKycSubmit = async () => {
    setIsSubmittingKyc(true);
    setKycErrorMessage("");

    try {
      const data = new FormData();
      data.append("firstName", formData.firstName);
      data.append("middleName", formData.middleName);
      data.append("lastName", formData.lastName);
      data.append("fatherName", formData.fatherName);
      data.append("motherName", formData.motherName);
      data.append("address", formData.address);

      if (files.front) data.append("aadhaar_front", files.front);
      if (files.back) data.append("aadhaar_back", files.back);

      await submitKYC(data);
      updateProfile({ kyc_status: "pending" });
      setKycStatus("success");
    } catch (err: Error | unknown) {
      const error = err instanceof Error ? err : new Error(String(err));
      const errorMsg =
        error instanceof Error && "response" in error
          ? (error as any).response?.data?.error ||
            "Failed to submit KYC. Please try again."
          : "Failed to submit KYC. Please try again.";
      setKycErrorMessage(errorMsg);
      setKycStatus("error");
    } finally {
      setIsSubmittingKyc(false);
    }
  };

  const resetModal = () => {
    setIsKycModalOpen(false);
    setTimeout(() => {
      setStep(0);
      setKycStatus("idle");
    }, 300); // Clear state after transition out
  };

  return (
    <>
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-zinc-800/50 pb-6">
          <div>
            <h1 className="font-mono text-lg font-bold text-white tracking-tight flex items-center gap-3">
              Sale Portfolio
              {userProfile?.kyc_status === "verified" && (
                <Badge
                  variant="outline"
                  className="bg-purple-500/10 border-purple-500/30 text-purple-400 gap-1 rounded-md px-2 py-0.5"
                >
                  <ShieldCheck className="h-3.5 w-3.5" />
                  Verified Seller
                </Badge>
              )}
              {userProfile?.kyc_status === "pending" && (
                <Badge
                  variant="outline"
                  className="bg-amber-500/10 border-amber-500/30 text-amber-400 gap-1 rounded-md px-2 py-0.5"
                >
                  <Clock className="h-3.5 w-3.5" />
                  Verification Pending
                </Badge>
              )}
              {userProfile?.kyc_status === "rejected" && (
                <Badge
                  variant="outline"
                  className="bg-red-500/10 border-red-500/30 text-red-400 gap-1 rounded-md px-2 py-0.5"
                >
                  <AlertCircle className="h-3.5 w-3.5" />
                  Rejected
                </Badge>
              )}
            </h1>
            <p className="mt-1 font-mono text-xs text-zinc-600 tracking-widest opacity-70">
              List and verify your digital assets for the Nexus ecosystem.
            </p>
          </div>

          <div className="flex items-center gap-3 self-start sm:self-auto">
            {userProfile?.kyc_status !== "verified" && userProfile?.kyc_status !== "pending" && (
              <button
                onClick={() => {
                  setStep(0);
                  setIsKycModalOpen(true);
                }}
                className="flex items-center gap-2 px-3 py-1.5 rounded-lg border border-amber-500/30 bg-amber-500/5 hover:bg-amber-500/10 hover:border-amber-500/50 transition-all group"
              >
                <ShieldCheck className="h-3.5 w-3.5 text-amber-500" />
                <span className="font-mono text-[10px] font-bold text-amber-500/80 uppercase tracking-[0.2em] group-hover:text-amber-400">
                  {userProfile?.kyc_status === "rejected" ? "Re-verify Identity" : "Become a Verified Seller"}
                </span>
              </button>
            )}

            <button
              onClick={() => setActionModal({ isOpen: true, type: "dns_guide" })}
              className="flex items-center gap-2 px-3 py-1.5 rounded-lg border border-zinc-800 bg-zinc-900/50 hover:bg-zinc-800 hover:border-zinc-700 transition-all group"
            >
              <Info className="h-3.5 w-3.5 text-blue-400" />
              <span className="font-mono text-[10px] font-bold text-zinc-400 uppercase tracking-[0.2em] group-hover:text-white">
                DNS Verification Guide
              </span>
            </button>
          </div>
        </div>

        {userProfile?.kyc_status === "rejected" && (
          <div className="p-4 rounded-xl border border-red-500/20 bg-red-500/5 flex items-start gap-4 animate-in slide-in-from-top-2">
            <AlertCircle className="h-5 w-5 text-red-500 shrink-0 mt-0.5" />
            <div className="space-y-1">
              <h4 className="font-mono text-sm font-bold text-red-400 uppercase tracking-tight">Verification Rejected</h4>
              <p className="font-mono text-xs text-red-300/70 leading-relaxed">
                {userProfile.kyc_rejection_reason || "Your verification request was declined. Please review your documents and try again."}
              </p>
            </div>
          </div>
        )}

        {userProfile?.kyc_status === "pending" && (
          <div className="p-4 rounded-xl border border-blue-500/20 bg-blue-500/5 flex items-start gap-4 animate-in slide-in-from-top-2">
            <Clock className="h-5 w-5 text-blue-500 shrink-0 mt-0.5" />
            <div className="space-y-1">
              <h4 className="font-mono text-sm font-bold text-blue-400 uppercase tracking-tight">Identity Audit in Progress</h4>
              <p className="font-mono text-xs text-blue-300/70 leading-relaxed">
                Your verification documents are currently being processed by the NEXUS security team. This usually takes 24-48 hours.
              </p>
            </div>
          </div>
        )}
        <Card>
          <CardContent className="py-5">
            <form
              onSubmit={handleAddDomain}
              className="flex flex-col md:flex-row gap-3"
            >
              <div className="flex-1 relative">
                <Globe className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-zinc-600" />
                <input
                  id="add-asset-input"
                  type="text"
                  value={newDomain}
                  onChange={(e) => setNewDomain(e.target.value)}
                  placeholder="Enter domain name (e.g. quantum.ai)"
                  className="w-full bg-zinc-950 border border-zinc-800 rounded-lg pl-10 pr-4 py-2 font-mono text-sm text-white placeholder-zinc-700 focus:border-blue-500/50 outline-none transition-all"
                />
              </div>
              <div className="md:w-48 relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-600 font-mono text-sm">₹</span>
                <input
                  id="bought-price-input"
                  type="number"
                  step="0.01"
                  min="0"
                  value={boughtPrice}
                  onChange={(e) => setBoughtPrice(e.target.value)}
                  placeholder="Bought Price"
                  className="w-full bg-zinc-950 border border-zinc-800 rounded-lg pl-8 pr-4 py-2 font-mono text-sm text-white placeholder-zinc-700 focus:border-blue-500/50 outline-none transition-all"
                />
              </div>
              <Button
                type="submit"
                disabled={isSubmitting || !newDomain || !boughtPrice}
                className="font-mono text-xs px-6 w-full md:w-auto"
              >
                {isSubmitting ? (
                  "Adding..."
                ) : userProfile?.kyc_status === "verified" ? (
                  <>
                    Add to Portfolio
                    <Plus className="ml-2 h-4 w-4" />
                  </>
                ) : (
                  <>
                    Verify to List
                    <ShieldCheck className="ml-2 h-4 w-4 text-amber-400" />
                  </>
                )}
              </Button>
            </form>
          </CardContent>
        </Card>

        {/* Domains List */}
        <div className="grid grid-cols-1 gap-4">
          {domains.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-20 px-4 rounded-2xl border border-dashed border-zinc-800 bg-zinc-900/20">
              <div className="relative mb-6">
                <div className="absolute inset-0 bg-blue-500/10 blur-3xl rounded-full" />
                <div className="relative h-20 w-20 flex items-center justify-center rounded-2xl border border-zinc-800 bg-zinc-900 shadow-2xl">
                  <Briefcase
                    className="h-10 w-10 text-zinc-700"
                    strokeWidth={1}
                  />
                </div>
                <div className="absolute -bottom-2 -right-2 h-8 w-8 flex items-center justify-center rounded-lg bg-blue-600 shadow-lg shadow-blue-900/40">
                  <Plus className="h-5 w-5 text-white" />
                </div>
              </div>
              <h3 className="font-mono text-lg font-bold text-white mb-2">
                Build Your Digital Portfolio
              </h3>
              <p className="font-mono text-xs text-zinc-500 text-center max-w-sm mb-8 leading-relaxed">
                Connect your domains to the NEXUS Intelligence Core. Verified
                assets gain institutional visibility.
              </p>
            </div>
          ) : (
            domains.map((d) => (
              <Card
                key={d.id}
                className={
                  d.verification_status === "verified"
                    ? "border-green-500/20"
                    : ""
                }
              >
                <CardContent className="py-4">
                  <div className="flex flex-wrap items-center justify-between gap-4">
                    <div className="flex items-center gap-4">
                      <div
                        className={cn(
                          "h-10 w-10 rounded-lg flex items-center justify-center border",
                          d.verification_status === "verified"
                            ? "bg-green-500/10 border-green-500/20 text-green-500"
                            : "bg-zinc-900 border-zinc-800 text-zinc-600",
                        )}
                      >
                        <Globe className="h-5 w-5" />
                      </div>
                      <div>
                        <h3 className="font-mono text-sm font-bold text-white">
                          {d.domain}
                        </h3>
                        <p className="font-mono text-[10px] text-zinc-600">
                          Added on {new Date(d.created_at).toLocaleDateString()}
                        </p>
                      </div>
                    </div>

                    <div className="flex flex-wrap items-center gap-6">
                      <div className="flex flex-col items-center">
                        <span className="font-mono text-[9px] text-zinc-700 uppercase mb-1">
                          Status
                        </span>
                        {d.verification_status === "verified" ? (
                          <Badge variant="positive" className="gap-1 px-2">
                            <CheckCircle2 className="h-3 w-3" /> Verified
                          </Badge>
                        ) : (
                          <Badge
                            variant="outline"
                            className="gap-1 px-2 text-zinc-500 border-zinc-800"
                          >
                            <AlertCircle className="h-3 w-3" /> Pending
                          </Badge>
                        )}
                      </div>

                      <div className="flex flex-col items-center">
                        <span className="font-mono text-[9px] text-zinc-700 uppercase mb-1">
                          Bought Price
                        </span>
                        <span className="font-mono text-sm font-bold text-white">
                          ₹{parseFloat(String(d.bought_price || 0)).toLocaleString("en-IN")}
                        </span>
                      </div>

                      {d.verification_status !== "verified" && (
                        <div className="p-3 bg-zinc-950 border border-zinc-800 rounded-lg flex items-center gap-4">
                          <div className="flex-1">
                            <p className="font-mono text-[9px] text-zinc-600 uppercase">
                              Verification Token
                            </p>
                            <div className="flex items-center gap-2">
                              <code className="font-mono text-[11px] text-blue-400">
                                nexus-site-verification={d.verification_token}
                              </code>
                              <button
                                onClick={() => copyToClipboard(`nexus-site-verification=${d.verification_token}`)}
                                className="p-1 rounded hover:bg-zinc-800 text-zinc-500 hover:text-blue-400 transition-all"
                                title="Copy Token"
                              >
                                {copiedToken === `nexus-site-verification=${d.verification_token}` ? (
                                  <Check className="h-3 w-3 text-emerald-500" />
                                ) : (
                                  <Copy className="h-3 w-3" />
                                )}
                              </button>
                            </div>
                          </div>
                          <div className="flex items-center">
                            <Button
                              variant="secondary"
                              size="sm"
                              className="h-7 font-mono text-[10px]"
                              onClick={() => handleVerify(d.domain, "dns")}
                            >
                              Verify DNS
                            </Button>
                          </div>
                        </div>
                      )}

                      <div className="flex items-center">
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => handleDeleteDomain(d)}
                          className="text-zinc-600 hover:text-red-400 hover:bg-red-400/10 transition-all h-8 w-8"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))
          )}
        </div>
      </div>

      {/* Embedded Full-Screen KYC Modal */}
      {isKycModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 bg-black/80 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="w-full max-w-3xl bg-[#09090b] border border-zinc-800 rounded-xl shadow-2xl overflow-hidden flex flex-col max-h-[95vh]">
            <div className="flex items-center justify-between p-4 border-b border-zinc-800/50 bg-zinc-950 shrink-0">
              <h2 className="text-lg font-bold text-white tracking-tight">
                Become a Verified Seller
              </h2>
              <button
                onClick={resetModal}
                className="p-1.5 rounded-md text-zinc-500 hover:text-white hover:bg-zinc-800 transition-colors"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="p-6 overflow-y-auto">
              {kycStatus === "success" ? (
                <div className="flex flex-col items-center justify-center py-16 animate-in zoom-in duration-300">
                  <div className="h-20 w-20 rounded-full bg-blue-500/20 flex items-center justify-center mb-6 border border-blue-500/50">
                    <Clock className="h-10 w-10 text-blue-400" />
                  </div>
                  <h2 className="text-2xl font-bold text-white mb-2">
                    Verification Pending
                  </h2>
                  <p className="text-zinc-500 text-center max-w-md font-mono text-sm mb-8">
                    Your verification is currently under review by the NEXUS
                    administration team. The{" "}
                    <span className="text-purple-400 font-bold">
                      Verified Seller
                    </span>{" "}
                    badge will appear once approved.
                  </p>
                  <Button
                    onClick={resetModal}
                    className="bg-zinc-800 text-white hover:bg-zinc-700"
                  >
                    Close Window
                  </Button>
                </div>
              ) : (
                <div className="space-y-8 animate-in slide-in-from-bottom-4 duration-500">
                  <div className="flex flex-col gap-1">
                    <p className="text-zinc-500 font-mono text-sm">
                      Complete identity verification to list domains on the
                      Nexus Exchange.
                    </p>
                  </div>

                  <div className="flex items-center gap-4 mb-4">
                    <div className="flex-1">
                      <Progress
                        value={(step / 3) * 100}
                        className="h-1 bg-zinc-800"
                      />
                    </div>
                    <span className="font-mono text-[10px] text-zinc-600 uppercase tracking-widest whitespace-nowrap">
                      Step {step} of 3
                    </span>
                  </div>

                  <Card className="border-zinc-800 bg-zinc-900/50 backdrop-blur-sm">
                    <CardHeader className="border-b border-zinc-800/50 bg-zinc-900/20">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <div className="h-8 w-8 rounded-lg bg-purple-500/10 flex items-center justify-center border border-purple-500/20">
                            <ShieldCheck className="h-4 w-4 text-purple-400" />
                          </div>
                          <div>
                            <CardTitle className="font-mono text-sm font-bold text-white uppercase tracking-tight">
                              {step === 0 ? "Verified Nexus Seller" : "Identity Verification"}
                            </CardTitle>
                            {step > 0 && (
                              <p className="text-[9px] font-mono text-zinc-600 uppercase tracking-widest mt-0.5">
                                Step {step} of 3 • Secure Nexus Portal
                              </p>
                            )}
                          </div>
                        </div>
                        <button
                          onClick={resetModal}
                          className="p-1 rounded-md text-zinc-600 hover:bg-zinc-800 hover:text-zinc-400 transition-all"
                        >
                          <X className="h-4 w-4" />
                        </button>
                      </div>
                    </CardHeader>
                    <CardContent className="pt-6 space-y-6">
                      {step === 0 && (
                        <div className="space-y-6">
                          <div className="p-4 rounded-xl border border-amber-500/20 bg-amber-500/5">
                            <p className="font-mono text-xs text-amber-200/80 leading-relaxed">
                              Your current status is <span className="font-bold uppercase text-amber-400">{userProfile?.kyc_status || "unverified"}</span>. 
                              To unlock the full potential of the NEXUS Marketplace, you must become a Verified Seller.
                            </p>
                          </div>

                          <div className="space-y-4">
                            <h4 className="font-mono text-[10px] font-bold text-zinc-500 uppercase tracking-[0.2em]">Benefits of Verification</h4>
                            <div className="grid gap-3">
                              {[
                                { title: "Nexus Marketplace Access", desc: "List your domains for sale to thousands of global buyers." },
                                { title: "Verified Trust Badge", desc: "Gain institutional trust with a purple verification seal." },
                                { title: "Instant Liquidity", desc: "Accept direct offers and negotiate in our secure exchange." },
                                { title: "Priority Support", desc: "Direct access to our asset management and escrow team." }
                              ].map((benefit, i) => (
                                <div key={i} className="flex gap-3">
                                  <div className="h-5 w-5 shrink-0 rounded bg-blue-500/10 flex items-center justify-center border border-blue-500/20 mt-0.5">
                                    <CheckCircle2 className="h-3 w-3 text-blue-400" />
                                  </div>
                                  <div>
                                    <p className="font-mono text-[11px] font-bold text-white">{benefit.title}</p>
                                    <p className="font-mono text-[10px] text-zinc-500">{benefit.desc}</p>
                                  </div>
                                </div>
                              ))}
                            </div>
                          </div>
                        </div>
                      )}
                      {step === 1 && (
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 animate-in fade-in duration-300">
                          <div className="space-y-2">
                            <label className="font-mono text-[10px] text-zinc-500 uppercase ml-1">
                              First Name
                            </label>
                            <Input
                              name="firstName"
                              value={formData.firstName}
                              onChange={handleInputChange}
                              placeholder="John"
                              className="bg-black/40 border-zinc-800 text-white"
                            />
                          </div>
                          <div className="space-y-2">
                            <label className="font-mono text-[10px] text-zinc-500 uppercase ml-1">
                              Middle Name
                            </label>
                            <Input
                              name="middleName"
                              value={formData.middleName}
                              onChange={handleInputChange}
                              placeholder="Quincy"
                              className="bg-black/40 border-zinc-800 text-white"
                            />
                          </div>
                          <div className="space-y-2">
                            <label className="font-mono text-[10px] text-zinc-500 uppercase ml-1">
                              Last Name
                            </label>
                            <Input
                              name="lastName"
                              value={formData.lastName}
                              onChange={handleInputChange}
                              placeholder="Doe"
                              className="bg-black/40 border-zinc-800 text-white"
                            />
                          </div>
                        </div>
                      )}

                      {step === 2 && (
                        <div className="space-y-6 animate-in fade-in duration-300">
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div className="space-y-2">
                              <label className="font-mono text-[10px] text-zinc-500 uppercase ml-1">
                                Father&apos;s Full Name
                              </label>
                              <Input
                                name="fatherName"
                                value={formData.fatherName}
                                onChange={handleInputChange}
                                placeholder="Robert Doe"
                                className="bg-black/40 border-zinc-800 text-white"
                              />
                            </div>
                            <div className="space-y-2">
                              <label className="font-mono text-[10px] text-zinc-500 uppercase ml-1">
                                Mother&apos;s Full Name
                              </label>
                              <Input
                                name="motherName"
                                value={formData.motherName}
                                onChange={handleInputChange}
                                placeholder="Mary Doe"
                                className="bg-black/40 border-zinc-800 text-white"
                              />
                            </div>
                          </div>
                          <div className="space-y-2">
                            <label className="font-mono text-[10px] text-zinc-500 uppercase ml-1">
                              Residential Address
                            </label>
                            <Input
                              name="address"
                              value={formData.address}
                              onChange={handleInputChange}
                              placeholder="123 Nexus Blvd, Silicon Valley, CA"
                              className="bg-black/40 border-zinc-800 text-white"
                            />
                          </div>
                        </div>
                      )}

                      {step === 3 && (
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 animate-in fade-in duration-300">
                          <div className="space-y-3">
                            <label className="font-mono text-[10px] text-zinc-500 uppercase ml-1">
                              Document Front Side
                            </label>
                            <div
                              className={cn(
                                "relative h-40 rounded-xl border-2 border-dashed flex flex-col items-center justify-center transition-all cursor-pointer",
                                files.front
                                  ? "border-purple-500/50 bg-purple-500/5"
                                  : "border-zinc-800 hover:border-zinc-700 bg-black/20",
                              )}
                              onClick={() =>
                                document.getElementById("front-upload")?.click()
                              }
                            >
                              {files.front ? (
                                <>
                                  <FileCheck className="h-8 w-8 text-purple-400 mb-2" />
                                  <p className="text-[10px] font-mono text-white truncate max-w-[80%]">
                                    {files.front.name}
                                  </p>
                                </>
                              ) : (
                                <>
                                  <Upload className="h-6 w-6 text-zinc-600 mb-2" />
                                  <p className="text-[10px] font-mono text-zinc-500 uppercase tracking-tighter">
                                    Click to upload Front
                                  </p>
                                </>
                              )}
                              <input
                                id="front-upload"
                                type="file"
                                className="hidden"
                                onChange={(e) => handleFileChange(e, "front")}
                                accept="image/*"
                              />
                            </div>
                          </div>

                          <div className="space-y-3">
                            <label className="font-mono text-[10px] text-zinc-500 uppercase ml-1">
                              Document Back Side
                            </label>
                            <div
                              className={cn(
                                "relative h-40 rounded-xl border-2 border-dashed flex flex-col items-center justify-center transition-all cursor-pointer",
                                files.back
                                  ? "border-blue-500/50 bg-blue-500/5"
                                  : "border-zinc-800 hover:border-zinc-700 bg-black/20",
                              )}
                              onClick={() =>
                                document.getElementById("back-upload")?.click()
                              }
                            >
                              {files.back ? (
                                <>
                                  <FileCheck className="h-8 w-8 text-blue-400 mb-2" />
                                  <p className="text-[10px] font-mono text-white truncate max-w-[80%]">
                                    {files.back.name}
                                  </p>
                                </>
                              ) : (
                                <>
                                  <Upload className="h-6 w-6 text-zinc-600 mb-2" />
                                  <p className="text-[10px] font-mono text-zinc-500 uppercase tracking-tighter">
                                    Click to upload Back
                                  </p>
                                </>
                              )}
                              <input
                                id="back-upload"
                                type="file"
                                className="hidden"
                                onChange={(e) => handleFileChange(e, "back")}
                                accept="image/*"
                              />
                            </div>
                          </div>
                        </div>
                      )}

                      {kycErrorMessage && (
                        <div className="p-3 rounded-lg bg-red-500/10 border border-red-500/20 flex items-center gap-3">
                          <AlertCircle className="h-4 w-4 text-red-400 shrink-0" />
                          <p className="text-[11px] font-mono text-red-400">
                            {kycErrorMessage}
                          </p>
                        </div>
                      )}

                      <div className="flex items-center justify-between pt-4 border-t border-zinc-800/50">
                        <Button
                          variant="ghost"
                          disabled={(step === 0 || step === 1) || isSubmittingKyc}
                          onClick={() => setStep(step - 1)}
                          className="text-zinc-500 hover:text-white"
                        >
                          Previous
                        </Button>

                        {step < 3 ? (
                          <Button
                            onClick={() => setStep(step + 1)}
                            className="bg-purple-600 hover:bg-purple-700 text-white px-8 font-mono text-[10px] uppercase tracking-widest"
                          >
                            {step === 0 ? "Start Verification" : "Next"} <ArrowRight className="h-3.5 w-3.5 ml-2" />
                          </Button>
                        ) : (
                          <Button
                            onClick={handleKycSubmit}
                            disabled={
                              !files.front || !files.back || isSubmittingKyc
                            }
                            className="bg-green-600 hover:bg-green-700 text-white px-8"
                          >
                            {isSubmittingKyc
                              ? "Submitting..."
                              : "Submit for Review"}
                            {!isSubmittingKyc && (
                              <CheckCircle2 className="h-3.5 w-3.5 ml-2" />
                            )}
                          </Button>
                        )}
                      </div>
                    </CardContent>
                  </Card>

                  <div className="rounded-xl border border-zinc-800/50 bg-zinc-900/30 p-5 mt-4">
                    <h4 className="font-mono text-xs font-bold text-white mb-2 flex items-center gap-2">
                      <AlertCircle className="h-3 w-3 text-zinc-400" />
                      Privacy & Data Security
                    </h4>
                    <p className="font-mono text-[10px] text-zinc-600 leading-relaxed">
                      NEXUS handles your sensitive data with extreme care.
                      Document images are stored on an encrypted local storage
                      volume and are only accessible by high-level
                      administrators for manual verification.
                    </p>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
      {/* Action Modal (Delete / Verify Success / DNS Guide) */}
      {actionModal.isOpen && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="w-full max-w-md bg-zinc-950 border border-zinc-800 rounded-xl shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200">
            {actionModal.type === "dns_guide" ? (
              <>
                <div className="p-4 border-b border-zinc-800/50 bg-zinc-900/30 flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="h-6 w-6 rounded bg-blue-500/10 flex items-center justify-center border border-blue-500/20">
                      <Globe className="h-3.5 w-3.5 text-blue-400" />
                    </div>
                    <h3 className="font-mono text-xs font-bold text-white uppercase tracking-wider">
                      DNS Verification Guide
                    </h3>
                  </div>
                  <button
                    onClick={() => setActionModal({ ...actionModal, isOpen: false })}
                    className="p-1 rounded-md text-zinc-500 hover:text-white transition-colors"
                  >
                    <X className="h-4 w-4" />
                  </button>
                </div>
                <div className="p-6 space-y-4">
                  <div className="space-y-4">
                    {[
                      { step: "01", text: "Login to your domain registrar (GoDaddy, Namecheap, etc.)" },
                      { step: "02", text: "Navigate to the DNS Management or Advanced DNS settings" },
                      { step: "03", text: "Click 'Add New Record' and select type TXT" },
                      { step: "04", text: "Set 'Host' or 'Name' field to @ (or leave blank)" },
                      { step: "05", text: "Copy the verification token from the portfolio list" },
                      { step: "06", text: "Paste the token into the 'Value' field and save changes" },
                      { step: "07", text: "Wait 2-5 minutes and click 'Verify DNS' in NEXUS" }
                    ].map((s) => (
                      <div key={s.step} className="flex gap-4">
                        <span className="font-mono text-[10px] font-bold text-blue-500/50 shrink-0 mt-0.5">
                          {s.step}
                        </span>
                        <p className="font-mono text-[11px] text-zinc-400 leading-relaxed">
                          {s.text}
                        </p>
                      </div>
                    ))}
                  </div>

                  <div className="pt-4 border-t border-zinc-800/50">
                    <Button
                      onClick={() => setActionModal({ ...actionModal, isOpen: false })}
                      className="w-full bg-zinc-900 hover:bg-zinc-800 text-white font-mono text-[10px] uppercase h-9"
                    >
                      Understood, Proceed
                    </Button>
                  </div>
                </div>
              </>
            ) : actionModal.type === "delete" ? (
              <div className="p-8 text-center">
                <div className="h-16 w-16 bg-red-500/10 border border-red-500/20 rounded-full flex items-center justify-center mx-auto mb-6">
                  <Trash2 className="h-8 w-8 text-red-500" />
                </div>
                <h3 className="text-xl font-bold text-white mb-2 uppercase tracking-tight font-mono">
                  Remove Domain?
                </h3>
                <p className="text-zinc-400 text-xs font-mono mb-8 uppercase tracking-wider leading-relaxed">
                  {actionModal.domain?.verification_status === "verified" ? (
                    <span className="text-amber-500 font-bold">
                      Warning: This is a verified asset. Removing it will delete
                      all historical intelligence data.
                    </span>
                  ) : (
                    `Are you sure you want to remove ${actionModal.domain?.domain} from your portfolio?`
                  )}
                </p>
                <div className="flex gap-3">
                  <Button
                    variant="outline"
                    className="flex-1 border-zinc-800 text-zinc-400 hover:text-white font-mono text-[10px] uppercase tracking-widest h-10"
                    onClick={() =>
                      setActionModal({ ...actionModal, isOpen: false })
                    }
                  >
                    No, Keep it
                  </Button>
                  <Button
                    className="flex-1 bg-red-600 hover:bg-red-700 text-white font-mono text-[10px] uppercase tracking-widest h-10"
                    onClick={confirmDelete}
                  >
                    Yes, Remove
                  </Button>
                </div>
              </div>
            ) : (
              <div className="p-8 text-center">
                <div className="h-16 w-16 bg-green-500/10 border border-green-500/20 rounded-full flex items-center justify-center mx-auto mb-6">
                  <CheckCircle2 className="h-8 w-8 text-green-500" />
                </div>
                <h3 className="text-xl font-bold text-white mb-2 uppercase tracking-tight font-mono">
                  Asset Verified
                </h3>
                <p className="text-zinc-400 text-xs font-mono mb-8 uppercase tracking-wider leading-relaxed">
                  Success! <span className="text-white">{actionModal.domain?.domain}</span> has
                  been cryptographically verified. It is now visible to the
                  NEXUS institutional engine.
                </p>
                <Button
                  className="w-full bg-zinc-800 text-white hover:bg-zinc-700 font-mono text-[10px] uppercase tracking-widest h-10"
                  onClick={() =>
                    setActionModal({ ...actionModal, isOpen: false })
                  }
                >
                  Continue to Dashboard
                </Button>
              </div>
            )}
          </div>
        </div>
      )}
    </>
  );
}
