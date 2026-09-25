// Page de détail d'un dossier côté client
// Consultation uniquement, pas de modification

"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { apiService } from "@/lib/api";
import Badge from "@/components/ui/Badge";
import { formatDateShort, formatCaseStatus, formatDocStatus } from "@/lib/utils";

export default function ClientCaseDetailPage() {
  const { id } = useParams();
  const [caseData, setCaseData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (id) loadCase(id as string);
  }, [id]);

  async function loadCase(caseId: string) {
    setLoading(true);
    const result = await apiService.get<any>(`/dossiers/${caseId}`);
    if (result.success && result.data) {
      setCaseData(result.data.case);
    }
    setLoading(false);
  }

  if (loading || !caseData) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin w-8 h-8 border-4 border-primary-500 border-t-transparent rounded-full" />
      </div>
    );
  }

  const visibleDocs = caseData.documents?.filter((d: any) => d.isClientVisible) || [];

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-primary-500">
          {caseData.reference}
        </h1>
        <p className="text-secondary-400">{caseData.type}</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Informations */}
        <div className="bg-white rounded-xl border border-secondary-200 p-5">
          <h3 className="font-semibold text-primary-500 mb-4">معلومات الملف</h3>
          <div className="space-y-3 text-sm">
            <div className="flex justify-between">
              <span className="text-secondary-400">المرجع</span>
              <span>{caseData.reference}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-secondary-400">النوع</span>
              <span>{caseData.type}</span>
            </div>
             <div className="flex justify-between">
               <span className="text-secondary-400">المحكمة</span>
               <span>{caseData.tribunal || "—"}</span>
             </div>
             {caseData.region && (
               <div className="flex justify-between gap-4">
                 <span className="text-secondary-400">الجهة القضائية</span>
                 <span className="text-left">{caseData.region}</span>
               </div>
             )}
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
          <h3 className="font-semibold text-primary-500 mb-4">التقدم</h3>
          <div className="flex items-center gap-3 mb-2">
            <div className="flex-1 bg-secondary-200 rounded-full h-4">
              <div
                className="bg-primary-500 h-4 rounded-full"
                style={{ width: `${caseData.progress}%` }}
              />
            </div>
            <span className="text-lg font-bold text-primary-500">{caseData.progress}%</span>
          </div>
        </div>

        {/* Audiences */}
        <div className="bg-white rounded-xl border border-secondary-200 p-5">
          <h3 className="font-semibold text-primary-500 mb-4">الجلسات</h3>
          {caseData.hearings?.length === 0 ? (
            <p className="text-sm text-secondary-400">لا توجد جلسات</p>
          ) : (
            <div className="space-y-2">
              {caseData.hearings?.map((hearing: any) => (
                <div key={hearing.id} className="flex flex-wrap items-center justify-between gap-2 p-2 bg-secondary-50 rounded-lg">
                  <div>
                    <p className="text-sm font-medium">{formatDateShort(hearing.date)}{hearing.heure ? ` — ${hearing.heure}` : ""}</p>
                    <p className="text-xs text-secondary-400">{hearing.tribunal || ""}</p>
                  </div>
                  <Badge text={hearing.statut === "planifiee" ? "مخطط" : hearing.statut === "tenue" ? "منعقدة" : "—"} />
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Documents visibles */}
        <div className="bg-white rounded-xl border border-secondary-200 p-5">
          <h3 className="font-semibold text-primary-500 mb-4">المستندات</h3>
          {visibleDocs.length === 0 ? (
            <p className="text-sm text-secondary-400">لا توجد مستندات متاحة</p>
          ) : (
            <div className="space-y-2">
              {visibleDocs.map((doc: any) => (
                <div key={doc.id} className="flex flex-wrap items-center justify-between gap-2 p-2 bg-secondary-50 rounded-lg">
                  <div>
                    <p className="text-sm font-medium">{doc.nom}</p>
                    <p className="text-xs text-secondary-400 break-words">{doc.fileName}</p>
                  </div>
                  <a
                    href={`/api/documents/${doc.id}/download`}
                    className="text-primary-500 hover:text-primary-600 text-sm"
                  >
                    تحميل
                  </a>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
