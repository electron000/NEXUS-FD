// app/(dashboard)/messages/NexusChat.tsx
"use client";

import React, { useState, useEffect, useRef, useCallback } from "react";
import { Send, ArrowLeft, ShieldCheck, CheckCheck } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { apiClient } from "@/services/config";
import { useAppStore } from "@/store/useAppStore";
import { getSocket } from "@/lib/socket";
import { cn } from "@/lib/utils";

interface InquiryDetails {
  id: string;
  domain?: string;
  sender_id?: string | number;
  receiver_email?: string;
  sender_email?: string;
  offer_price?: number | null;
  status?: string;
}

export interface Message {
  id: string | number;
  content: string;
  sender_id: string | number;
  created_at: string;
}

interface NexusChatProps {
  inquiry: InquiryDetails;
  onBack: () => void;
}

export function NexusChat({ inquiry, onBack }: NexusChatProps) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const { userProfile } = useAppStore();
  const scrollRef = useRef<HTMLDivElement>(null);
  const socket = getSocket();

  const fetchMessages = useCallback(async () => {
    try {
      const res = await apiClient.get(`/api/inquiries/${inquiry.id}/messages`);
      const data = (res as { data?: Message[] }).data || res;
      if (Array.isArray(data)) {
        const uniqueMap = new Map(data.map((m) => [String(m.id), m]));
        setMessages(Array.from(uniqueMap.values()) as Message[]);
      }
    } catch {
      console.error("Failed to fetch messages");
    } finally {
      setIsLoading(false);
    }
  }, [inquiry.id]);

  useEffect(() => {
    // 2. Wrap the fetch call in an async function to satisfy the linter
    const initializeChat = async () => {
      await fetchMessages();
    };
    initializeChat();

    const joinRoom = () => {
      console.log("Joining inquiry room:", inquiry.id);
      socket.emit("join_inquiry", inquiry.id);
    };

    if (socket.connected) {
      joinRoom();
    }

    socket.on("connect", joinRoom);

    const handleNewMessage = (msg: Message) => {
      console.log("New message received via socket:", msg);
      setMessages((prev) => {
        const messageMap = new Map(prev.map((m) => [String(m.id), m]));
        messageMap.set(String(msg.id), msg);
        return Array.from(messageMap.values());
      });
    };

    socket.on("new_message", handleNewMessage);
    return () => {
      socket.off("connect", joinRoom);
      socket.off("new_message", handleNewMessage);
    };
  }, [inquiry.id, fetchMessages, socket]);

  // WhatsApp-style Auto-scroll: Scroll to bottom when messages change or component loads
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTo({
        top: scrollRef.current.scrollHeight,
        behavior: "smooth",
      });
    }
  }, [messages, isLoading]);

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMessage.trim()) return;
    const content = newMessage;
    setNewMessage("");

    try {
      const res: { data?: Message } = (await apiClient.post(
        `/api/inquiries/${inquiry.id}/messages`,
        { content },
      )) as { data?: Message };
      const msg = res.data?.id ? res.data : res;
      setMessages((prev) => {
        const messageMap = new Map(prev.map((m) => [String(m.id), m]));
        if (msg && (msg as Message).id)
          messageMap.set(String((msg as Message).id), msg as Message);
        return Array.from(messageMap.values());
      });
    } catch {
      console.error("Failed to send message");
    }
  };

  const isMe = (senderId: string | number | undefined) => {
    if (!senderId || !userProfile?.id) return false;
    return String(senderId) === String(userProfile.id);
  };

  return (
    // Changed: Removed hardcoded heights and borders. Now flex-1 to fill the parent split pane.
    <div className="flex flex-col h-full w-full bg-zinc-950 animate-in fade-in duration-300">
      {/* Chat Header */}
      <div className="px-4 md:px-6 py-4 bg-zinc-900/50 border-b border-zinc-800 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3 md:gap-4 w-full sm:w-auto">
          {/* UPDATED: Removed 'md:hidden' so it shows on Desktop */}
          <Button
            variant="ghost"
            size="icon"
            onClick={onBack}
            className="h-8 w-8 text-zinc-500 hover:text-white hover:bg-zinc-800 shrink-0"
          >
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <div className="flex items-center gap-2 md:gap-3 min-w-0">
            <div className="h-8 w-8 md:h-10 md:w-10 rounded-full bg-blue-500/10 flex items-center justify-center border border-blue-500/20 shrink-0">
              <ShieldCheck className="h-4 w-4 md:h-5 md:w-5 text-blue-400" />
            </div>
            <div className="min-w-0">
              <h3 className="font-mono text-xs md:text-sm font-bold text-white uppercase tracking-tight truncate">
                {inquiry.domain}
              </h3>
              <p className="font-mono text-[9px] md:text-[10px] text-zinc-500 truncate">
                With{" "}
                {isMe(inquiry.sender_id)
                  ? inquiry.receiver_email
                  : inquiry.sender_email}
              </p>
            </div>
          </div>
        </div>
        <div className="flex items-center justify-between sm:justify-end gap-4 w-full sm:w-auto border-t sm:border-t-0 border-zinc-800 pt-3 sm:pt-0">
          <div className="text-left sm:text-right">
            <p className="font-mono text-[8px] md:text-[9px] text-zinc-600 uppercase tracking-widest">
              Market Offer
            </p>
            <p className="font-mono text-xs md:text-sm font-bold text-green-400 tracking-tighter">
              {inquiry.offer_price
                ? `$${inquiry.offer_price.toLocaleString()}`
                : "No Offer"}
            </p>
          </div>
          {/* Enhanced Badge: Only show if status exists and is meaningful */}
          {inquiry.status && (
            <Badge
              variant={inquiry.status === "open" ? "accent" : "outline"}
              className="font-mono text-[8px] md:text-[9px] uppercase px-2"
            >
              {inquiry.status}
            </Badge>
          )}
        </div>
      </div>

      {/* Message Area */}
      <div className="flex-1 overflow-y-auto p-6" ref={scrollRef}>
        <div className="space-y-6">
          {isLoading ? (
            <div className="flex items-center justify-center h-full">
              <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-500" />
            </div>
          ) : (
            messages.map((msg, idx) => {
              const mine = isMe(msg.sender_id);
              return (
                <div
                  key={msg.id || idx}
                  className={cn(
                    "flex flex-col max-w-[80%]",
                    mine ? "ml-auto items-end" : "mr-auto items-start",
                  )}
                >
                  <div
                    className={cn(
                      "px-4 py-3 rounded-2xl text-xs font-mono leading-relaxed",
                      mine
                        ? "bg-blue-600 text-white rounded-tr-none"
                        : "bg-zinc-800 text-zinc-200 rounded-tl-none border border-zinc-700",
                    )}
                  >
                    {msg.content}
                  </div>
                  <div className="mt-1.5 flex items-center gap-2">
                    <span className="text-[9px] font-mono text-zinc-600">
                      {new Date(msg.created_at).toLocaleTimeString([], {
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                    </span>
                    {mine && <CheckCheck className="h-3 w-3 text-blue-500" />}
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>

      {/* Input Area */}
      <div className="p-4 bg-zinc-900/30 border-t border-zinc-800">
        <form onSubmit={handleSendMessage} className="flex gap-2">
          <Input
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            // REPLACED: "Type a message to negotiate..." with a cleaner version
            placeholder="Write a message..."
            className="flex-1 bg-zinc-950 border-zinc-800 font-mono text-xs focus-visible:ring-blue-500/50"
          />
          <Button
            type="submit"
            disabled={!newMessage.trim()}
            className="bg-blue-600 hover:bg-blue-700 text-white shadow-lg shadow-blue-900/20 px-4 h-9"
          >
            <Send className="h-4 w-4" />
          </Button>
        </form>
      </div>
    </div>
  );
}