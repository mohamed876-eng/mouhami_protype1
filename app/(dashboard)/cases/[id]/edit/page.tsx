// Page d'édition d'un dossier

"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { useCases } from "@/hooks/useCases";
import { apiService } from "@/lib/api";

export default function EditCasePage() {
  const { id } = useParams();
  const router = useRouter();
  const { caseData, loading: loadingCase, fetchCase, updateCase } = useCases();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [form, setForm] = useState({
    type: "",
    sousType: "",
    tribunal: "",
    mahakimRef: "",
    etat: "",
    description: "",
    notes: "",
  });

  useEffect(() => {
    if (id) fetchCase(id as string);
  }, [id, fetchCase]);

  useEffect(() => {
    if (caseData) {
      setForm({
        type: caseData.type,
        sousType: caseData.sousType || "",
        tribunal: caseData.tribunal || "",
        mahakimRef: caseData.mahakimRef || "",
        etat: caseData.etat,
        description: caseData.description || "",
        notes: caseData.notes || "",
      });
    }
  }, [caseData]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!id) return;
    setLoading(true);
    setError("");

    const result = await updateCase(id as string, form);
    if (result.success) {
      router.push(`/cases/${id}`);
    } else {
      setError(result.message || "حدث خطأ");
    }
    setLoading(false);
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  if (loadingCase) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin w-8 h-8 border-4 border-primary-500 border-t-transparent rounded-full" />
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto">
      <h1 className="text-3xl text-primary-500 mb-8">
        تعديل الملف : {caseData?.reference}
      </h1>

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-6 text-sm">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="bg-white rounded-xl border border-secondary-200 p-6 space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-secondary-700 mb-1">النوع</label>
            <input type="text" name="type" value={form.type} onChange={handleChange} required className="w-full px-4 py-2.5 border border-secondary-200 rounded-lg text-sm focus:ring-2 focus:ring-primary-500" />
          </div>
          <div>
            <label className="block text-sm font-medium text-secondary-700 mb-1">النوع الفرعي</label>
            <input type="text" name="sousType" value={form.sousType} onChange={handleChange} className="w-full px-4 py-2.5 border border-secondary-200 rounded-lg text-sm focus:ring-2 focus:ring-primary-500" />
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-secondary-700 mb-1">المحكمة</label>
            <input type="text" name="tribunal" value={form.tribunal} onChange={handleChange} className="w-full px-4 py-2.5 border border-secondary-200 rounded-lg text-sm focus:ring-2 focus:ring-primary-500" />
          </div>
          <div>
            <label className="block text-sm font-medium text-secondary-700 mb-1">مرجع محكيم</label>
            <input type="text" name="mahakimRef" value={form.mahakimRef} onChange={handleChange} className="w-full px-4 py-2.5 border border-secondary-200 rounded-lg text-sm focus:ring-2 focus:ring-primary-500" />
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-secondary-700 mb-1">الحالة</label>
          <select name="etat" value={form.etat} onChange={handleChange} className="w-full px-4 py-2.5 border border-secondary-200 rounded-lg text-sm focus:ring-2 focus:ring-primary-500">
            <option value="en_cours">قيد المعالجة</option>
            <option value="cloture">مغلق</option>
            <option value="suspendu">موقوف</option>
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-secondary-700 mb-1">الوصف</label>
          <textarea name="description" value={form.description} onChange={handleChange} rows={3} className="w-full px-4 py-2.5 border border-secondary-200 rounded-lg text-sm focus:ring-2 focus:ring-primary-500" />
        </div>

        <div>
          <label className="block text-sm font-medium text-secondary-700 mb-1">ملاحظات</label>
          <textarea name="notes" value={form.notes} onChange={handleChange} rows={3} className="w-full px-4 py-2.5 border border-secondary-200 rounded-lg text-sm focus:ring-2 focus:ring-primary-500" />
        </div>

        <div className="flex gap-3 pt-4">
          <button type="submit" disabled={loading} className="bg-primary-500 text-white px-6 py-2.5 rounded-lg font-medium hover:bg-primary-600 transition-colors disabled:opacity-50">
            {loading ? "جاري الحفظ..." : "حفظ التعديلات"}
          </button>
          <button type="button" onClick={() => router.push(`/cases/${id}`)} className="px-6 py-2.5 border border-secondary-200 rounded-lg text-sm hover:bg-secondary-50 transition-colors">
            إلغاء
          </button>
        </div>
      </form>
    </div>
  );
}
