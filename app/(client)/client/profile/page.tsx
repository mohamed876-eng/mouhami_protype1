// Page de profil client — modification des informations personnelles limitées

"use client";

import { useState, useEffect } from "react";
import { apiService } from "@/lib/api";
import { getStoredUser } from "@/lib/auth";

export default function ClientProfilePage() {
  const user = getStoredUser();
  const [form, setForm] = useState({
    telephone: "",
    adresse: "",
    ville: "",
    clientId: "",
  });
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");

  useEffect(() => {
    loadClientData();
  }, []);

  async function loadClientData() {
    const result = await apiService.get<any>("/clients/me");
    if (result.success && result.data) {
      const client = result.data.client;
      setForm({
        clientId: client.id,
        telephone: client.telephone || "",
        adresse: client.adresse || "",
        ville: client.ville || "",
      });
    }
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setMessage("");

    const result = await apiService.put("/clients/me", {
      telephone: form.telephone,
      adresse: form.adresse,
      ville: form.ville,
    });
    if (result.success) {
      setMessage("تم تحديث المعلومات بنجاح");
    } else {
      setMessage("حدث خطأ في التحديث");
    }
    setLoading(false);
  }

  return (
    <div className="max-w-lg mx-auto">
      <h1 className="text-2xl font-bold text-primary-500 mb-6">
        👤 الملف الشخصي
      </h1>

      <div className="bg-white rounded-xl border border-secondary-200 p-6 space-y-4">
        <div className="text-center pb-4 border-b border-secondary-200">
          <div className="w-20 h-20 bg-primary-500 rounded-full flex items-center justify-center text-white text-2xl font-bold mx-auto mb-3">
            {user?.prenom?.charAt(0)}{user?.nom?.charAt(0)}
          </div>
          <p className="font-medium">{user?.prenom} {user?.nom}</p>
          <p className="text-sm text-secondary-400">{user?.email}</p>
        </div>

        {message && (
          <div className={`px-4 py-3 rounded-lg text-sm ${message.includes("نجاح") ? "bg-green-50 text-green-700" : "bg-red-50 text-red-700"}`}>
            {message}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-secondary-700 mb-1">
              الهاتف
            </label>
            <input
              type="tel"
              value={form.telephone}
              onChange={(e) => setForm({ ...form, telephone: e.target.value })}
              className="w-full px-4 py-2.5 border border-secondary-200 rounded-lg text-sm"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-secondary-700 mb-1">
              المدينة
            </label>
            <input
              type="text"
              value={form.ville}
              onChange={(e) => setForm({ ...form, ville: e.target.value })}
              className="w-full px-4 py-2.5 border border-secondary-200 rounded-lg text-sm"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-secondary-700 mb-1">
              العنوان
            </label>
            <textarea
              value={form.adresse}
              onChange={(e) => setForm({ ...form, adresse: e.target.value })}
              rows={3}
              className="w-full px-4 py-2.5 border border-secondary-200 rounded-lg text-sm"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-primary-500 text-white py-2.5 rounded-lg font-medium hover:bg-primary-600 transition-colors disabled:opacity-50"
          >
            {loading ? "جاري الحفظ..." : "حفظ التعديلات"}
          </button>
        </form>
      </div>
    </div>
  );
}
