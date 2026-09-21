"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { ReminderEvent } from "@/types";
import { icones, tailles } from "@/components/lottie/icones";
import IconeAnimee from "@/components/ui/IconeAnimee";

const typeLabels: Record<string, string> = {
  RENDEZ_VOUS: "موعد",
  AUDIENCE: "جلسة",
  TACHE: "مهمة",
  ECHEANCE: "إجراء",
};

function getTargetDate(event: ReminderEvent): Date {
  const d = new Date(event.date);
  if (isNaN(d.getTime())) return new Date();
  return d;
}

function getTimeRemaining(target: Date) {
  const diff = target.getTime() - Date.now();
  if (diff <= 0) return { days: 0, hours: 0, minutes: 0, seconds: 0, total: diff };
  return {
    days: Math.floor(diff / (1000 * 60 * 60 * 24)),
    hours: Math.floor((diff / (1000 * 60 * 60)) % 24),
    minutes: Math.floor((diff / (1000 * 60)) % 60),
    seconds: Math.floor((diff / 1000) % 60),
    total: diff,
  };
}

export default function CountdownTimer({
  event,
  onFinish,
}: {
  event: ReminderEvent | null;
  onFinish?: (event: ReminderEvent) => void;
}) {
  const [remaining, setRemaining] = useState<{
    days: number; hours: number; minutes: number; seconds: number; total: number;
  } | null>(null);
  const [finished, setFinished] = useState(false);
  const finishedRef = useRef(false);

  const handleFinish = useCallback(() => {
    if (event && !finishedRef.current) {
      finishedRef.current = true;
      setFinished(true);
      onFinish?.(event);
    }
  }, [event, onFinish]);

  useEffect(() => {
    if (!event) { setRemaining(null); setFinished(false); finishedRef.current = false; return; }
    const target = getTargetDate(event);
    finishedRef.current = false;
    setFinished(false);
    const tick = () => {
      const r = getTimeRemaining(target);
      setRemaining(r);
      if (r.total <= 0) handleFinish();
    };
    tick();
    const timer = setInterval(tick, 1000);
    return () => clearInterval(timer);
  }, [event, handleFinish]);

  if (!event || !remaining) {
    return (
      <div className="bg-white rounded-card shadow-card p-6 text-center">
        <div className="w-24 h-24 mx-auto mb-3 flex items-center justify-center bg-[#EAF2FF] rounded-2xl">
          <IconeAnimee icone={icones.horloge} taille={tailles.petit} animation="none" />
        </div>
        <p className="text-base text-[#6B7280]">لا توجد تذكيرات حالياً.</p>
      </div>
    );
  }

  const units = [
    { label: "أيام", value: remaining.days },
    { label: "ساعات", value: remaining.hours },
    { label: "دقائق", value: remaining.minutes },
    { label: "ثواني", value: remaining.seconds },
  ];

  if (finished) {
    return (
      <div className="bg-red-50 border-2 border-red-300 rounded-card p-6 animate-pulse">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-14 h-14 rounded-xl bg-red-100 flex items-center justify-center">
            <IconeAnimee icone={icones.horloge} taille={tailles.petit} animation="none" />
          </div>
          <div>
            <p className="text-sm text-red-500 font-semibold">انتهى التذكير!</p>
            <p className="text-lg font-bold text-red-700">{event.title}</p>
          </div>
          <div className="mr-auto">
            <span className="px-3 py-1 rounded-full bg-red-100 text-sm font-bold text-red-600 shadow-sm">
              {typeLabels[event.type] || event.type}
            </span>
          </div>
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-center">
          {units.map((unit) => (
            <div key={unit.label} className="bg-white rounded-card-sm py-4 shadow-sm">
              <p className="text-3xl font-bold text-red-500 tabular-nums leading-none">
                {String(unit.value).padStart(2, "0")}
              </p>
              <p className="text-sm text-red-400 mt-1.5 font-semibold">{unit.label}</p>
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="bg-[#FFF6EC] border-2 border-[#FF9F1C]/20 rounded-card p-6">
      <div className="flex items-center gap-3 mb-4">
        <div className="w-14 h-14 rounded-xl bg-white flex items-center justify-center">
          <IconeAnimee icone={icones.horloge} taille={tailles.petit} animation="none" />
        </div>
        <div>
          <p className="text-sm text-[#6B7280] font-semibold">التذكير القادم</p>
          <p className="text-lg font-bold text-[#0E2F6B] break-words">{event.title}</p>
        </div>
        <div className="mr-auto">
          <span className="px-3 py-1 rounded-full bg-white text-sm font-bold text-[#FF9F1C] shadow-sm">
            {typeLabels[event.type] || event.type}
          </span>
        </div>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-center">
        {units.map((unit) => (
          <div key={unit.label} className="bg-white rounded-card-sm py-4 shadow-sm">
            <p className="text-3xl font-bold text-[#FF9F1C] tabular-nums leading-none">
              {String(unit.value).padStart(2, "0")}
            </p>
            <p className="text-sm text-[#6B7280] mt-1.5 font-semibold">{unit.label}</p>
          </div>
        ))}
      </div>

      {event.client && (
        <div className="mt-4 pt-4 border-t border-[#FF9F1C]/10 text-center">
          <span className="text-sm text-[#6B7280]">
            {event.client.prenom} {event.client.nom}
            {event.lieu && ` — ${event.lieu}`}
          </span>
        </div>
      )}
    </div>
  );
}
