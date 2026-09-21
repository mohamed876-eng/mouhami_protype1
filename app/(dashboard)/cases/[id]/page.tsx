"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { useCases } from "@/hooks/useCases";
import { apiService } from "@/lib/api";
import Badge from "@/components/ui/Badge";
import IconeAnimee from "@/components/ui/IconeAnimee";
import { lottiePlus } from "@/components/lottie";
import Modal from "@/components/ui/Modal";
import { formatDateShort, formatCaseStatus, formatDocStatus } from "@/lib/utils";

export default function CaseDetailPage() {
  const { id } = useParams();
  const router = useRouter();
  const { caseData, loading, fetchCase, toggleChecklist, exportPDF } = useCases();
  const [showDocModal, setShowDocModal] = useState(false);
  const [showHearingModal, setShowHearingModal] = useState(false);
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [selectedChecklistItem, setSelectedChecklistItem] = useState("");

  useEffect(() => {
    if (id) fetchCase(id as string);
  }, [id, fetchCase]);

  const handleToggleChecklist = async (itemId: string, coche: boolean) => {
    if (id) {
      await toggleChecklist(id as string, itemId, coche);
      fetchCase(id as string);
    }
  };

  const handleFileUpload = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!id) return;

    const form = e.target as HTMLFormElement;
    const formData = new FormData(form);
    if (selectedChecklistItem) {
      formData.set("checklistItemId", selectedChecklistItem);
    }
    setUploading(true);

    try {
      const res = await fetch(`/api/dossiers/${id}/documents`, {
        method: "POST",
        credentials: "same-origin",
        body: formData,
      });
      const data = await res.json();
      if (data.success) {
        setShowDocModal(false);
        setSelectedChecklistItem("");
        fetchCase(id as string);
      }
    } catch (err) {
      console.error(err);
    }
    setUploading(false);
  };

  const handleAddHearing = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!id) return;
    const form = e.target as HTMLFormElement;
    const data = Object.fromEntries(new FormData(form));
    const result = await apiService.post(`/dossiers/${id}/audiences`, data);
    if (result.success) {
      setShowHearingModal(false);
      fetchCase(id as string);
    }
  };

  const handleExportPDF = async () => {
    if (id) {
      await exportPDF(id as string);
    }
  };

  const openDocModalWithItem = (itemId: string) => {
    setSelectedChecklistItem(itemId);
    setShowDocModal(true);
  };

  if (loading || !caseData) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin w-8 h-8 border-4 border-primary-500 border-t-transparent rounded-full" />
      </div>
    );
  }

  const apiBase = "/api";

  return (
    <div>
      {/* En-tête */}
      <div className="flex flex-wrap items-center justify-between gap-4 mb-8">
        <div className="min-w-0">
          <h1 className="text-2xl sm:text-3xl text-primary-500 break-words">
            الملف : {caseData.reference}
          </h1>
          <p className="text-base sm:text-lg text-secondary-400 mt-1 break-words">
            {caseData.type}{caseData.sousType ? ` - ${caseData.sousType}` : ""}
            {caseData.client ? ` | ${caseData.client.prenom} ${caseData.client.nom}` : ""}
          </p>
        </div>
        <div className="flex flex-wrap gap-3 shrink-0">
          <button onClick={handleExportPDF} className="bg-primary-500 text-white px-5 py-3 rounded-xl hover:bg-primary-600 transition-colors">
            تصدير PDF
          </button>
          <Link href={`/cases/${id}/edit`} className="border border-primary-500 text-primary-500 px-5 py-3 rounded-xl hover:bg-primary-50 transition-colors">
            تعديل
          </Link>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Colonne gauche : Infos */}
        <div className="space-y-6">
          {/* Informations */}
          <div className="bg-white rounded-xl border border-secondary-200 p-5">
            <h3 className="text-lg text-primary-500 mb-4">معلومات الملف</h3>
            <div className="space-y-3 text-sm">
              <div className="flex justify-between">
                <span className="text-secondary-400">المرجع</span>
                <span className="font-medium">{caseData.reference}</span>
              </div>
              {caseData.mahakimRef && (
                <div className="flex justify-between">
                  <span className="text-secondary-400">مرجع محكيم</span>
                  <span>{caseData.mahakimRef}</span>
                </div>
              )}
              <div className="flex justify-between">
                <span className="text-secondary-400">النوع</span>
                <Badge text={caseData.type} />
              </div>
              <div className="flex justify-between">
                <span className="text-secondary-400">المحكمة</span>
                <span>{caseData.tribunal || "—"}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-secondary-400">الحالة</span>
                <Badge text={formatCaseStatus(caseData.etat)} />
              </div>
              <div className="flex justify-between">
                <span className="text-secondary-400">تاريخ الإنشاء</span>
                <span>{formatDateShort(caseData.dateCreation)}</span>
              </div>
            </div>
          </div>

          {/* Progression */}
          <div className="bg-white rounded-xl border border-secondary-200 p-5">
            <h3 className="text-lg text-primary-500 mb-4">التقدم</h3>
            <div className="flex items-center gap-3 mb-2">
              <div className="flex-1 bg-secondary-200 rounded-full h-4">
                <div
                  className="bg-primary-500 h-4 rounded-full transition-all"
                  style={{ width: `${caseData.progress}%` }}
                />
              </div>
              <span className="text-lg font-bold text-primary-500">{caseData.progress}%</span>
            </div>
            <p className="text-xs text-secondary-400">
              {caseData.checklist.filter((i) => i.coche).length}/{caseData.checklist.filter((i) => i.obligatoire).length} مستندات مكتملة
            </p>
          </div>
        </div>

        {/* Colonne droite : Contenu détaillé */}
        <div className="lg:col-span-2 space-y-6">
          {/* Description */}
          {caseData.description && (
            <div className="bg-white rounded-xl border border-secondary-200 p-5">
              <h3 className="text-lg text-primary-500 mb-2">الوصف</h3>
              <p className="text-sm text-secondary-600">{caseData.description}</p>
            </div>
          )}

          {/* Checklist */}
          {caseData.checklist.length > 0 && (
            <div className="bg-white rounded-xl border border-secondary-200 p-5">
              <h3 className="text-lg text-primary-500 mb-4">قائمة المستندات المطلوبة</h3>
              <div className="space-y-2">
                {caseData.checklist.map((item) => {
                  const linkedDoc = caseData.documents.find(d => d.checklistItemId === item.id);
                  return (
                    <div key={item.id} className="flex items-center gap-3 p-2 rounded-lg bg-secondary-50">
                      <input
                        type="checkbox"
                        checked={item.coche}
                        onChange={(e) => handleToggleChecklist(item.id, e.target.checked)}
                        className="w-5 h-5 text-primary-500 rounded border-secondary-300 focus:ring-primary-500"
                      />
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <span className={`text-sm ${item.coche ? "line-through text-secondary-400" : "font-medium"}`}>
                            {item.nom}
                          </span>
                          {!item.obligatoire && (
                            <span className="text-xs text-secondary-400">(اختياري)</span>
                          )}
                          {item.coche && <span className="text-xs text-green-500">☑</span>}
                        </div>
                        {linkedDoc ? (
                          <div className="flex items-center gap-2 mt-1 text-xs text-secondary-500">
                            <span>{linkedDoc.fileName}</span>
                            <a href={`${apiBase}/documents/${linkedDoc.id}/download`} className="text-primary-500 hover:text-primary-600" target="_blank">
                              فتح
                            </a>
                            <a href={`${apiBase}/documents/${linkedDoc.id}/download`} className="text-primary-500 hover:text-primary-600">
                              تحميل
                            </a>
                          </div>
                        ) : item.obligatoire && !item.coche ? (
                          <button
                            onClick={() => openDocModalWithItem(item.id)}
                            className="text-xs text-primary-500 hover:text-primary-600 mt-1"
                          >
                            + رفع المستند
                          </button>
                        ) : null}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* Documents */}
          <div className="bg-white rounded-xl border border-secondary-200 p-5">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg text-primary-500">المستندات المرفوعة</h3>
              <button
                onClick={() => { setSelectedChecklistItem(""); setShowDocModal(true); }}
                className="bg-primary-500 text-white px-3 py-1.5 rounded-lg text-xs hover:bg-primary-600 transition-colors"
              >
                <span className="inline-flex items-center gap-1.5"><IconeAnimee icone={lottiePlus} taille={18} animation="click" /> إضافة مستند</span>
              </button>
            </div>

            {caseData.documents.length === 0 ? (
              <p className="text-sm text-secondary-400 text-center py-4">لا توجد مستندات مرفوعة</p>
            ) : (
              <div className="space-y-2">
                {caseData.documents.map((doc) => (
                  <div key={doc.id} className="flex flex-wrap items-center justify-between gap-2 p-3 bg-secondary-50 rounded-lg">
                    <div className="min-w-0">
                      <p className="text-sm font-medium break-words">{doc.nom}</p>
                      <p className="text-xs text-secondary-400 break-words">{doc.fileName} — {formatDateShort(doc.uploadedAt)}</p>
                    </div>
                    <div className="flex items-center gap-3">
                      <Badge text={formatDocStatus(doc.etat)} />
                      <a
                        href={`${apiBase}/documents/${doc.id}/download`}
                        className="text-primary-500 hover:text-primary-600 text-sm"
                        target="_blank"
                      >
                        فتح
                      </a>
                      <a
                        href={`${apiBase}/documents/${doc.id}/download`}
                        className="text-primary-500 hover:text-primary-600 text-sm"
                      >
                        تحميل
                      </a>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Audiences */}
          <div className="bg-white rounded-xl border border-secondary-200 p-5">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg text-primary-500">الجلسات</h3>
              <button
                onClick={() => setShowHearingModal(true)}
                className="bg-primary-500 text-white px-3 py-1.5 rounded-lg text-xs hover:bg-primary-600 transition-colors"
              >
                <span className="inline-flex items-center gap-1.5"><IconeAnimee icone={lottiePlus} taille={18} animation="click" /> إضافة جلسة</span>
              </button>
            </div>

            {caseData.hearings.length === 0 ? (
              <p className="text-sm text-secondary-400 text-center py-4">لا توجد جلسات</p>
            ) : (
              <div className="space-y-2">
                {caseData.hearings.map((hearing) => (
                  <div key={hearing.id} className="flex flex-wrap items-center justify-between gap-2 p-3 bg-secondary-50 rounded-lg">
                    <div className="min-w-0">
                      <p className="text-sm font-medium">{formatDateShort(hearing.date)}{hearing.heure ? ` — ${hearing.heure}` : ""}</p>
                      <p className="text-xs text-secondary-400 break-words">{hearing.tribunal}{hearing.type ? ` | ${hearing.type}` : ""}</p>
                    </div>
                    <Badge text={hearing.statut === "planifiee" ? "مخطط" : hearing.statut === "tenue" ? "منعقدة" : hearing.statut === "reportee" ? "مؤجلة" : "ملغاة"} />
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Notes */}
          {caseData.notes && (
            <div className="bg-white rounded-xl border border-secondary-200 p-5">
              <h3 className="text-lg text-primary-500 mb-2">ملاحظات</h3>
              <p className="text-sm text-secondary-600 whitespace-pre-wrap">{caseData.notes}</p>
            </div>
          )}

          {/* Historique */}
          {caseData.activities && caseData.activities.length > 0 && (
            <div className="bg-white rounded-xl border border-secondary-200 p-5">
              <h3 className="text-lg text-primary-500 mb-4">سجل النشاطات</h3>
              <div className="space-y-2">
                {caseData.activities.map((activity) => (
                  <div key={activity.id} className="flex items-center justify-between text-sm p-2 border-b border-secondary-100 last:border-0">
                    <span>{activity.description}</span>
                    <span className="text-xs text-secondary-400">
                      {activity.user?.prenom} {activity.user?.nom} — {formatDateShort(activity.createdAt)}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Modal Upload Document */}
      <Modal isOpen={showDocModal} onClose={() => setShowDocModal(false)} title="رفع مستند">
        <form onSubmit={handleFileUpload} className="space-y-4">
          {caseData.checklist.length > 0 && (
            <div>
              <label className="block text-sm font-medium text-secondary-700 mb-1">المستند المطلوب</label>
              <select
                value={selectedChecklistItem}
                onChange={(e) => setSelectedChecklistItem(e.target.value)}
                className="w-full px-4 py-2.5 border border-secondary-200 rounded-lg text-sm"
              >
                <option value="">— اختر من القائمة —</option>
                {caseData.checklist.filter(i => !i.coche).map((item) => (
                  <option key={item.id} value={item.id}>{item.nom}</option>
                ))}
              </select>
            </div>
          )}
          <div>
            <label className="block text-sm font-medium text-secondary-700 mb-1">اسم المستند</label>
            <input type="text" name="nom" required className="w-full px-4 py-2.5 border border-secondary-200 rounded-lg text-sm" />
          </div>
          <div>
            <label className="block text-sm font-medium text-secondary-700 mb-1">الملف (PDF)</label>
            <input type="file" name="file" accept=".pdf,image/*" required className="w-full px-4 py-2.5 border border-secondary-200 rounded-lg text-sm" />
          </div>
          <div>
            <label className="block text-sm font-medium text-secondary-700 mb-1">الوصف</label>
            <textarea name="description" rows={2} className="w-full px-4 py-2.5 border border-secondary-200 rounded-lg text-sm" />
          </div>
          <label className="flex items-center gap-2">
            <input type="checkbox" name="isClientVisible" value="true" defaultChecked className="w-4 h-4 text-primary-500" />
            <span className="text-sm">مرئي للعميل</span>
          </label>
          <button type="submit" disabled={uploading} className="w-full bg-primary-500 text-white py-2.5 rounded-lg font-medium hover:bg-primary-600 transition-colors disabled:opacity-50">
            {uploading ? "جاري الرفع..." : "رفع المستند"}
          </button>
        </form>
      </Modal>

      {/* Modal Ajout Audience */}
      <Modal isOpen={showHearingModal} onClose={() => setShowHearingModal(false)} title="إضافة جلسة">
        <form onSubmit={handleAddHearing} className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-secondary-700 mb-1">التاريخ *</label>
              <input type="date" name="date" required className="w-full px-4 py-2.5 border border-secondary-200 rounded-lg text-sm" />
            </div>
            <div>
              <label className="block text-sm font-medium text-secondary-700 mb-1">الساعة</label>
              <input type="time" name="heure" className="w-full px-4 py-2.5 border border-secondary-200 rounded-lg text-sm" />
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-secondary-700 mb-1">المحكمة</label>
            <input type="text" name="tribunal" className="w-full px-4 py-2.5 border border-secondary-200 rounded-lg text-sm" />
          </div>
          <div>
            <label className="block text-sm font-medium text-secondary-700 mb-1">النوع</label>
            <input type="text" name="type" className="w-full px-4 py-2.5 border border-secondary-200 rounded-lg text-sm" placeholder="جلسة تمهيدية، جلسة موضوع، ..." />
          </div>
          <div>
            <label className="block text-sm font-medium text-secondary-700 mb-1">ملاحظات</label>
            <textarea name="notes" rows={2} className="w-full px-4 py-2.5 border border-secondary-200 rounded-lg text-sm" />
          </div>
          <button type="submit" className="w-full bg-primary-500 text-white py-2.5 rounded-lg font-medium hover:bg-primary-600 transition-colors">
            إضافة الجلسة
          </button>
        </form>
      </Modal>
    </div>
  );
}
