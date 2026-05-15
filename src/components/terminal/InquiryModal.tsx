"use client";

import { useState } from "react";
import { X, Send, IndianRupee, MessageSquare } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { apiClient } from "@/services/config";
import { toast } from "sonner";

interface InquiryModalProps {
  domain: string;
  onClose: () => void;
}

export function InquiryModal({ domain, onClose }: InquiryModalProps) {
  const [message, setMessage] = useState("");
  const [offerPrice, setOfferPrice] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      // Credentials handled automatically via cookies
      await apiClient.post('/api/inquiries', {
        domain,
        message,
        offer_price: offerPrice ? parseFloat(offerPrice) : null
      });
      setIsSuccess(true);
      setTimeout(onClose, 2000);
    } catch (err) {
      console.error("Inquiry error:", err);
      toast.error("Failed to send inquiry. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/80 backdrop-blur-sm md:p-4">
      <Card className="w-full h-full md:h-auto md:max-w-lg border-zinc-800 bg-zinc-950 overflow-y-auto md:rounded-xl rounded-none">
        <CardHeader className="border-b border-zinc-800 sticky top-0 bg-zinc-950/80 backdrop-blur-md z-10 p-4 md:p-5">
          <CardTitle className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <MessageSquare className="h-4 w-4 text-purple-400" />
              <span className="truncate max-w-[200px] md:max-w-none">Contact Owner: {domain}</span>
            </div>
            <button
              onClick={onClose}
              className="p-2 -mr-2 text-zinc-500 hover:text-white transition-colors"
            >
              <X className="h-5 w-5" />
            </button>
          </CardTitle>
        </CardHeader>
        <CardContent className="p-4 md:p-6">
          {isSuccess ? (
            <div className="flex flex-col items-center justify-center py-20 text-center">
              <div className="h-16 w-16 rounded-full bg-green-500/10 flex items-center justify-center mb-6 border border-green-500/20">
                <Send className="h-8 w-8 text-green-500" />
              </div>
              <h3 className="font-mono text-xl font-bold text-white uppercase tracking-tight">
                Inquiry Sent!
              </h3>
              <p className="font-mono text-[11px] text-zinc-500 mt-3 max-w-xs uppercase tracking-widest leading-relaxed">
                The owner will be notified via their Nexus dashboard.
              </p>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-6">
              <div>
                <label className="block font-mono text-[10px] text-zinc-600 uppercase mb-2 ml-1 tracking-[0.1em]">
                  Your Message
                </label>
                <textarea
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  required
                  minLength={10}
                  placeholder="Describe your intent, ask about the price, or propose a deal..."
                  className="w-full min-h-[250px] md:min-h-32 bg-zinc-900 border border-zinc-800 rounded-lg p-4 font-mono text-sm text-white outline-none focus:border-purple-500/50 transition-all placeholder:text-zinc-700"
                />
              </div>
              <div>
                <label className="block font-mono text-[10px] text-zinc-600 uppercase mb-2 ml-1 tracking-[0.1em]">
                  *Offer Price (INR)
                </label>
                <div className="relative">
                  <IndianRupee className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-zinc-600" />
                  <input
                    type="number"
                    value={offerPrice}
                    onChange={(e) => setOfferPrice(e.target.value)}
                    placeholder="e.g. 5000"
                    className="w-full bg-zinc-900 border border-zinc-800 rounded-lg pl-10 pr-4 py-3 font-mono text-sm text-white outline-none focus:border-purple-500/50 transition-all"
                  />
                </div>
              </div>
              <div className="flex flex-col sm:flex-row gap-3 pt-4 sticky bottom-0 bg-zinc-950/80 backdrop-blur-sm pb-2">
                <Button
                  type="button"
                  variant="outline"
                  onClick={onClose}
                  className="w-full sm:flex-1 font-mono text-[10px] uppercase h-11 border-zinc-800"
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full sm:flex-1 bg-purple-600 hover:bg-purple-700 text-white font-mono text-[10px] uppercase h-11 tracking-widest"
                >
                  {isSubmitting ? "Sending..." : "Send Inquiry"}
                  <Send className="ml-2 h-3.5 w-3.5" />
                </Button>
              </div>
            </form>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
