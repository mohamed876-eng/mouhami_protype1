"use client";

import { useEffect, useState } from "react";
import { Reminder } from "@/types";
import { X } from "lucide-react";
import IconeAnimee from "@/components/ui/IconeAnimee";
import { lottieNotification } from "@/components/lottie";

export default function NotificationPopup({
  reminders,
  onDismiss,
}: {
  reminders: Reminder[];
  onDismiss: (id: string) => void;
}) {
  const [current, setCurrent] = useState<Reminder | null>(null);
  const [queue, setQueue] = useState<Reminder[]>([]);

  useEffect(() => {
    if (reminders.length > 0) {
      setQueue((prev) => {
        const existingIds = new Set(prev.map((r) => r.id));
        const newOnes = reminders.filter((r) => !existingIds.has(r.id));
        return [...prev, ...newOnes];
      });
    }
  }, [reminders]);

  useEffect(() => {
    if (!current && queue.length > 0) {
      setCurrent(queue[0]);
      setQueue((prev) => prev.slice(1));
    }
  }, [current, queue]);

  useEffect(() => {
    if (!current) return;
    const timer = setTimeout(() => {
      setCurrent(null);
    }, 8000);
    return () => clearTimeout(timer);
  }, [current]);

  useEffect(() => {
    if (!current) return;
    if ("Notification" in window && Notification.permission === "granted") {
      new Notification("تذكير", {
        body: current.title,
        icon: "/images/logo.png",
      });
    }
  }, [current]);

  if (!current) return null;

  const event = current.event;

  return (
    <div className="fixed bottom-6 left-6 z-50 animate-slide-up">
      <div className="bg-white rounded-card shadow-card border border-border p-5 w-80">
        <div className="flex items-start justify-between mb-3">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-xl bg-[#FFF6EC] flex items-center justify-center">
              <IconeAnimee icone={lottieNotification} taille={42} title="تذكير" />
            </div>
            <div>
              <p className="text-sm font-bold text-[#0E2F6B]">تذكير</p>
              <p className="text-xs text-[#6B7280]">
                {new Date(current.remindAt).toLocaleTimeString("ar-MA", {
                  hour: "2-digit",
                  minute: "2-digit",
                })}
              </p>
            </div>
          </div>
          <button
            onClick={() => { setCurrent(null); onDismiss(current.id); }}
            className="p-1.5 hover:bg-[#EAF2FF] rounded-lg transition-colors cursor-pointer"
          >
            <X className="w-4 h-4 text-[#6B7280]" />
          </button>
        </div>

        <p className="text-sm font-bold text-[#0E2F6B] mb-1">{current.title}</p>
        {current.description && (
          <p className="text-xs text-[#6B7280] mb-3">{current.description}</p>
        )}

        {event?.client && (
          <p className="text-xs text-[#6B7280] mb-1">
            العميل: {event.client.prenom} {event.client.nom}
          </p>
        )}
        {event?.lieu && (
          <p className="text-xs text-[#6B7280] mb-3">المكان: {event.lieu}</p>
        )}

        <div className="flex gap-2 mt-3">
          {event?.cas?.id && (
            <a
              href={`/cases/${event.cas.id}`}
              className="flex-1 text-center px-4 py-2.5 bg-[#0F3D91] text-white rounded-xl text-sm font-bold hover:bg-[#1E5BDB] transition-all duration-250 shadow-sm"
            >
              عرض الملف
            </a>
          )}
          <button
            onClick={() => { setCurrent(null); onDismiss(current.id); }}
            className="flex-1 px-4 py-2.5 border border-border rounded-xl text-sm font-semibold text-[#6B7280] hover:bg-[#EAF2FF]/30 transition-colors cursor-pointer"
          >
            إغلاق
          </button>
        </div>
      </div>
    </div>
  );
}
