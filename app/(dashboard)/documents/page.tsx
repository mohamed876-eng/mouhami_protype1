"use client";

import Link from "next/link";
import { useCallback, useEffect, useState } from "react";
import { Pencil, Plus, Trash2 } from "lucide-react";
import { apiService } from "@/lib/api";
import { useCaseTypes } from "@/hooks/useCaseTypes";
import { CaseType, CaseTypeDocument, Document } from "@/types";
import Badge from "@/components/ui/Badge";
import IconeAnimee from "@/components/ui/IconeAnimee";
import Modal from "@/components/ui/Modal";
import { lottieDocument } from "@/components/lottie";
import { formatDateShort, formatDocStatus } from "@/lib/utils";

type RecentDocument = Document & {
  caseRef: string;
  caseId: string;
};

const EMPTY_DOCUMENT_FORM = {
  nameAr: "",
  description: "",
  isRequired: true,
  order: 1,
};

export default function DocumentsPage() {
  const {
    types,
    loading: typesLoading,
    error: typesError,
    fetchTypes,
    addDocument,
    updateDocument,
    deleteDocument,
  } = useCaseTypes();
  const [recentDocuments, setRecentDocuments] = useState<RecentDocument[]>([]);
  const [recentLoading, setRecentLoading] = useState(true);
  const [showDocModal, setShowDocModal] = useState(false);
  const [selectedTypeId, setSelectedTypeId] = useState("");
  const [editDoc, setEditDoc] = useState<CaseTypeDocument | null>(null);
  const [docForm, setDocForm] = useState(EMPTY_DOCUMENT_FORM);
  const [saving, setSaving] = useState(false);
  const [deletingDocId, setDeletingDocId] = useState<string | null>(null);
  const [mutationError, setMutationError] = useState<string | null>(null);

  const loadRecentDocuments = useCallback(async () => {
    setRecentLoading(true);
    const result = await apiService.get<{
      cases: Array<{ id: string; reference: string; _count?: { documents: number } }>;
    }>("/dossiers?limit=20");
    if (result.success && result.data) {
      const casesWithDocs = result.data.cases.filter(
        (cas) => (cas._count?.documents || 0) > 0
      );
      const docResults = await Promise.all(
        casesWithDocs.map((cas) =>
          apiService
            .get<{ documents: Document[] }>(`/dossiers/${cas.id}/documents`)
            .then((docRes) => ({ cas, docRes }))
        )
      );
      const allDocs: RecentDocument[] = [];
      for (const { cas, docRes } of docResults) {
        if (docRes.success && docRes.data) {
          docRes.data.documents.forEach((document) => {
            allDocs.push({ ...document, caseRef: cas.reference, caseId: cas.id });
          });
        }
      }
      allDocs.sort(
        (a, b) =>
          new Date(b.uploadedAt).getTime() - new Date(a.uploadedAt).getTime()
      );
      setRecentDocuments(allDocs.slice(0, 50));
    }
    setRecentLoading(false);
  }, []);

  useEffect(() => {
    fetchTypes(false);
    loadRecentDocuments();
  }, [fetchTypes, loadRecentDocuments]);

  function openAddDocument(type: CaseType) {
    setMutationError(null);
    const documents = type.documents || [];
    const nextOrder = documents.length
      ? Math.max(...documents.map((document) => document.order || 0)) + 1
      : 1;
    setSelectedTypeId(type.id);
    setEditDoc(null);
    setDocForm({ ...EMPTY_DOCUMENT_FORM, order: nextOrder });
    setShowDocModal(true);
  }

  function openEditDocument(type: CaseType, document: CaseTypeDocument) {
    setMutationError(null);
    setSelectedTypeId(type.id);
    setEditDoc(document);
    setDocForm({
      nameAr: document.nameAr,
      description: document.description || "",
      isRequired: document.isRequired,
      order: document.order,
    });
    setShowDocModal(true);
  }

  async function handleDocumentSubmit(event: React.FormEvent) {
    event.preventDefault();
    setMutationError(null);
    setSaving(true);
    try {
      const result = editDoc
        ? await updateDocument(selectedTypeId, editDoc.id, docForm)
        : await addDocument(selectedTypeId, docForm);
      if (result.success) {
        setShowDocModal(false);
        setEditDoc(null);
        setSelectedTypeId("");
        await fetchTypes(false);
      } else {
        setMutationError(result.message || "تعذر حفظ المستند");
      }
    } catch {
      setMutationError("تعذر حفظ المستند");
    } finally {
      setSaving(false);
    }
  }

  async function handleDeleteDocument(type: CaseType, document: CaseTypeDocument) {
    if (!confirm(`هل أنت متأكد من حذف المستند «${document.nameAr}»؟`)) {
      return;
    }
    setMutationError(null);
    setDeletingDocId(document.id);
    try {
      const result = await deleteDocument(type.id, document.id);
      if (result.success) {
        await fetchTypes(false);
      } else {
        setMutationError(result.message || "تعذر حذف المستند");
      }
    } catch {
      setMutationError("تعذر حذف المستند");
    } finally {
      setDeletingDocId(null);
    }
  }

  const selectedType = types.find((type) => type.id === selectedTypeId);

  return (
    <div>
      <div className="flex flex-wrap items-center justify-between gap-4 mb-6">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-xl bg-[#EAF2FF] flex items-center justify-center shrink-0">
            <IconeAnimee icone={lottieDocument} taille={42} title="المستندات" />
          </div>
          <div>
            <h1 className="text-xl sm:text-2xl font-bold text-primary-500">المستندات</h1>
            <p className="text-sm text-secondary-500 mt-1">
              حدد المستندات المرتبطة بكل نوع من أنواع القضايا
            </p>
            <p className="text-xs text-secondary-400 mt-1">
              تُضاف المستندات تلقائيًا إلى قائمة مستندات الملف عند إنشاء ملف من هذا النوع
            </p>
          </div>
        </div>
        <div className="flex flex-wrap gap-2">
          <Link
            href="/case-types"
            className="border border-primary-500 text-primary-500 px-4 py-2 rounded-lg text-sm hover:bg-primary-50 transition-colors"
          >
            أنواع القضايا
          </Link>
          <Link
            href="/documents/types"
            className="border border-secondary-200 text-secondary-600 px-4 py-2 rounded-lg text-sm hover:bg-secondary-50 transition-colors"
          >
            أنواع المستندات
          </Link>
        </div>
      </div>

      {(typesError || mutationError) && (
        <div
          role="alert"
          className="mb-4 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700"
        >
          {typesError || mutationError}
        </div>
      )}

      {typesLoading ? (
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin w-8 h-8 border-4 border-primary-500 border-t-transparent rounded-full" />
        </div>
      ) : types.length === 0 ? (
        <div className="rounded-xl border border-secondary-200 bg-white p-12 text-center text-secondary-500">
          <IconeAnimee icone={lottieDocument} taille={72} className="mx-auto mb-5" />
          <p>لا توجد أنواع قضايا بعد</p>
          <Link
            href="/case-types"
            className="mt-4 inline-flex items-center gap-2 text-primary-500 hover:text-primary-600"
          >
            <Plus size={16} />
            إضافة نوع قضية
          </Link>
        </div>
      ) : (
        <div className="space-y-5">
          {types.map((type) => {
            const documents = type.documents || [];
            return (
              <section
                key={type.id}
                className="rounded-xl border border-secondary-200 bg-white overflow-hidden"
              >
                <div className="flex flex-wrap items-center justify-between gap-3 border-b border-secondary-200 bg-secondary-50 px-4 py-3">
                  <div className="min-w-0">
                    <div className="flex flex-wrap items-center gap-2">
                      <h2 className="font-semibold text-primary-500">{type.nameAr}</h2>
                      <span
                        className={`rounded-full px-2 py-0.5 text-xs ${
                          type.isActive
                            ? "bg-green-100 text-green-700"
                            : "bg-red-100 text-red-700"
                        }`}
                      >
                        {type.isActive ? "نشط" : "غير نشط"}
                      </span>
                    </div>
                    {type.description && (
                      <p className="text-xs text-secondary-500 mt-1">{type.description}</p>
                    )}
                    <p className="text-xs text-secondary-400 mt-1">
                      {documents.length} مستند مرتبط بهذا النوع
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={() => openAddDocument(type)}
                    className="inline-flex items-center gap-1.5 rounded-lg bg-primary-500 px-3 py-2 text-xs font-medium text-white hover:bg-primary-600 transition-colors"
                    title={`إضافة مستند إلى ${type.nameAr}`}
                    aria-label={`إضافة مستند إلى ${type.nameAr}`}
                  >
                    <Plus size={16} />
                    إضافة مستند
                  </button>
                </div>

                {documents.length === 0 ? (
                  <p className="px-4 py-5 text-center text-sm text-secondary-400">
                    لا توجد مستندات لهذا النوع
                  </p>
                ) : (
                  <div className="overflow-x-auto">
                    <table className="w-full min-w-[620px] text-right">
                      <thead>
                        <tr className="border-b border-secondary-200 bg-secondary-50 text-secondary-500">
                          <th className="px-4 py-3 text-xs font-medium">الترتيب</th>
                          <th className="px-4 py-3 text-xs font-medium">المستند</th>
                          <th className="px-4 py-3 text-xs font-medium">الوصف</th>
                          <th className="px-4 py-3 text-xs font-medium">الحالة</th>
                          <th className="px-4 py-3 text-xs font-medium">الإجراءات</th>
                        </tr>
                      </thead>
                      <tbody>
                        {documents.map((document) => (
                          <tr
                            key={document.id}
                            className="border-b border-secondary-100 last:border-0 hover:bg-secondary-50"
                          >
                            <td className="px-4 py-3 text-sm text-secondary-500">
                              {document.order}
                            </td>
                            <td className="px-4 py-3 text-sm font-medium">
                              {document.nameAr}
                            </td>
                            <td className="px-4 py-3 text-sm text-secondary-500">
                              {document.description || "—"}
                            </td>
                            <td className="px-4 py-3 text-xs text-secondary-600">
                              {document.isRequired ? "إلزامي" : "اختياري"}
                            </td>
                            <td className="px-4 py-3">
                              <div className="flex items-center gap-2">
                                <button
                                  type="button"
                                  onClick={() => openEditDocument(type, document)}
                                  className="rounded-md p-2 text-blue-600 hover:bg-blue-50"
                                  title="تعديل"
                                  aria-label={`تعديل ${document.nameAr}`}
                                >
                                  <Pencil size={16} />
                                </button>
                                <button
                                  type="button"
                                  onClick={() => handleDeleteDocument(type, document)}
                                  disabled={deletingDocId === document.id}
                                  className="rounded-md p-2 text-red-600 hover:bg-red-50 disabled:opacity-50"
                                  title="حذف"
                                  aria-label={`حذف ${document.nameAr}`}
                                >
                                  <Trash2 size={16} />
                                </button>
                              </div>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </section>
            );
          })}
        </div>
      )}

      <section className="mt-8 rounded-xl border border-secondary-200 bg-white overflow-hidden">
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-secondary-200 px-4 py-3">
          <div>
            <h2 className="font-semibold text-primary-500">آخر المستندات المرفوعة</h2>
            <p className="text-xs text-secondary-500 mt-1">
              الملفات التي تم رفعها داخل الملفات
            </p>
          </div>
          <span className="text-xs text-secondary-400">{recentDocuments.length} ملف</span>
        </div>
        {recentLoading ? (
          <div className="flex items-center justify-center h-32">
            <div className="animate-spin w-7 h-7 border-4 border-primary-500 border-t-transparent rounded-full" />
          </div>
        ) : recentDocuments.length === 0 ? (
          <p className="px-4 py-8 text-center text-sm text-secondary-400">
            لا توجد مستندات مرفوعة بعد
          </p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[720px] text-right">
              <thead>
                <tr className="border-b border-secondary-200 bg-secondary-50 text-secondary-500">
                  <th className="px-4 py-3 text-xs font-medium">الاسم</th>
                  <th className="px-4 py-3 text-xs font-medium">الملف</th>
                  <th className="px-4 py-3 text-xs font-medium">الملف المرجع</th>
                  <th className="px-4 py-3 text-xs font-medium">الحالة</th>
                  <th className="px-4 py-3 text-xs font-medium">التاريخ</th>
                  <th className="px-4 py-3 text-xs font-medium">الإجراءات</th>
                </tr>
              </thead>
              <tbody>
                {recentDocuments.map((document) => (
                  <tr
                    key={document.id}
                    className="border-b border-secondary-100 last:border-0 hover:bg-secondary-50"
                  >
                    <td className="px-4 py-3 text-sm font-medium">{document.nom}</td>
                    <td className="px-4 py-3 text-sm text-secondary-400">
                      {document.fileName}
                    </td>
                    <td className="px-4 py-3 text-sm">
                      <Link
                        href={`/cases/${document.caseId}`}
                        className="text-primary-500 hover:text-primary-600"
                      >
                        {document.caseRef}
                      </Link>
                    </td>
                    <td className="px-4 py-3 text-sm">
                      <Badge text={formatDocStatus(document.etat)} />
                    </td>
                    <td className="px-4 py-3 text-sm text-secondary-400">
                      {formatDateShort(document.uploadedAt)}
                    </td>
                    <td className="px-4 py-3 text-sm">
                      <a
                        href={`/api/documents/${document.id}/download`}
                        className="text-primary-500 hover:text-primary-600"
                      >
                        تحميل
                      </a>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>

      <Modal
        isOpen={showDocModal}
        onClose={() => setShowDocModal(false)}
        title={editDoc ? "تعديل مستند النوع" : "إضافة مستند للنوع"}
      >
        <form onSubmit={handleDocumentSubmit} className="space-y-4">
          {selectedType && (
            <div className="rounded-lg bg-secondary-50 p-3">
              <span className="text-xs text-secondary-500">نوع القضية</span>
              <p className="mt-1 text-sm font-medium">{selectedType.nameAr}</p>
            </div>
          )}
          <div>
            <label
              htmlFor="document-name"
              className="block text-sm font-medium text-secondary-700 mb-1"
            >
              اسم المستند *
            </label>
            <input
              id="document-name"
              type="text"
              value={docForm.nameAr}
              onChange={(event) =>
                setDocForm({ ...docForm, nameAr: event.target.value })
              }
              required
              className="w-full rounded-lg border border-secondary-200 px-4 py-2.5 text-sm"
            />
          </div>
          <div>
            <label
              htmlFor="document-description"
              className="block text-sm font-medium text-secondary-700 mb-1"
            >
              الوصف
            </label>
            <textarea
              id="document-description"
              value={docForm.description}
              onChange={(event) =>
                setDocForm({ ...docForm, description: event.target.value })
              }
              rows={2}
              className="w-full rounded-lg border border-secondary-200 px-4 py-2.5 text-sm"
            />
          </div>
          <div>
            <label
              htmlFor="document-order"
              className="block text-sm font-medium text-secondary-700 mb-1"
            >
              ترتيب العرض *
            </label>
            <input
              id="document-order"
              type="number"
              min={0}
              value={docForm.order}
              onChange={(event) =>
                setDocForm({ ...docForm, order: Number(event.target.value) })
              }
              required
              className="w-full rounded-lg border border-secondary-200 px-4 py-2.5 text-sm"
            />
          </div>
          <label className="flex items-center gap-2">
            <input
              type="checkbox"
              checked={docForm.isRequired}
              onChange={(event) =>
                setDocForm({ ...docForm, isRequired: event.target.checked })
              }
              className="h-4 w-4 text-primary-500"
            />
            <span className="text-sm">إلزامي</span>
          </label>
          <button
            type="submit"
            disabled={saving}
            className="w-full rounded-lg bg-primary-500 py-2.5 text-sm font-medium text-white hover:bg-primary-600 transition-colors disabled:opacity-50"
          >
            {saving ? "جاري الحفظ..." : editDoc ? "حفظ التعديلات" : "إضافة المستند"}
          </button>
        </form>
      </Modal>
    </div>
  );
}
