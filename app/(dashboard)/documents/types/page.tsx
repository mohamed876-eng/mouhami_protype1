// Page de configuration des types de documents
// L'avocat peut créer, modifier et supprimer des types

"use client";

import { useEffect, useState } from "react";
import { apiService } from "@/lib/api";
import Modal from "@/components/ui/Modal";
import IconeAnimee from "@/components/ui/IconeAnimee";
import { lottieDocument, lottiePlus } from "@/components/lottie";

export default function DocumentTypesPage() {
  const [types, setTypes] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editType, setEditType] = useState<any>(null);
  const [form, setForm] = useState({ nom: "", slug: "", icon: "" });

  useEffect(() => {
    loadTypes();
  }, []);

  async function loadTypes() {
    setLoading(true);
    const result = await apiService.get<any>("/document-types");
    if (result.success && result.data) {
      setTypes(result.data.types);
    }
    setLoading(false);
  }

  function openCreate() {
    setEditType(null);
    setForm({ nom: "", slug: "", icon: "" });
    setShowModal(true);
  }

  function openEdit(type: any) {
    setEditType(type);
    setForm({ nom: type.nom, slug: type.slug, icon: type.icon || "" });
    setShowModal(true);
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (editType) {
      await apiService.put(`/document-types/${editType.id}`, form);
    } else {
      await apiService.post("/document-types", form);
    }
    setShowModal(false);
    loadTypes();
  }

  async function handleDelete(id: string) {
    if (confirm("هل أنت متأكد من حذف هذا النوع؟")) {
      await apiService.delete(`/document-types/${id}`);
      loadTypes();
    }
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-xl bg-[#EAF2FF] flex items-center justify-center shrink-0">
            <IconeAnimee icone={lottieDocument} taille={42} title="أنواع المستندات" />
          </div>
          <h1 className="text-2xl font-bold text-primary-500">أنواع المستندات</h1>
        </div>
        <button
          onClick={openCreate}
          className="flex items-center gap-2 bg-primary-500 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-primary-600 transition-colors"
        >
          <IconeAnimee icone={lottiePlus} taille={24} />
          إضافة نوع
        </button>
      </div>

      <div className="bg-white rounded-xl border border-secondary-200 overflow-hidden">
        {loading ? (
          <div className="p-12 text-center">
            <div className="animate-spin w-8 h-8 border-4 border-primary-500 border-t-transparent rounded-full mx-auto" />
          </div>
        ) : types.length === 0 ? (
          <div className="p-12 text-center text-secondary-500">
            <IconeAnimee icone={lottiePlus} taille={72} className="mx-auto mb-5" />
            لا توجد أنواع بعد. أضف أول نوع مستند.
          </div>
        ) : (
          <table className="w-full">
            <thead>
              <tr className="border-b border-secondary-200 bg-secondary-50">
                <th className="text-right px-4 py-3 text-sm font-medium text-secondary-600">الاسم</th>
                <th className="text-right px-4 py-3 text-sm font-medium text-secondary-600">المعرف</th>
                <th className="text-right px-4 py-3 text-sm font-medium text-secondary-600">الإجراءات</th>
              </tr>
            </thead>
            <tbody>
              {types.map((type: any) => (
                <tr key={type.id} className="border-b border-secondary-100 hover:bg-secondary-50">
                  <td className="px-4 py-3 text-sm font-medium">{type.nom}</td>
                  <td className="px-4 py-3 text-sm text-secondary-400">{type.slug}</td>
                  <td className="px-4 py-3 text-sm">
                    <button onClick={() => openEdit(type)} className="text-blue-500 hover:text-blue-700 ml-3">تعديل</button>
                    <button onClick={() => handleDelete(type.id)} className="text-red-500 hover:text-red-700">حذف</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      <Modal isOpen={showModal} onClose={() => setShowModal(false)} title={editType ? "تعديل النوع" : "إضافة نوع جديد"}>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-secondary-700 mb-1">الاسم *</label>
            <input
              type="text"
              value={form.nom}
              onChange={(e) => setForm({ ...form, nom: e.target.value })}
              required
              className="w-full px-4 py-2.5 border border-secondary-200 rounded-lg text-sm"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-secondary-700 mb-1">المعرف (slug) *</label>
            <input
              type="text"
              value={form.slug}
              onChange={(e) => setForm({ ...form, slug: e.target.value })}
              required
              className="w-full px-4 py-2.5 border border-secondary-200 rounded-lg text-sm"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-secondary-700 mb-1">الأيقونة</label>
            <input
              type="text"
              value={form.icon}
              onChange={(e) => setForm({ ...form, icon: e.target.value })}
              className="w-full px-4 py-2.5 border border-secondary-200 rounded-lg text-sm"
              placeholder="file, id-card, ..."
            />
          </div>
          <button type="submit" className="w-full bg-primary-500 text-white py-2.5 rounded-lg font-medium hover:bg-primary-600 transition-colors">
            {editType ? "حفظ التعديلات" : "إضافة النوع"}
          </button>
        </form>
      </Modal>
    </div>
  );
}
