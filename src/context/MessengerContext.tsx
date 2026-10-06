"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import { CHANNELS, type BotMessage, type ChannelId, type MessageKind } from "@/lib/types";

interface MessengerContextValue {
  messages: BotMessage[];
  activeChannel: ChannelId;
  setActiveChannel: (channel: ChannelId) => void;
  addMessage: (msg: Omit<BotMessage, "id" | "timestamp">) => void;
  isDrawerOpen: boolean;
  setDrawerOpen: (open: boolean) => void;
  loading: boolean;
  storageError: string | null;
  storageConfigured: boolean;
}

const MessengerContext = createContext<MessengerContextValue | null>(null);

export function MessengerProvider({ children }: { children: ReactNode }) {
  const [messages, setMessages] = useState<BotMessage[]>([]);
  const [activeChannel, setActiveChannel] = useState<ChannelId>("general");
  const [isDrawerOpen, setDrawerOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const [storageError, setStorageError] = useState<string | null>(null);
  const [storageConfigured, setStorageConfigured] = useState(true);

  useEffect(() => {
    let cancelled = false;

    fetch("/api/messages")
      .then((res) => res.json())
      .then((data: { configured: boolean; messages?: BotMessage[]; error?: string }) => {
        if (cancelled) return;
        if (data.error) throw new Error(data.error);
        setStorageConfigured(data.configured);
        setMessages(data.messages ?? []);
      })
      .catch((err) => {
        if (cancelled) return;
        setStorageError(err instanceof Error ? err.message : String(err));
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, []);

  const addMessage = useCallback((msg: Omit<BotMessage, "id" | "timestamp">) => {
    const optimisticId = `pending-${Date.now()}-${Math.random().toString(36).slice(2)}`;
    const optimistic: BotMessage = { ...msg, id: optimisticId, timestamp: Date.now() };
    setMessages((prev) => [...prev, optimistic]);

    fetch("/api/messages", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(msg),
    })
      .then((res) => res.json())
      .then((data: { message?: BotMessage; error?: string }) => {
        if (!data.message) throw new Error(data.error ?? "메시지 저장에 실패했습니다.");
        setMessages((prev) => prev.map((m) => (m.id === optimisticId ? data.message! : m)));
      })
      .catch((err) => {
        setStorageError(err instanceof Error ? err.message : String(err));
      });
  }, []);

  const value = useMemo(
    () => ({
      messages,
      activeChannel,
      setActiveChannel,
      addMessage,
      isDrawerOpen,
      setDrawerOpen,
      loading,
      storageError,
      storageConfigured,
    }),
    [messages, activeChannel, addMessage, isDrawerOpen, loading, storageError, storageConfigured]
  );

  return <MessengerContext.Provider value={value}>{children}</MessengerContext.Provider>;
}

export function useMessenger() {
  const ctx = useContext(MessengerContext);
  if (!ctx) throw new Error("useMessenger must be used within MessengerProvider");
  return ctx;
}

export function useChannelInfo(id: ChannelId) {
  return CHANNELS.find((c) => c.id === id)!;
}

export function kindColor(kind: MessageKind): string {
  switch (kind) {
    case "success":
      return "text-emerald-600 dark:text-emerald-400";
    case "error":
      return "text-red-600 dark:text-red-400";
    case "warning":
      return "text-amber-600 dark:text-amber-400";
    default:
      return "text-zinc-500 dark:text-zinc-400";
  }
}
