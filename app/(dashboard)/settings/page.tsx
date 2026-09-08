// Page des paramètres du cabinet

"use client";

import { useEffect, useState } from "react";
import { apiService } from "@/lib/api";

export default function SettingsPage() {
  const [settings, setSettings] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");

  useEffect(() => {
    loadSettings();
  }, []);

  async function loadSettings() {
    setLoading(true);
    const result = await apiService.get<{ settings: Record<string, string> }>("/settings");
    if (result.success && result.data) {
      setSettings(result.data.settings);
    }
    setLoading(false);
  }

  async function handleSave() {
    setSaving(true);
    setMessage("");
    const result = await apiService.put("/settings", settings);
    if (result.success) {
      setMessage("تم حفظ الإعدادات بنجاح");
    } else {
      setMessage("حدث خطأ في الحفظ");
    }
    setSaving(false);
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin w-8 h-8 border-4 border-primary-500 border-t-transparent rounded-full" />
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto">
      <h1 className="text-2xl font-bold text-primary-500 mb-6">الإعدادات</h1>

      {message && (
        <div className={`px-4 py-3 rounded-lg mb-6 text-sm ${message.includes("نجاح") ? "bg-green-50 text-green-700" : "bg-red-50 text-red-700"}`}>
          {message}
        </div>
      )}

      <div className="bg-white rounded-xl border border-secondary-200 p-6 space-y-4">
        <div>
          <label className="block text-sm font-medium text-secondary-700 mb-1">اسم المكتب</label>
          <input
            type="text"
            value={settings.cabinet_nom || ""}
            onChange={(e) => setSettings({ ...settings, cabinet_nom: e.target.value })}
            className="w-full px-4 py-2.5 border border-secondary-200 rounded-lg text-sm focus:ring-2 focus:ring-primary-500 focus:border-transparent"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-secondary-700 mb-1">العنوان</label>
          <input
            type="text"
            value={settings.cabinet_adresse || ""}
            onChange={(e) => setSettings({ ...settings, cabinet_adresse: e.target.value })}
            className="w-full px-4 py-2.5 border border-secondary-200 rounded-lg text-sm focus:ring-2 focus:ring-primary-500 focus:border-transparent"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-secondary-700 mb-1">الهاتف</label>
          <input
            type="text"
            value={settings.cabinet_telephone || ""}
            onChange={(e) => setSettings({ ...settings, cabinet_telephone: e.target.value })}
            className="w-full px-4 py-2.5 border border-secondary-200 rounded-lg text-sm focus:ring-2 focus:ring-primary-500 focus:border-transparent"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-secondary-700 mb-1">البريد الإلكتروني</label>
          <input
            type="email"
            value={settings.cabinet_email || ""}
            onChange={(e) => setSettings({ ...settings, cabinet_email: e.target.value })}
            className="w-full px-4 py-2.5 border border-secondary-200 rounded-lg text-sm focus:ring-2 focus:ring-primary-500 focus:border-transparent"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-secondary-700 mb-1">المدينة</label>
          <input
            type="text"
            value={settings.cabinet_ville || ""}
            onChange={(e) => setSettings({ ...settings, cabinet_ville: e.target.value })}
            className="w-full px-4 py-2.5 border border-secondary-200 rounded-lg text-sm focus:ring-2 focus:ring-primary-500 focus:border-transparent"
          />
        </div>

        <button
          onClick={handleSave}
          disabled={saving}
          className="w-full bg-primary-500 text-white py-2.5 rounded-lg font-medium hover:bg-primary-600 transition-colors disabled:opacity-50"
        >
          {saving ? "جاري الحفظ..." : "حفظ الإعدادات"}
        </button>
      </div>
    </div>
  );
}
