"use client";

import { useState, useRef, useEffect } from "react";
import IconeAnimee from "@/components/ui/IconeAnimee";
import { icones, tailles } from "@/components/lottie/icones";
import { useReminders } from "@/hooks/useReminders";

export default function ReminderBell() {
  const { pendingCount, pendingReminders, dismissReminder, urgent, timerNotifications, dismissTimerNotification } = useReminders();
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  const totalCount = pendingCount + timerNotifications.length;
  const hasExpired = timerNotifications.length > 0;

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  useEffect(() => {
    if ("Notification" in window && Notification.permission === "default") {
      Notification.requestPermission();
    }
  }, []);

  return (
    <div ref={ref} className="relative">
      <button
        onClick={() => setOpen(!open)}
        className={`relative w-11 h-11 sm:w-14 sm:h-14 lg:w-16 lg:h-16 rounded-xl flex items-center justify-center transition-all duration-250 cursor-pointer ${
          hasExpired
            ? "bg-red-50 hover:bg-red-100 animate-pulse"
            : "bg-[#F8FAFD] hover:bg-[#EAF2FF]"
        }`}
        aria-label="التذكيرات"
      >
        <IconeAnimee icone={icones.notifications} taille={tailles.petit} title="التذكيرات" />
        {totalCount > 0 && (
          <span className={`absolute -top-1 -right-1 w-6 h-6 ${hasExpired ? "bg-red-500" : urgent ? "bg-red-500" : "bg-[#FF9F1C]"} rounded-full flex items-center justify-center shadow-sm`}>
            <span className="text-white text-xs font-bold">
              {totalCount > 9 ? "9+" : totalCount}
            </span>
          </span>
        )}
      </button>

      {open && (
        <div className="absolute left-0 top-full mt-2 w-80 max-w-[calc(100vw-1rem)] bg-white rounded-card shadow-card border border-border z-30 overflow-hidden animate-scale-in">
          <div className="p-4 border-b border-border">
            <p className="text-base font-bold text-[#0E2F6B]">التذكيرات</p>
          </div>

          {totalCount === 0 ? (
            <div className="p-6 text-center">
              <IconeAnimee icone={icones.notifications} taille={tailles.carte} className="mx-auto mb-3" />
              <p className="text-sm text-[#6B7280]">لا توجد تذكيرات</p>
            </div>
          ) : (
            <div className="max-h-72 overflow-y-auto">
              {timerNotifications.map((notif) => (
                <div
                  key={notif.id}
                  className="px-4 py-3.5 border-b border-red-200 last:border-b-0 bg-red-50 hover:bg-red-100 transition-colors animate-pulse"
                >
                  <div className="flex items-start justify-between gap-2">
                    <div className="min-w-0">
                      <p className="text-sm font-bold text-red-600 flex items-center gap-1.5">
                        <span className="inline-block w-2 h-2 bg-red-500 rounded-full" />
                        انتهى: {notif.event.title}
                      </p>
                      {notif.event.client && (
                        <p className="text-xs text-red-400 mt-0.5">
                          {notif.event.client.prenom} {notif.event.client.nom}
                        </p>
                      )}
                      <p className="text-xs text-red-400 mt-1">
                        {new Date(notif.triggeredAt).toLocaleTimeString("ar-MA", {
                          hour: "2-digit",
                          minute: "2-digit",
                        })}
                      </p>
                    </div>
                    <button
                      onClick={() => dismissTimerNotification(notif.id)}
                      className="shrink-0 px-2.5 py-1 text-xs font-semibold text-red-500 hover:bg-white rounded-lg transition-colors cursor-pointer"
                    >
                      تم
                    </button>
                  </div>
                </div>
              ))}

              {pendingReminders.map((reminder) => {
                const eventDate = reminder.event?.date ? new Date(reminder.event.date).getTime() : 0;
                const isUrgent = eventDate > Date.now() && eventDate - Date.now() < 86400000;
                return (
                  <div
                    key={reminder.id}
                    className={`px-4 py-3.5 border-b border-border last:border-b-0 transition-colors ${
                      isUrgent ? "bg-red-50 hover:bg-red-100" : "hover:bg-[#EAF2FF]/30"
                    }`}
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div className="min-w-0">
                        <p className={`text-sm font-bold ${isUrgent ? "text-red-600" : "text-[#0E2F6B]"}`}>
                          {reminder.title}
                        </p>
                        {reminder.description && (
                          <p className="text-xs text-[#6B7280] mt-0.5 line-clamp-1">
                            {reminder.description}
                          </p>
                        )}
                        <p className={`text-xs mt-1 ${isUrgent ? "text-red-500" : "text-[#FF9F1C]"}`}>
                          {new Date(reminder.remindAt).toLocaleDateString("ar-MA", {
                            day: "numeric",
                            month: "long",
                            hour: "2-digit",
                            minute: "2-digit",
                          })}
                        </p>
                      </div>
                      <button
                        onClick={() => dismissReminder(reminder.id)}
                        className="shrink-0 px-2.5 py-1 text-xs font-semibold text-[#6B7280] hover:bg-white rounded-lg transition-colors cursor-pointer"
                      >
                        تم
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
