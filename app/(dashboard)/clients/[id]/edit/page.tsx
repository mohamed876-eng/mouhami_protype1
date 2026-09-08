// Page de modification d'un client

"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { useClients } from "@/hooks/useClients";

export default function EditClientPage() {
  const { id } = useParams();
  const router = useRouter();
  const { client, loading: loadingClient, fetchClient, updateClient } = useClients();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [form, setForm] = useState({
    nom: "",
    prenom: "",
    cin: "",
    telephone: "",
    adresse: "",
    ville: "",
    profession: "",
    email: "",
    observations: "",
  });

  useEffect(() => {
    if (id) fetchClient(id as string);
  }, [id, fetchClient]);

  useEffect(() => {
    if (client) {
      setForm({
        nom: client.nom,
        prenom: client.prenom,
        cin: client.cin,
        telephone: client.telephone,
        adresse: client.adresse || "",
        ville: client.ville || "",
        profession: client.profession || "",
        email: client.email || "",
        observations: client.observations || "",
      });
    }
  }, [client]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!id) return;

    setLoading(true);
    setError("");

    const result = await updateClient(id as string, form);
    if (result.success) {
      router.push(`/clients/${id}`);
    } else {
      setError(result.message || "حدث خطأ");
    }

    setLoading(false);
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  if (loadingClient) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin w-8 h-8 border-4 border-primary-500 border-t-transparent rounded-full" />
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto">
      <h1 className="text-2xl font-bold text-primary-500 mb-6">
        تعديل العميل : {client?.prenom} {client?.nom}
      </h1>

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-6 text-sm">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="bg-white rounded-xl border border-secondary-200 p-6 space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-secondary-700 mb-1">الاسم الشخصي</label>
            <input type="text" name="prenom" value={form.prenom} onChange={handleChange} required className="w-full px-4 py-2.5 border border-secondary-200 rounded-lg text-sm focus:ring-2 focus:ring-primary-500 focus:border-transparent" />
          </div>
          <div>
            <label className="block text-sm font-medium text-secondary-700 mb-1">اسم العائلة</label>
            <input type="text" name="nom" value={form.nom} onChange={handleChange} required className="w-full px-4 py-2.5 border border-secondary-200 rounded-lg text-sm focus:ring-2 focus:ring-primary-500 focus:border-transparent" />
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-secondary-700 mb-1">CIN</label>
            <input type="text" name="cin" value={form.cin} onChange={handleChange} required className="w-full px-4 py-2.5 border border-secondary-200 rounded-lg text-sm focus:ring-2 focus:ring-primary-500 focus:border-transparent" />
          </div>
          <div>
            <label className="block text-sm font-medium text-secondary-700 mb-1">الهاتف</label>
            <input type="tel" name="telephone" value={form.telephone} onChange={handleChange} required className="w-full px-4 py-2.5 border border-secondary-200 rounded-lg text-sm focus:ring-2 focus:ring-primary-500 focus:border-transparent" />
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-secondary-700 mb-1">البريد الإلكتروني</label>
            <input type="email" name="email" value={form.email} onChange={handleChange} className="w-full px-4 py-2.5 border border-secondary-200 rounded-lg text-sm focus:ring-2 focus:ring-primary-500 focus:border-transparent" />
          </div>
          <div>
            <label className="block text-sm font-medium text-secondary-700 mb-1">المهنة</label>
            <input type="text" name="profession" value={form.profession} onChange={handleChange} className="w-full px-4 py-2.5 border border-secondary-200 rounded-lg text-sm focus:ring-2 focus:ring-primary-500 focus:border-transparent" />
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-secondary-700 mb-1">المدينة</label>
          <input type="text" name="ville" value={form.ville} onChange={handleChange} className="w-full px-4 py-2.5 border border-secondary-200 rounded-lg text-sm focus:ring-2 focus:ring-primary-500 focus:border-transparent" />
        </div>

        <div>
          <label className="block text-sm font-medium text-secondary-700 mb-1">العنوان</label>
          <input type="text" name="adresse" value={form.adresse} onChange={handleChange} className="w-full px-4 py-2.5 border border-secondary-200 rounded-lg text-sm focus:ring-2 focus:ring-primary-500 focus:border-transparent" />
        </div>

        <div>
          <label className="block text-sm font-medium text-secondary-700 mb-1">ملاحظات</label>
          <textarea name="observations" value={form.observations} onChange={handleChange} rows={3} className="w-full px-4 py-2.5 border border-secondary-200 rounded-lg text-sm focus:ring-2 focus:ring-primary-500 focus:border-transparent" />
        </div>

        <div className="flex gap-3 pt-4">
          <button type="submit" disabled={loading} className="bg-primary-500 text-white px-6 py-2.5 rounded-lg font-medium hover:bg-primary-600 transition-colors disabled:opacity-50">
            {loading ? "جاري الحفظ..." : "حفظ التعديلات"}
          </button>
          <button type="button" onClick={() => router.back()} className="px-6 py-2.5 border border-secondary-200 rounded-lg text-sm hover:bg-secondary-50 transition-colors">
            إلغاء
          </button>
        </div>
      </form>
    </div>
  );
}
