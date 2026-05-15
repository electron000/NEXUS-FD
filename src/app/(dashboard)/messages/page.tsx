/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import React, { useState, useEffect, useCallback } from "react";
import { Inbox, MessageSquare, ShieldCheck, ChevronRight } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { apiClient } from "@/services/config";
import { useAppStore } from "@/store/useAppStore";
import { getSocket } from "@/lib/socket";
import { NexusChat } from "./NexusChat";

// Matches the interface expected by NexusChat
interface InquiryDetails {
  id: string;
  domain?: string;
  sender_id?: string | number;
  receiver_email?: string;
  sender_email?: string;
  offer_price?: number | null;
  status?: string;
  created_at?: string;
  unread_count?: number;
}

export default function MessagesPage() {
  const [inquiries, setInquiries] = useState<InquiryDetails[]>([]);
  const [selectedInquiry, setSelectedInquiry] = useState<InquiryDetails | null>(
    null,
  );
  const [isLoading, setIsLoading] = useState(true);
  const { userProfile } = useAppStore();

  const fetchInquiriesList = useCallback(async () => {
    try {
      const res = await apiClient.get("/api/inquiries");
      const data = (res as any)?.data || res;
      if (Array.isArray(data)) {
        setInquiries(data);
      }
    } catch (error) {
      console.error("Failed to fetch inbox:", error);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchInquiriesList();
    
    const socket = getSocket();
    socket.on("new_message", fetchInquiriesList);
    socket.on("new_inquiry", fetchInquiriesList);
    
    return () => {
      socket.off("new_message", fetchInquiriesList);
      socket.off("new_inquiry", fetchInquiriesList);
    };
  }, [fetchInquiriesList]);

  // If an inquiry is selected, render the chat component instead of the list
  if (selectedInquiry) {
    return (
      <div className="h-[calc(100vh-10rem)] md:h-[calc(100vh-6rem)] rounded-xl border border-zinc-800 overflow-hidden">
        <NexusChat
          inquiry={selectedInquiry}
          onBack={() => setSelectedInquiry(null)}
        />
      </div>
    );
  }

  // Otherwise, render the Inbox List
  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-mono text-lg font-bold text-white tracking-tight flex items-center gap-2">
          <MessageSquare className="h-5 w-5 text-blue-400" />
          Communications Hub
        </h1>
        <p className="mt-1 font-mono text-xs text-zinc-600">
          Manage active negotiations and secure client messaging.
        </p>
      </div>

      <div className="grid grid-cols-1 gap-3">
        {isLoading ? (
          <div className="flex items-center justify-center py-20">
            <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-500" />
          </div>
        ) : inquiries.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 px-4 rounded-2xl border border-dashed border-zinc-800 bg-zinc-900/20">
            <div className="relative h-16 w-16 mb-4 flex items-center justify-center rounded-2xl border border-zinc-800 bg-zinc-900">
              <Inbox className="h-8 w-8 text-zinc-700" />
            </div>
            <p className="font-mono text-xs text-zinc-500">
              No active inquiries found.
            </p>
          </div>
        ) : (
          inquiries.map((inquiry) => (
            <Card
              key={inquiry.id}
              className="border-zinc-800/50 bg-zinc-900/30 hover:bg-zinc-800/50 transition-colors cursor-pointer"
              onClick={() => setSelectedInquiry(inquiry)}
            >
              <CardContent className="p-4 flex items-center justify-between gap-4">
                <div className="flex items-center gap-4 min-w-0">
                  <div className="h-10 w-10 rounded-full bg-blue-500/10 flex items-center justify-center border border-blue-500/20 shrink-0">
                    <ShieldCheck className="h-5 w-5 text-blue-400" />
                  </div>
                  <div className="min-w-0">
                    <div className="flex items-center gap-2">
                      <h3 className="font-mono text-sm font-bold text-white truncate">
                        {inquiry.domain || "Unknown Domain"}
                      </h3>
                      {Number(inquiry.unread_count) > 0 && (
                        <span className="flex h-4 w-4 shrink-0 items-center justify-center rounded-full bg-red-500 text-[9px] font-bold text-white shadow-lg animate-in zoom-in duration-300">
                          {inquiry.unread_count}
                        </span>
                      )}
                    </div>
                    <p className="font-mono text-[10px] text-zinc-500 truncate mt-0.5">
                      Counterparty:{" "}
                      {inquiry.sender_email === userProfile?.email
                        ? inquiry.receiver_email
                        : inquiry.sender_email}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-4 shrink-0">
                  <div className="hidden sm:block text-right">
                    <p className="font-mono text-[9px] text-zinc-600 uppercase">
                      Offer
                    </p>
                    <p className="font-mono text-xs font-bold text-green-400">
                      {inquiry.offer_price
                        ? `$${inquiry.offer_price.toLocaleString()}`
                        : "N/A"}
                    </p>
                  </div>
                  {/* Logic: Only show badge if status is NOT 'open' to reduce noise, 
      or keep it if you want consistent state visibility */}
                  {inquiry.status && (
                    <Badge
                      variant={inquiry.status === "open" ? "accent" : "outline"}
                      className="hidden sm:inline-flex uppercase text-[9px]"
                    >
                      {inquiry.status}
                    </Badge>
                  )}
                  <ChevronRight className="h-4 w-4 text-zinc-600" />
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>
    </div>
  );
}
