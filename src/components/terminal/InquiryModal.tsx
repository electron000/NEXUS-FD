"use client";

import { useState } from "react";
import { X, Send, IndianRupee, MessageSquare } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { apiClient } from "@/services/config";

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
      alert("Failed to send inquiry. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-100 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
      <Card className="w-full max-w-lg border-zinc-800 bg-zinc-950 overflow-hidden">
        <CardHeader className="border-b border-zinc-800 pb-4">
          <CardTitle className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <MessageSquare className="h-4 w-4 text-purple-400" />
              Contact Owner: {domain}
            </div>
            <button
              onClick={onClose}
              className="text-zinc-500 hover:text-white transition-colors"
            >
              <X className="h-4 w-4" />
            </button>
          </CardTitle>
        </CardHeader>
        <CardContent className="pt-6">
          {isSuccess ? (
            <div className="flex flex-col items-center justify-center py-10 text-center">
              <div className="h-12 w-12 rounded-full bg-green-500/10 flex items-center justify-center mb-4">
                <Send className="h-6 w-6 text-green-500" />
              </div>
              <h3 className="font-mono text-lg font-bold text-white">
                Inquiry Sent!
              </h3>
              <p className="font-mono text-xs text-zinc-500 mt-2">
                The owner will be notified via their Nexus dashboard.
              </p>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block font-mono text-[10px] text-zinc-600 uppercase mb-2">
                  Your Message
                </label>
                <textarea
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  required
                  minLength={10}
                  placeholder="Describe your intent, ask about the price, or propose a deal..."
                  className="w-full min-h-32 bg-zinc-900 border border-zinc-800 rounded-lg p-3 font-mono text-sm text-white outline-none focus:border-purple-500/50 transition-all"
                />
              </div>
              <div>
                <label className="block font-mono text-[10px] text-zinc-600 uppercase mb-2">
                  *Offer Price
                </label>
                <div className="relative">
                  <IndianRupee className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-zinc-600" />
                  <input
                    type="number"
                    value={offerPrice}
                    onChange={(e) => setOfferPrice(e.target.value)}
                    placeholder="e.g. 5000"
                    className="w-full bg-zinc-900 border border-zinc-800 rounded-lg pl-10 pr-4 py-2 font-mono text-sm text-white outline-none focus:border-purple-500/50 transition-all"
                  />
                </div>
              </div>
              <div className="flex gap-3 pt-2">
                <Button
                  type="button"
                  variant="outline"
                  onClick={onClose}
                  className="flex-1 font-mono text-xs"
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  disabled={isSubmitting}
                  className="flex-1 bg-purple-600 hover:bg-purple-700 text-white font-mono text-xs"
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
