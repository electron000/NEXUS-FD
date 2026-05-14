/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";
import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";

import { TrendingUp, TrendingDown, ArrowUpRight, ExternalLink, Info, Globe, X, ShieldCheck, CheckCircle2, ArrowRight, FileCheck, Upload, AlertCircle, Clock } from "lucide-react";
import type { PortfolioDomain } from "@/types";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useAppStore } from "@/store/useAppStore";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import { submitKYC } from "@/services";

interface PortfolioTableProps {
  data: PortfolioDomain[];
}

export function PortfolioTable({ data }: PortfolioTableProps) {
  const [isGuideOpen, setIsGuideOpen] = useState(false);
  const [isKycModalOpen, setIsKycModalOpen] = useState(false);
  const [step, setStep] = useState(0);
  const [isSubmittingKyc, setIsSubmittingKyc] = useState(false);
  const [kycStatus, setKycStatus] = useState<"idle" | "success" | "error">("idle");
  const [kycErrorMessage, setKycErrorMessage] = useState("");
  const { userProfile, updateProfile } = useAppStore();

  const [formData, setFormData] = useState({
    firstName: "",
    middleName: "",
    lastName: "",
    fatherName: "",
    motherName: "",
    address: "",
  });

  const [files, setFiles] = useState<{
    front: File | null;
    back: File | null;
  }>({
    front: null,
    back: null,
  });

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

  const resetKycModal = () => {
    setIsKycModalOpen(false);
    setTimeout(() => {
      setStep(0);
      setKycStatus("idle");
    }, 300);
  };

  if (!data || data.length === 0) {
    return (
      <Card className="border-zinc-800/50 bg-zinc-950/50 backdrop-blur-sm">
        <CardContent className="py-12 text-center text-zinc-500 font-mono text-sm uppercase tracking-widest">
          No verified assets found in portfolio
        </CardContent>
      </Card>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.4, duration: 0.5 }}
      className="space-y-4"
    >
      <div className="flex items-center justify-between px-2">
        <h2 className="font-mono text-xs font-bold text-zinc-500 uppercase tracking-[0.2em]">
          Verified Assets & Valuations
        </h2>
        <div className="flex items-center gap-3">
          {userProfile?.kyc_status !== "verified" &&
            userProfile?.kyc_status !== "pending" && (
              <button
                onClick={() => {
                  setStep(0);
                  setIsKycModalOpen(true);
                }}
                className="flex items-center gap-2 px-3 py-1.5 rounded-lg border border-amber-500/30 bg-amber-500/5 hover:bg-amber-500/10 hover:border-amber-500/50 transition-all group"
              >
                <ShieldCheck className="h-3 w-3 text-amber-500" />
                <span className="font-mono text-[10px] font-bold text-amber-500/80 uppercase tracking-[0.2em] group-hover:text-amber-400">
                  {userProfile?.kyc_status === "rejected"
                    ? "Re-verify Identity"
                    : "Become a Verified Seller"}
                </span>
              </button>
            )}

          <button
            onClick={() => setIsGuideOpen(true)}
            className="flex items-center gap-1.5 font-mono text-[10px] font-bold text-zinc-500 hover:text-blue-400 uppercase tracking-widest transition-colors group"
          >
            <Info className="h-3 w-3 text-zinc-600 group-hover:text-blue-400 transition-colors" />
            DNS Verification Guide
          </button>
          <span className="font-mono text-[10px] text-zinc-600 uppercase">
            Live Market Estimations
          </span>
        </div>
      </div>

      {userProfile?.kyc_status === "rejected" && (
        <div className="mx-2 p-3 rounded-lg border border-red-500/20 bg-red-500/5 flex items-start gap-3 animate-in slide-in-from-top-2">
          <AlertCircle className="h-4 w-4 text-red-500 shrink-0 mt-0.5" />
          <div className="space-y-1">
            <h4 className="font-mono text-[10px] font-bold text-red-400 uppercase tracking-tight">
              Verification Rejected
            </h4>
            <p className="font-mono text-[9px] text-red-300/70 leading-relaxed">
              {userProfile.kyc_rejection_reason ||
                "Your verification request was declined. Please review your documents and try again."}
            </p>
          </div>
        </div>
      )}

      {userProfile?.kyc_status === "pending" && (
        <div className="mx-2 p-3 rounded-lg border border-blue-500/20 bg-blue-500/5 flex items-start gap-3 animate-in slide-in-from-top-2">
          <Clock className="h-4 w-4 text-blue-500 shrink-0 mt-0.5" />
          <div className="space-y-1">
            <h4 className="font-mono text-[10px] font-bold text-blue-400 uppercase tracking-tight">
              Identity Audit in Progress
            </h4>
            <p className="font-mono text-[9px] text-blue-300/70 leading-relaxed">
              Your verification documents are currently being processed by the
              NEXUS security team.
            </p>
          </div>
        </div>
      )}

      <Card className="overflow-hidden border-zinc-800/50 bg-zinc-950/50 backdrop-blur-md shadow-2xl">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-zinc-800/50 bg-zinc-900/30">
                <th className="p-4 font-mono text-[10px] uppercase tracking-wider text-zinc-500">
                  Domain Asset
                </th>
                <th className="p-4 font-mono text-[10px] uppercase tracking-wider text-zinc-500 text-right">
                  Bought Price
                </th>
                <th className="p-4 font-mono text-[10px] uppercase tracking-wider text-zinc-500 text-right">
                  Nexus Valuation
                </th>
                <th className="p-4 font-mono text-[10px] uppercase tracking-wider text-zinc-500 text-right">
                  Total Growth
                </th>
                <th className="p-4 font-mono text-[10px] uppercase tracking-wider text-zinc-500 text-center">
                  Status
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-800/30">
              {data.map((item, idx) => (
                <motion.tr
                  key={item.domain}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.5 + idx * 0.05 }}
                  className="group hover:bg-white/2 transition-colors cursor-default"
                >
                  <td className="p-4">
                    <div className="flex items-center gap-3">
                      <div className="h-8 w-8 rounded-lg bg-zinc-900 flex items-center justify-center border border-zinc-800 group-hover:border-blue-500/50 transition-colors">
                        <span className="text-[10px] font-bold text-zinc-400 uppercase">
                          {item.domain.charAt(0)}
                        </span>
                      </div>
                      <div>
                        <div className="font-mono text-sm font-bold text-white tracking-tight flex items-center gap-2">
                          {item.domain}
                          <ArrowUpRight className="h-3 w-3 text-zinc-700 opacity-0 group-hover:opacity-100 transition-opacity" />
                        </div>
                        <div className="text-[9px] text-zinc-600 font-mono uppercase tracking-tighter">
                          Verified Ownership
                        </div>
                      </div>
                    </div>
                  </td>
                  <td className="p-4 text-right">
                    <div className="font-mono text-sm text-zinc-400">
                      ₹{item.boughtPrice.toLocaleString("en-IN")}
                    </div>
                  </td>
                  <td className="p-4 text-right">
                    <div className="font-mono text-sm font-bold text-white">
                      ₹{item.valuation.toLocaleString("en-IN")}
                    </div>
                    <div className="text-[9px] text-zinc-600 font-mono uppercase tracking-tighter">
                      Model Prediction
                    </div>
                  </td>
                  <td className="p-4 text-right">
                    <div
                      className={`flex items-center justify-end gap-1 font-mono text-sm font-bold ${item.growth >= 0 ? "text-emerald-400" : "text-red-400"}`}
                    >
                      {item.growth >= 0 ? (
                        <TrendingUp className="h-3 w-3" />
                      ) : (
                        <TrendingDown className="h-3 w-3" />
                      )}
                      {item.growth >= 0 ? "+" : ""}
                      {item.growth.toFixed(2)}%
                    </div>
                  </td>
                  <td className="p-4 text-center">
                    <div className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-emerald-500/10 border border-emerald-500/20">
                      <div className="h-1 w-1 rounded-full bg-emerald-500 animate-pulse" />
                      <span className="text-[9px] font-mono font-bold text-emerald-500 uppercase tracking-widest">
                        Active
                      </span>
                    </div>
                  </td>
                </motion.tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>

      <div className="flex items-center gap-4 px-2 text-[9px] font-mono text-zinc-600 uppercase tracking-widest">
        <span className="flex items-center gap-1">
          <div className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
          Growth Positive
        </span>
        <span className="flex items-center gap-1">
          <div className="h-1.5 w-1.5 rounded-full bg-red-500" />
          Growth Negative
        </span>
        <span className="ml-auto flex items-center gap-1">
          <ExternalLink className="h-2.5 w-2.5" />
          Terminal Data Updated 30s ago
        </span>
      </div>

      {/* DNS Guide Modal */}
      <AnimatePresence>
        {isGuideOpen && (
          <div className="fixed inset-0 z-100 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="w-full max-w-md bg-zinc-950 border border-zinc-800 rounded-xl shadow-2xl overflow-hidden"
            >
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
                  onClick={() => setIsGuideOpen(false)}
                  className="p-1 rounded-md text-zinc-500 hover:text-white transition-colors"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>
              <div className="p-6 space-y-4">
                <div className="space-y-4">
                  {[
                    {
                      step: "01",
                      text: "Login to your domain registrar (GoDaddy, Namecheap, etc.)",
                    },
                    {
                      step: "02",
                      text: "Navigate to the DNS Management or Advanced DNS settings",
                    },
                    {
                      step: "03",
                      text: "Click 'Add New Record' and select type TXT",
                    },
                    {
                      step: "04",
                      text: "Set 'Host' or 'Name' field to @ (or leave blank)",
                    },
                    {
                      step: "05",
                      text: "Copy the verification token from the portfolio list",
                    },
                    {
                      step: "06",
                      text: "Paste the token into the 'Value' field and save changes",
                    },
                    {
                      step: "07",
                      text: "Wait 2-5 minutes and click 'Verify DNS' in NEXUS",
                    },
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
                    onClick={() => setIsGuideOpen(false)}
                    className="w-full bg-zinc-900 hover:bg-zinc-800 text-white font-mono text-[10px] uppercase h-9"
                  >
                    Understood, Proceed
                  </Button>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
      {/* KYC Modal */}
      <AnimatePresence>
        {isKycModalOpen && (
          <div className="fixed inset-0 z-100 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="w-full max-w-2xl"
            >
              {kycStatus === "success" ? (
                <Card className="border-emerald-500/30 bg-zinc-950 shadow-2xl">
                  <CardContent className="py-12 flex flex-col items-center text-center space-y-6">
                    <div className="h-20 w-20 rounded-full bg-emerald-500/10 flex items-center justify-center border border-emerald-500/20">
                      <CheckCircle2 className="h-10 w-10 text-emerald-500" />
                    </div>
                    <div className="space-y-2">
                      <h3 className="font-mono text-xl font-bold text-white uppercase tracking-tight">
                        Verification Submitted
                      </h3>
                      <p className="font-mono text-xs text-zinc-500 max-w-xs mx-auto">
                        Your identity documents have been received and are under
                        review. This process usually takes 24-48 hours.
                      </p>
                    </div>
                    <Button
                      onClick={resetKycModal}
                      className="bg-emerald-600 hover:bg-emerald-700 text-white px-10 font-mono text-xs uppercase"
                    >
                      Return to Dashboard
                    </Button>
                  </CardContent>
                </Card>
              ) : (
                <Card className="border-zinc-800 bg-zinc-950 shadow-2xl overflow-hidden">
                  <CardHeader className="border-b border-zinc-800/50 bg-zinc-900/20">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <div className="h-8 w-8 rounded-lg bg-purple-500/10 flex items-center justify-center border border-purple-500/20">
                          <ShieldCheck className="h-4 w-4 text-purple-400" />
                        </div>
                        <div>
                          <CardTitle className="font-mono text-sm font-bold text-white uppercase tracking-tight">
                            {step === 0
                              ? "Verified Nexus Seller"
                              : "Identity Verification"}
                          </CardTitle>
                          {step > 0 && (
                            <p className="text-[9px] font-mono text-zinc-600 uppercase tracking-widest mt-0.5">
                              Step {step} of 3 • Secure Nexus Portal
                            </p>
                          )}
                        </div>
                      </div>
                      <button
                        onClick={resetKycModal}
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
                            Your current status is{" "}
                            <span className="font-bold uppercase text-amber-400">
                              {userProfile?.kyc_status || "unverified"}
                            </span>
                            . To unlock the full potential of the NEXUS
                            Marketplace, you must become a Verified Seller.
                          </p>
                        </div>

                        <div className="space-y-4">
                          <h4 className="font-mono text-[10px] font-bold text-zinc-500 uppercase tracking-[0.2em]">
                            Benefits of Verification
                          </h4>
                          <div className="grid gap-3">
                            {[
                              {
                                title: "Nexus Marketplace Access",
                                desc: "List your domains for sale to thousands of global buyers.",
                              },
                              {
                                title: "Verified Trust Badge",
                                desc: "Gain institutional trust with a purple verification seal.",
                              },
                              {
                                title: "Instant Liquidity",
                                desc: "Accept direct offers and negotiate in our secure exchange.",
                              },
                              {
                                title: "Priority Support",
                                desc: "Direct access to our asset management and escrow team.",
                              },
                            ].map((benefit, i) => (
                              <div key={i} className="flex gap-3">
                                <div className="h-5 w-5 shrink-0 rounded bg-blue-500/10 flex items-center justify-center border border-blue-500/20 mt-0.5">
                                  <CheckCircle2 className="h-3 w-3 text-blue-400" />
                                </div>
                                <div>
                                  <p className="font-mono text-[11px] font-bold text-white">
                                    {benefit.title}
                                  </p>
                                  <p className="font-mono text-[10px] text-zinc-500">
                                    {benefit.desc}
                                  </p>
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
                            placeholder="Arun"
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
                            placeholder="Changkakoty"
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
                              placeholder="Tapan"
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
                              placeholder="Purabi"
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
                            Aadhaar Front Side
                          </label>
                          <div
                            className={cn(
                              "relative h-40 rounded-xl border-2 border-dashed flex flex-col items-center justify-center transition-all cursor-pointer",
                              files.front
                                ? "border-purple-500/50 bg-purple-500/5"
                                : "border-zinc-800 hover:border-zinc-700 bg-black/20",
                            )}
                            onClick={() =>
                              document
                                .getElementById("front-upload-table")
                                ?.click()
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
                              id="front-upload-table"
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
                              document
                                .getElementById("back-upload-table")
                                ?.click()
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
                              id="back-upload-table"
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
                        disabled={step === 0 || step === 1 || isSubmittingKyc}
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
                          {step === 0 ? "Start Verification" : "Next"}{" "}
                          <ArrowRight className="h-3.5 w-3.5 ml-2" />
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
              )}
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}
