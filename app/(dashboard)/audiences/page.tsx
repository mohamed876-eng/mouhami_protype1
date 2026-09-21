// Page de calendrier des audiences

"use client";

import { useEffect, useState } from "react";
import { apiService } from "@/lib/api";
import { formatDateShort } from "@/lib/utils";
import Badge from "@/components/ui/Badge";
import Link from "next/link";

export default function AudiencesPage() {
  const [hearings, setHearings] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadHearings();
  }, []);

  async function loadHearings() {
    setLoading(true);
    const result = await apiService.get<any>("/audiences");
    if (result.success && result.data) {
      setHearings(result.data.hearings);
    }
    setLoading(false);
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin w-8 h-8 border-4 border-primary-500 border-t-transparent rounded-full" />
      </div>
    );
  }

  return (
    <div>
      <h1 className="text-2xl font-bold text-primary-500 mb-6">الجلسات</h1>

      {hearings.length === 0 ? (
        <div className="bg-white rounded-xl border border-secondary-200 p-12 text-center text-secondary-500">
          لا توجد جلسات مسجلة
        </div>
      ) : (
        <div className="space-y-3">
          {hearings.map((hearing) => (
            <div
              key={hearing.id}
              className="bg-white rounded-xl border border-secondary-200 p-4 flex flex-wrap items-center justify-between gap-3"
            >
              <div className="min-w-0">
                <p className="text-sm font-medium truncate">
                  {hearing.caseRef} — {hearing.client?.prenom} {hearing.client?.nom}
                </p>
                  <p className="text-xs text-secondary-400 truncate">
                    {hearing.cas?.reference}{hearing.tribunal ? ` — ${hearing.tribunal}` : ""}{hearing.type ? ` | ${hearing.type}` : ""}
                  </p>
              </div>
              <div className="text-left">
                <p className="text-sm font-medium">{formatDateShort(hearing.date)}</p>
                {hearing.heure && <p className="text-xs text-secondary-400">{hearing.heure}</p>}
                <Badge text={hearing.statut === "planifiee" ? "مخطط" : hearing.statut === "tenue" ? "منعقدة" : hearing.statut === "reportee" ? "مؤجلة" : "ملغاة"} />
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
