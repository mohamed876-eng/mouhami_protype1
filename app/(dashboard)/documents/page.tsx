// Page de gestion documentaire centralisée
// Affiche les documents récents et un lien vers la configuration des types

"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { apiService } from "@/lib/api";
import Badge from "@/components/ui/Badge";
import IconeAnimee from "@/components/ui/IconeAnimee";
import { lottieDocument } from "@/components/lottie";
import { formatDateShort, formatDocStatus } from "@/lib/utils";

export default function DocumentsPage() {
  const [documents, setDocuments] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadRecentDocuments();
  }, []);

  async function loadRecentDocuments() {
    setLoading(true);
    const result = await apiService.get<any>("/dossiers?limit=20");
    if (result.success && result.data) {
      const casesWithDocs = result.data.cases.filter((c: any) => c._count?.documents > 0);
      const docResults = await Promise.all(
        casesWithDocs.map((cas: any) =>
          apiService.get<any>(`/dossiers/${cas.id}/documents`).then((docRes) => ({
            cas,
            docRes,
          }))
        )
      );
      const allDocs: any[] = [];
      for (const { cas, docRes } of docResults) {
        if (docRes.success && docRes.data) {
          docRes.data.documents.forEach((d: any) => {
            allDocs.push({ ...d, caseRef: cas.reference, caseId: cas.id });
          });
        }
      }
      allDocs.sort((a, b) => new Date(b.uploadedAt).getTime() - new Date(a.uploadedAt).getTime());
      setDocuments(allDocs.slice(0, 50));
    }
    setLoading(false);
  }

  return (
    <div>
      <div className="flex flex-wrap items-center justify-between gap-3 mb-6">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-xl bg-[#EAF2FF] flex items-center justify-center shrink-0">
            <IconeAnimee icone={lottieDocument} taille={42} title="المستندات" />
          </div>
          <h1 className="text-xl sm:text-2xl font-bold text-primary-500">المستندات</h1>
        </div>
        <Link
          href="/documents/types"
          className="border border-primary-500 text-primary-500 px-4 py-2 rounded-lg text-sm hover:bg-primary-50 transition-colors"
        >
          أنواع المستندات
        </Link>
      </div>

      {loading ? (
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin w-8 h-8 border-4 border-primary-500 border-t-transparent rounded-full" />
        </div>
      ) : (
        <div className="bg-white rounded-xl border border-secondary-200 overflow-hidden">
          {documents.length === 0 ? (
            <div className="p-12 text-center text-secondary-500">
              <IconeAnimee icone={lottieDocument} taille={84} className="mx-auto mb-5" />
              <p>لا توجد مستندات مرفوعة بعد</p>
              <p className="text-sm mt-2">قم برفع المستندات من صفحة الملفات</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full min-w-[640px]">
              <thead>
                <tr className="border-b border-secondary-200 bg-secondary-50">
                  <th className="text-right px-4 py-3 text-sm font-medium text-secondary-600">الاسم</th>
                  <th className="text-right px-4 py-3 text-sm font-medium text-secondary-600">الملف</th>
                  <th className="text-right px-4 py-3 text-sm font-medium text-secondary-600">الملف المرجع</th>
                  <th className="text-right px-4 py-3 text-sm font-medium text-secondary-600">الحالة</th>
                  <th className="text-right px-4 py-3 text-sm font-medium text-secondary-600">التاريخ</th>
                  <th className="text-right px-4 py-3 text-sm font-medium text-secondary-600">الإجراءات</th>
                </tr>
              </thead>
              <tbody>
                {documents.map((doc) => (
                  <tr key={doc.id} className="border-b border-secondary-100 hover:bg-secondary-50">
                    <td className="px-4 py-3 text-sm font-medium">{doc.nom}</td>
                    <td className="px-4 py-3 text-sm text-secondary-400">{doc.fileName}</td>
                    <td className="px-4 py-3 text-sm">
                      <Link href={`/cases/${doc.caseId}`} className="text-primary-500 hover:text-primary-600">
                        {doc.caseRef}
                      </Link>
                    </td>
                    <td className="px-4 py-3 text-sm"><Badge text={formatDocStatus(doc.etat)} /></td>
                    <td className="px-4 py-3 text-sm text-secondary-400">{formatDateShort(doc.uploadedAt)}</td>
                    <td className="px-4 py-3 text-sm">
                      <a
                        href={`/api/documents/${doc.id}/download`}
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
        </div>
      )}
    </div>
  );
}
