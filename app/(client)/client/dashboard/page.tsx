// Dashboard client — consulter ses dossiers

"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { apiService } from "@/lib/api";
import { getStoredUser } from "@/lib/auth";
import { transitionStore } from "@/lib/transitionStore";
import Badge from "@/components/ui/Badge";
import IconeAnimee from "@/components/ui/IconeAnimee";
import { lottieClubhouse, lottieFolder } from "@/components/lottie";
import { formatDateShort, formatCaseStatus } from "@/lib/utils";

export default function ClientDashboardPage() {
  const [cases, setCases] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const user = getStoredUser();

  useEffect(() => {
    loadCases();
  }, []);

  async function loadCases() {
    setLoading(true);
    const result = await apiService.get<any>("/dossiers?limit=50");
    if (result.success && result.data) {
      setCases(result.data.cases);
    }
    setLoading(false);
    // Les données du dashboard client sont prêtes : la transition de login
    // (overlay Lottie) peut être retirée si elle est encore affichée.
    transitionStore.finish();
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
      <div className="flex items-center gap-3 mb-2">
        <div className="w-12 h-12 rounded-full bg-[#EAF2FF] flex items-center justify-center shrink-0">
          <IconeAnimee icone={lottieClubhouse} taille={45} />
        </div>
        <h1 className="text-2xl font-bold text-primary-500">
          مرحباً، {user?.prenom} {user?.nom}
        </h1>
      </div>
      <p className="text-secondary-400 mb-8">
        يمكنك متابعة ملفاتك وجلساتك هنا
      </p>

      <h2 className="flex items-center gap-2 text-lg font-semibold text-primary-500 mb-4">
        <IconeAnimee icone={lottieFolder} taille={33} /> ملفاتي
      </h2>

      {cases.length === 0 ? (
        <div className="bg-white rounded-xl border border-secondary-200 p-12 text-center">
          <p className="text-secondary-500">لا توجد ملفات مسجلة باسمك حالياً</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-4">
          {cases.map((cas: any) => (
            <Link
              key={cas.id}
              href={`/client/cases/${cas.id}`}
              className="bg-white rounded-xl border border-secondary-200 p-5 hover:shadow-md transition-shadow"
            >
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium text-primary-500">{cas.reference}</p>
                  <p className="text-sm text-secondary-400">{cas.type}</p>
                </div>
                <div className="text-left">
                  <Badge text={formatCaseStatus(cas.etat)} />
                  <div className="mt-2">
                    <div className="bg-secondary-200 rounded-full h-2 w-32">
                      <div
                        className="bg-primary-500 h-2 rounded-full"
                        style={{ width: `${cas.progress}%` }}
                      />
                    </div>
                    <p className="text-xs text-secondary-400 mt-1">{cas.progress}%</p>
                  </div>
                </div>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
