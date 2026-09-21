"use client";

import { useEffect, useState } from "react";
import { useCaseTypes } from "@/hooks/useCaseTypes";
import Modal from "@/components/ui/Modal";
import IconeAnimee from "@/components/ui/IconeAnimee";
import { lottieJustice, lottiePlus, lottieDocument } from "@/components/lottie";

export default function CaseTypesPage() {
  const { types, loading, fetchTypes, createType, updateType, deleteType, addDocument, updateDocument, deleteDocument } = useCaseTypes();
  const [showTypeModal, setShowTypeModal] = useState(false);
  const [editType, setEditType] = useState<any>(null);
  const [typeForm, setTypeForm] = useState({ nameAr: "", description: "" });

  const [showDocModal, setShowDocModal] = useState(false);
  const [selectedTypeId, setSelectedTypeId] = useState("");
  const [editDoc, setEditDoc] = useState<any>(null);
  const [docForm, setDocForm] = useState({ nameAr: "", isRequired: true });

  useEffect(() => {
    fetchTypes(false);
  }, [fetchTypes]);

  function openCreateType() {
    setEditType(null);
    setTypeForm({ nameAr: "", description: "" });
    setShowTypeModal(true);
  }

  function openEditType(type: any) {
    setEditType(type);
    setTypeForm({ nameAr: type.nameAr, description: type.description || "" });
    setShowTypeModal(true);
  }

  async function handleTypeSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (editType) {
      await updateType(editType.id, typeForm);
    } else {
      await createType(typeForm);
    }
    setShowTypeModal(false);
    fetchTypes(false);
  }

  async function handleDeleteType(id: string) {
    if (confirm("هل أنت متأكد من حذف هذا النوع؟")) {
      await deleteType(id);
      fetchTypes(false);
    }
  }

  function openAddDoc(typeId: string) {
    setSelectedTypeId(typeId);
    setEditDoc(null);
    setDocForm({ nameAr: "", isRequired: true });
    setShowDocModal(true);
  }

  function openEditDoc(typeId: string, doc: any) {
    setSelectedTypeId(typeId);
    setEditDoc(doc);
    setDocForm({ nameAr: doc.nameAr, isRequired: doc.isRequired });
    setShowDocModal(true);
  }

  async function handleDocSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (editDoc) {
      await updateDocument(selectedTypeId, editDoc.id, docForm);
    } else {
      await addDocument(selectedTypeId, docForm);
    }
    setShowDocModal(false);
    fetchTypes(false);
  }

  async function handleDeleteDoc(typeId: string, docId: string) {
    if (confirm("هل أنت متأكد من حذف هذا المستند الإلزامي؟")) {
      await deleteDocument(typeId, docId);
      fetchTypes(false);
    }
  }

  return (
    <div>
      <div className="flex flex-wrap items-center justify-between gap-3 mb-6">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-xl bg-[#EAF2FF] flex items-center justify-center shrink-0">
            <IconeAnimee icone={lottieJustice} taille={45} title="أنواع القضايا" />
          </div>
          <h1 className="text-2xl sm:text-3xl text-primary-500">أنواع القضايا</h1>
        </div>
        <button
          onClick={openCreateType}
          className="bg-primary-500 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-primary-600 transition-colors"
        >
          <span className="inline-flex items-center gap-1.5"><IconeAnimee icone={lottiePlus} taille={20} animation="click" /> إضافة نوع</span>
        </button>
      </div>

      {loading ? (
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin w-8 h-8 border-4 border-primary-500 border-t-transparent rounded-full" />
        </div>
      ) : types.length === 0 ? (
        <div className="bg-white rounded-xl border border-secondary-200 p-12 text-center text-secondary-500">
          <IconeAnimee icone={lottiePlus} taille={72} className="mx-auto mb-5" />
          لا توجد أنواع قضايا بعد
        </div>
      ) : (
        <div className="space-y-4">
          {types.map((type) => (
            <div key={type.id} className="bg-white rounded-xl border border-secondary-200 overflow-hidden">
              <div className="flex flex-wrap items-center justify-between gap-3 p-4 bg-secondary-50 border-b border-secondary-200">
                <div className="min-w-0">
                  <h3 className="font-semibold">{type.nameAr}</h3>
                  {type.description && <p className="text-xs text-secondary-400">{type.description}</p>}
                </div>
                <div className="flex flex-wrap items-center gap-3">
                  <span className="text-xs text-secondary-400">{type._count?.cases || 0} ملفات</span>
                  <span className={`text-xs px-2 py-0.5 rounded-full ${type.isActive ? "bg-green-100 text-green-700" : "bg-red-100 text-red-700"}`}>
                    {type.isActive ? "نشط" : "غير نشط"}
                  </span>
                  <button onClick={() => openEditType(type)} className="text-blue-500 hover:text-blue-700 text-sm">تعديل</button>
                  <button onClick={() => handleDeleteType(type.id)} className="text-red-500 hover:text-red-700 text-sm">حذف</button>
                </div>
              </div>

              {/* Documents obligatoires */}
              <div className="p-4">
                <div className="flex items-center justify-between mb-2">
                  <h4 className="text-sm font-medium text-secondary-600">المستندات المطلوبة</h4>
                  <button onClick={() => openAddDoc(type.id)} className="flex items-center gap-1.5 text-primary-500 hover:text-primary-600 text-xs"><IconeAnimee icone={lottiePlus} taille={21} animation="click" />إضافة مستند</button>
                </div>
                {type.documents.length === 0 ? (
                  <p className="text-xs text-secondary-400">لا توجد مستندات مطلوبة</p>
                ) : (
                  <div className="flex flex-wrap gap-2">
                    {type.documents.map((doc) => (
                      <div key={doc.id} className="flex items-center gap-1 px-2 py-1 bg-secondary-100 rounded text-xs">
                        <span>{doc.nameAr}</span>
                        <button onClick={() => openEditDoc(type.id, doc)} className="text-blue-500 hover:text-blue-700 mr-1">✎</button>
                        <button onClick={() => handleDeleteDoc(type.id, doc.id)} className="text-red-500 hover:text-red-700">×</button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Modal Type */}
      <Modal isOpen={showTypeModal} onClose={() => setShowTypeModal(false)} title={editType ? "تعديل نوع القضية" : "إضافة نوع قضية جديد"}>
        <form onSubmit={handleTypeSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-secondary-700 mb-1">الاسم (بالعربية) *</label>
            <input
              type="text"
              value={typeForm.nameAr}
              onChange={(e) => setTypeForm({ ...typeForm, nameAr: e.target.value })}
              required
              className="w-full px-4 py-2.5 border border-secondary-200 rounded-lg text-sm"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-secondary-700 mb-1">الوصف</label>
            <textarea
              value={typeForm.description}
              onChange={(e) => setTypeForm({ ...typeForm, description: e.target.value })}
              rows={2}
              className="w-full px-4 py-2.5 border border-secondary-200 rounded-lg text-sm"
            />
          </div>
          <button type="submit" className="w-full bg-primary-500 text-white py-2.5 rounded-lg font-medium hover:bg-primary-600 transition-colors">
            {editType ? "حفظ التعديلات" : "إضافة النوع"}
          </button>
        </form>
      </Modal>

      {/* Modal Document */}
      <Modal isOpen={showDocModal} onClose={() => setShowDocModal(false)} title={editDoc ? "تعديل المستند المطلوب" : "إضافة مستند مطلوب"}>
        <form onSubmit={handleDocSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-secondary-700 mb-1">الاسم (بالعربية) *</label>
            <input
              type="text"
              value={docForm.nameAr}
              onChange={(e) => setDocForm({ ...docForm, nameAr: e.target.value })}
              required
              className="w-full px-4 py-2.5 border border-secondary-200 rounded-lg text-sm"
            />
          </div>
          <label className="flex items-center gap-2">
            <input
              type="checkbox"
              checked={docForm.isRequired}
              onChange={(e) => setDocForm({ ...docForm, isRequired: e.target.checked })}
              className="w-4 h-4 text-primary-500"
            />
            <span className="text-sm">إلزامي</span>
          </label>
          <button type="submit" className="w-full bg-primary-500 text-white py-2.5 rounded-lg font-medium hover:bg-primary-600 transition-colors">
            {editDoc ? "حفظ التعديلات" : "إضافة المستند"}
          </button>
        </form>
      </Modal>
    </div>
  );
}
