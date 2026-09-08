"use client";

import { useState, useEffect, useCallback, useSyncExternalStore } from "react";
import { apiService } from "@/lib/api";
import { ReminderEvent, Reminder } from "@/types";

// ── Shared global store ──────────────────────────────────────
function extractData<T>(res: { success: boolean; data?: unknown }): T | null {
  if (!res.success) return null;
  const raw = res.data as any;
  if (raw && typeof raw === "object" && "data" in raw) return raw.data as T;
  return (raw ?? null) as T | null;
}

export interface TimerNotification {
  id: string;
  event: ReminderEvent;
  triggeredAt: number;
}

interface GlobalState {
  nextEvent: ReminderEvent | null;
  todayEvents: ReminderEvent[];
  pendingReminders: Reminder[];
  pendingCount: number;
  loading: boolean;
  urgent: boolean;
  timerNotifications: TimerNotification[];
}

let globalState: GlobalState = {
  nextEvent: null,
  todayEvents: [],
  pendingReminders: [],
  pendingCount: 0,
  loading: true,
  urgent: false,
  timerNotifications: [],
};

const listeners = new Set<() => void>();
let fetchPromise: Promise<void> | null = null;
let pollingTimer: ReturnType<typeof setInterval> | null = null;
let subscriberCount = 0;

function notify() {
  listeners.forEach((l) => l());
}

function setState(partial: Partial<GlobalState>) {
  globalState = { ...globalState, ...partial };
  notify();
}

async function fetchData() {
  const [nextRes, todayRes, pendingRes, countRes] = await Promise.all([
    apiService.get<ReminderEvent>("/rappels/next"),
    apiService.get<ReminderEvent[]>("/rappels/today"),
    apiService.get<Reminder[]>("/rappels/pending"),
    apiService.get<{ count: number }>("/rappels/pending/count"),
  ]);

  const ev = extractData<ReminderEvent>(nextRes);

  const today = extractData<ReminderEvent[]>(todayRes);
  if (Array.isArray(today)) {
    const now = Date.now();
    const upcoming = today.filter((e) => new Date(e.date).getTime() > now);
    setState({ todayEvents: upcoming });
  } else {
    setState({ todayEvents: [] });
  }

  const pending = extractData<Reminder[]>(pendingRes);
  if (Array.isArray(pending)) setState({ pendingReminders: pending });
  else setState({ pendingReminders: [] });

  const count = extractData<{ count: number }>(countRes);
  if (count && typeof count.count === "number") setState({ pendingCount: count.count });

  const nextEvent = ev ?? null;
  const urgent =
    nextEvent !== null &&
    new Date(nextEvent.date).getTime() - Date.now() < 86400000 &&
    new Date(nextEvent.date).getTime() > Date.now();

  setState({ nextEvent, loading: false, urgent });
}

function subscribeToStore(cb: () => void) {
  listeners.add(cb);
  if (subscriberCount === 0) {
    if (!pollingTimer) {
      fetchData();
      pollingTimer = setInterval(fetchData, 30000);
    }
  }
  subscriberCount++;
  return () => {
    listeners.delete(cb);
    subscriberCount--;
    if (subscriberCount === 0 && pollingTimer) {
      clearInterval(pollingTimer);
      pollingTimer = null;
    }
  };
}

function getSnapshot() {
  return globalState;
}

// ── Hook ─────────────────────────────────────────────────────
export function useReminders() {
  const state = useSyncExternalStore(subscribeToStore, getSnapshot, getSnapshot);

  const refetch = useCallback(async () => {
    await fetchData();
  }, []);

  const createEvent = useCallback(async (data: any) => {
    const res = await apiService.post<ReminderEvent>("/rappels", data);
    if (res.success) {
      await fetchData();
      return { success: true, event: extractData<ReminderEvent>(res) };
    }
    return { success: false, message: res.message };
  }, []);

  const updateEvent = useCallback(async (id: string, data: any) => {
    const res = await apiService.put<ReminderEvent>(`/rappels/${id}`, data);
    if (res.success) {
      await fetchData();
      return { success: true, event: extractData<ReminderEvent>(res) };
    }
    return { success: false, message: res.message };
  }, []);

  const deleteEvent = useCallback(async (id: string) => {
    const res = await apiService.delete(`/rappels/${id}`);
    if (res.success) {
      await fetchData();
      return { success: true };
    }
    return { success: false, message: res.message };
  }, []);

  const dismissReminder = useCallback(async (id: string) => {
    const res = await apiService.post(`/rappels/${id}/dismiss`);
    if (res.success) {
      await fetchData();
      return { success: true };
    }
    return { success: false, message: res.message };
  }, []);

  const addTimerNotification = useCallback((event: ReminderEvent) => {
    const notif: TimerNotification = {
      id: `timer-${event.id}-${Date.now()}`,
      event,
      triggeredAt: Date.now(),
    };
    setState({ timerNotifications: [...globalState.timerNotifications, notif] });

    if ("Notification" in window && Notification.permission === "granted") {
      new Notification("⏰ انتهى التذكير!", {
        body: event.title,
        icon: "/images/icon.png",
      });
    }
  }, []);

  const dismissTimerNotification = useCallback((id: string) => {
    setState({
      timerNotifications: globalState.timerNotifications.filter((n) => n.id !== id),
    });
  }, []);

  return {
    nextEvent: state.nextEvent,
    todayEvents: state.todayEvents,
    pendingReminders: state.pendingReminders,
    pendingCount: state.pendingCount,
    urgent: state.urgent,
    loading: state.loading,
    timerNotifications: state.timerNotifications,
    refetch,
    createEvent,
    updateEvent,
    deleteEvent,
    dismissReminder,
    addTimerNotification,
    dismissTimerNotification,
  };
}
