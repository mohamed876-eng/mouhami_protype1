"use client";

import { useState } from "react";
import { X } from "lucide-react";
import IconeAnimee from "@/components/ui/IconeAnimee";
import { lottieNotification } from "@/components/lottie";

interface Props {
  open: boolean;
  onClose: () => void;
  onCreate: (data: any) => Promise<any>;
}

const eventTypes = [
  { value: "RENDEZ_VOUS", label: "موعد" },
  { value: "AUDIENCE", label: "جلسة" },
  { value: "TACHE", label: "مهمة" },
  { value: "ECHEANCE", label: "إجراء" },
];

const priorities = [
  { value: "FAIBLE", label: "منخفضة" },
  { value: "NORMALE", label: "عادية" },
  { value: "IMPORTANTE", label: "مهمة" },
  { value: "URGENTE", label: "عاجلة" },
];

export default function CreateReminderModal({ open, onClose, onCreate }: Props) {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [type, setType] = useState("AUDIENCE");
  const [date, setDate] = useState("");
  const [time, setTime] = useState("");
  const [lieu, setLieu] = useState("");
  const [priority, setPriority] = useState("NORMALE");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  const reset = () => {
    setTitle(""); setDescription(""); setType("AUDIENCE");
    setDate(""); setTime(""); setLieu(""); setPriority("NORMALE");
    setError(""); setSubmitting(false);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !date) return;
    setSubmitting(true);
    setError("");
    const result = await onCreate({
      title: title.trim(),
      description: description.trim() || undefined,
      type,
      date,
      time: time || undefined,
      lieu: lieu.trim() || undefined,
      priority,
    });
    setSubmitting(false);
    if (result.success) {
      reset();
      onClose();
    } else {
      setError(result.message || "حدث خطأ أثناء الحفظ");
    }
  };

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={onClose} />
      <div className="relative bg-white rounded-card shadow-xl w-full max-w-lg mx-4 max-h-[90vh] overflow-y-auto animate-scale-in">
        <div className="flex items-center justify-between px-6 py-4 border-b border-border">
          <div className="flex items-center gap-2">
            <IconeAnimee icone={lottieNotification} taille={39} />
            <h2 className="text-xl font-bold text-[#0E2F6B]">حدث جديد</h2>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-[#EAF2FF] rounded-xl transition-colors cursor-pointer"
          >
            <X className="w-6 h-6 text-[#6B7280]" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div>
            <label className="block text-base font-bold text-[#0E2F6B] mb-1.5">العنوان *</label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full px-4 py-3 bg-white border border-border rounded-xl text-base text-[#0E2F6B] focus:outline-none focus:border-[#0F3D91] focus:ring-1 focus:ring-[#0F3D91]/20 transition-all placeholder:text-[#9AA6B8]"
              placeholder="عنوان الحدث"
              required
            />
          </div>

          <div>
            <label className="block text-base font-bold text-[#0E2F6B] mb-1.5">الوصف</label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full px-4 py-3 bg-white border border-border rounded-xl text-base text-[#0E2F6B] focus:outline-none focus:border-[#0F3D91] focus:ring-1 focus:ring-[#0F3D91]/20 transition-all placeholder:text-[#9AA6B8] resize-none"
              rows={2}
              placeholder="وصف الحدث"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-base font-bold text-[#0E2F6B] mb-1.5">النوع</label>
              <select
                value={type}
                onChange={(e) => setType(e.target.value)}
                className="w-full px-4 py-3 bg-white border border-border rounded-xl text-base text-[#0E2F6B] focus:outline-none focus:border-[#0F3D91] focus:ring-1 focus:ring-[#0F3D91]/20 transition-all"
              >
                {eventTypes.map((t) => (
                  <option key={t.value} value={t.value}>{t.label}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-base font-bold text-[#0E2F6B] mb-1.5">الأولوية</label>
              <select
                value={priority}
                onChange={(e) => setPriority(e.target.value)}
                className="w-full px-4 py-3 bg-white border border-border rounded-xl text-base text-[#0E2F6B] focus:outline-none focus:border-[#0F3D91] focus:ring-1 focus:ring-[#0F3D91]/20 transition-all"
              >
                {priorities.map((p) => (
                  <option key={p.value} value={p.value}>{p.label}</option>
                ))}
              </select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-base font-bold text-[#0E2F6B] mb-1.5">التاريخ *</label>
              <input
                type="date"
                value={date}
                onChange={(e) => setDate(e.target.value)}
                className="w-full px-4 py-3 bg-white border border-border rounded-xl text-base text-[#0E2F6B] focus:outline-none focus:border-[#0F3D91] focus:ring-1 focus:ring-[#0F3D91]/20 transition-all"
                required
              />
            </div>
            <div>
              <label className="block text-base font-bold text-[#0E2F6B] mb-1.5">الوقت</label>
              <input
                type="time"
                value={time}
                onChange={(e) => setTime(e.target.value)}
                className="w-full px-4 py-3 bg-white border border-border rounded-xl text-base text-[#0E2F6B] focus:outline-none focus:border-[#0F3D91] focus:ring-1 focus:ring-[#0F3D91]/20 transition-all"
              />
            </div>
          </div>

          <div>
            <label className="block text-base font-bold text-[#0E2F6B] mb-1.5">المكان</label>
            <input
              type="text"
              value={lieu}
              onChange={(e) => setLieu(e.target.value)}
              className="w-full px-4 py-3 bg-white border border-border rounded-xl text-base text-[#0E2F6B] focus:outline-none focus:border-[#0F3D91] focus:ring-1 focus:ring-[#0F3D91]/20 transition-all placeholder:text-[#9AA6B8]"
              placeholder="المكان (اختياري)"
            />
          </div>

          {error && (
            <p className="text-sm text-red-500 text-center font-semibold">{error}</p>
          )}

          <button
            type="submit"
            disabled={submitting}
            className="w-full py-3 bg-[#0F3D91] text-white rounded-xl text-base font-bold hover:bg-[#1E5BDB] transition-all duration-250 cursor-pointer disabled:opacity-50 shadow-sm"
          >
            {submitting ? "جاري الحفظ..." : "حفظ الحدث"}
          </button>
        </form>
      </div>
    </div>
  );
}
