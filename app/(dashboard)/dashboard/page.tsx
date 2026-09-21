"use client";

import { useState, useCallback } from "react";
import { X, ArrowLeft } from "lucide-react";
import { motion } from "framer-motion";
import { useDashboard } from "@/hooks/useDashboard";
import { useReminders } from "@/hooks/useReminders";
import { getStoredUser } from "@/lib/auth";
import { apiService } from "@/lib/api";
import { icones, tailles } from "@/components/lottie/icones";
import IconeAnimee from "@/components/ui/IconeAnimee";
import StatCircle from "@/components/ui/StatCircle";
import DataTable from "@/components/ui/DataTable";
import Badge from "@/components/ui/Badge";
import CountdownTimer from "@/components/reminders/CountdownTimer";
import NotificationPopup from "@/components/reminders/NotificationPopup";
import CreateReminderModal from "@/components/reminders/CreateReminderModal";
import { formatDateShort, formatCaseStatus } from "@/lib/utils";
import { SearchResult } from "@/types";
import Link from "next/link";

const container = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: { staggerChildren: 0.08 },
  },
};

const item = {
  hidden: { opacity: 0, y: 20 },
  show: { opacity: 1, y: 0, transition: { duration: 0.5 } },
};

// Raccourcis / services — chaque carte possède UNE icône correspondant à SA fonction.
const raccourcis = [
  {
    href: "/cases",
    label: "الملفات",
    description: "إدارة الملفات والقضايا",
    icone: icones.dossiers,
  },
  {
    href: "/clients",
    label: "العملاء",
    description: "العملاء وقضاياهم",
    icone: icones.clients,
  },
  {
    href: "/documents",
    label: "المستندات",
    description: "المستندات القانونية",
    icone: icones.documents,
  },
  {
    href: "/ai/legal-search",
    label: "المكتبة القانونية",
    description: "موارد ومراجع قانونية",
    icone: icones.bibliotheque,
  },
];

export default function DashboardPage() {
  const { data, loading, error } = useDashboard();
  const {
    nextEvent,
    todayEvents,
    pendingReminders,
    dismissReminder,
    createEvent,
    addTimerNotification,
  } = useReminders();
  const user = getStoredUser();
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState<SearchResult | null>(null);
  const [searchLoading, setSearchLoading] = useState(false);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [searchPerformed, setSearchPerformed] = useState(false);

  const handleSearch = useCallback(async (e: React.FormEvent) => {
    e.preventDefault();
    const q = searchQuery.trim();
    if (!q) return;
    setSearchLoading(true);
    setSearchPerformed(true);
    const res = await apiService.get<SearchResult>(`/recherche?q=${encodeURIComponent(q)}`);
    if (res.success && res.data) {
      setSearchResults(res.data);
    }
    setSearchLoading(false);
  }, [searchQuery]);

  const clearSearch = useCallback(() => {
    setSearchQuery("");
    setSearchResults(null);
    setSearchPerformed(false);
  }, []);

  if (loading || !data) {
    if (error) {
      return (
        <div className="flex items-center justify-center h-80">
          <div className="text-center">
            <p className="text-base text-red-500 font-semibold">{error}</p>
          </div>
        </div>
      );
    }
    return (
      <div className="flex items-center justify-center h-80">
        <div className="animate-spin w-12 h-12 border-2 border-[#0F3D91] border-t-transparent rounded-full" />
      </div>
    );
  }

  const caseColumns = [
    {
      key: "reference",
      label: "المرجع",
      render: (value: string, row: any) => (
        <Link
          href={`/cases/${row.id}`}
          className="text-[#0F3D91] hover:text-[#1E5BDB] font-bold transition-colors"
        >
          {value}
        </Link>
      ),
    },
    {
      key: "client",
      label: "العميل",
      render: (value: any) => (
        <span className="font-bold">{value.prenom} {value.nom}</span>
      ),
    },
    {
      key: "type",
      label: "النوع",
    },
    {
      key: "etat",
      label: "الحالة",
      render: (value: string) => <Badge text={formatCaseStatus(value)} />,
    },
    {
      key: "dateCreation",
      label: "التاريخ",
      render: (value: string) => (
        <span className="text-[#6B7280]">{formatDateShort(value)}</span>
      ),
    },
  ];

  const stats = [
    {
      title: "عدد العملاء",
      value: data.stats.clients,
      icone: icones.clients,
    },
    {
      title: "عدد الملفات",
      value: data.stats.cases,
      icone: icones.dossiers,
    },
    {
      title: "الجلسات المقبلة",
      value: data.stats.audiences,
      icone: icones.calendrier,
    },
    {
      title: "مستندات ناقصة",
      value: data.stats.documentsEnAttente,
      icone: icones.documents,
    },
  ];

  return (
    <motion.div
      variants={container}
      initial="hidden"
      animate="show"
      className="space-y-8 max-w-[1600px] mx-auto"
    >
      {/* ====== Hero / Accueil + Recherche ====== */}
      <motion.div variants={item}>
        <div className="bg-white rounded-card shadow-card p-5 sm:p-6 md:p-8 lg:p-10">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-5 md:gap-6">
            {/* Bloc de bienvenue */}
            <div className="flex items-center gap-4 sm:gap-5">
              <div className="w-16 h-16 sm:w-20 sm:h-20 lg:w-24 lg:h-24 rounded-2xl bg-[#EAF2FF] flex items-center justify-center shrink-0">
                <IconeAnimee icone={icones.justice} taille={tailles.hero} />
              </div>
              <div className="min-w-0">
                <h1 className="text-lg sm:text-xl lg:text-2xl font-bold text-[#0E2F6B] mb-1 truncate">
                  مرحباً، {user?.prenom} {user?.nom}
                </h1>
                <p className="text-sm sm:text-base text-[#6B7280] mt-0.5">نظرة عامة على نشاط المكتب</p>
              </div>
            </div>

            {/* Barre de recherche élargie */}
            <form onSubmit={handleSearch} className="relative w-full min-w-0 flex-1">
              <span className="absolute right-5 top-1/2 -translate-y-1/2 pointer-events-none">
                <IconeAnimee
                  icone={icones.recherche}
                  taille={tailles.recherche}
                  animation="none"
                />
              </span>
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="ابحث عن ملف، عميل، رقم الملف، CIN، المحكمة، المرجع أو كلمة مفتاحية..."
                className="w-full pr-[70px] sm:pr-[90px] pl-4 sm:pl-6 h-14 sm:h-[70px] lg:h-[90px] bg-[#F8FAFD] border border-border rounded-2xl text-base sm:text-lg text-[#0E2F6B] placeholder-[#9AA6B8] shadow-sm focus:outline-none focus:border-[#0F3D91]/40 focus:bg-white transition-all"
              />
            </form>
          </div>
        </div>
      </motion.div>

      {/* ====== Raccourcis / Services ====== */}
      <div className="flex items-center gap-3">
        <span className="text-sm font-bold text-[#6B7280] uppercase tracking-wider">الوصول السريع</span>
      </div>
      <motion.div variants={item} className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-5">
        {raccourcis.map((r) => (
          <Link
            key={r.href}
            href={r.href}
            className="group bg-white rounded-card shadow-card p-4 sm:p-6 flex items-center gap-3 sm:gap-5 hover:bg-[#EAF2FF]/40 transition-all duration-250 hover:-translate-y-0.5 hover:shadow-card-hover"
          >
            <div className="w-16 h-16 sm:w-20 sm:h-20 lg:w-24 lg:h-24 rounded-2xl bg-[#EAF2FF] flex items-center justify-center shrink-0">
              <IconeAnimee icone={r.icone} taille={tailles.carte} />
            </div>
            <div className="min-w-0">
              <p className="text-base sm:text-lg font-bold text-[#0E2F6B] group-hover:text-[#0F3D91] transition-colors">
                {r.label}
              </p>
              <p className="text-xs sm:text-sm text-[#6B7280] truncate">{r.description}</p>
            </div>
          </Link>
        ))}
      </motion.div>

      {/* ====== Search Results ====== */}
      {searchPerformed && (
        <motion.div variants={item}>
          <div className="bg-white rounded-card shadow-card p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-bold text-[#0E2F6B]">
                {searchLoading ? "جاري البحث..." : `نتائج البحث عن "${searchResults?.query}" (${searchResults?.totalResults || 0})`}
              </h2>
              <button onClick={clearSearch} className="inline-flex items-center gap-1.5 text-sm font-semibold text-[#6B7280] hover:text-red-500 transition-colors">
                <X className="w-5 h-5" />
                إلغاء البحث
              </button>
            </div>

            {searchLoading ? (
              <div className="py-12 text-center">
                <div className="animate-spin w-8 h-8 border-2 border-[#0F3D91] border-t-transparent rounded-full mx-auto" />
              </div>
            ) : (
              <div className="space-y-6">
                {searchResults?.clients && searchResults.clients.length > 0 && (
                  <div>
                    <h3 className="text-xs font-bold text-[#6B7280] mb-2 uppercase tracking-wider">العملاء ({searchResults.clients.length})</h3>
                    <div className="divide-y divide-border rounded-xl border border-border overflow-hidden">
                      {searchResults.clients.map((c) => (
                        <Link key={c.id} href={`/clients/${c.id}`} className="flex items-center justify-between px-5 py-4 hover:bg-[#EAF2FF]/30 transition-colors">
                          <div>
                            <p className="text-base font-bold text-[#0E2F6B]">{c.prenom} {c.nom}</p>
                            <p className="text-sm text-[#6B7280]">{c.cin} | {c.telephone}</p>
                          </div>
                          <span className="text-sm text-[#6B7280]">{c.ville || "—"}</span>
                        </Link>
                      ))}
                    </div>
                  </div>
                )}

                {searchResults?.cases && searchResults.cases.length > 0 && (
                  <div>
                    <h3 className="text-xs font-bold text-[#6B7280] mb-2 uppercase tracking-wider">الملفات ({searchResults.cases.length})</h3>
                    <div className="divide-y divide-border rounded-xl border border-border overflow-hidden">
                      {searchResults.cases.map((c: any) => (
                        <Link key={c.id} href={`/cases/${c.id}`} className="flex items-center justify-between px-5 py-4 hover:bg-[#EAF2FF]/30 transition-colors">
                          <div>
                            <p className="text-base font-bold text-[#0E2F6B]">{c.reference} — {c.client?.prenom} {c.client?.nom}</p>
                            <p className="text-sm text-[#6B7280]">{c.type} | {c.tribunal || "—"}</p>
                          </div>
                          <Badge text={formatCaseStatus(c.etat)} />
                        </Link>
                      ))}
                    </div>
                  </div>
                )}

                {searchResults?.documents && searchResults.documents.length > 0 && (
                  <div>
                    <h3 className="text-xs font-bold text-[#6B7280] mb-2 uppercase tracking-wider">المستندات ({searchResults.documents.length})</h3>
                    <div className="divide-y divide-border rounded-xl border border-border overflow-hidden">
                      {searchResults.documents.map((d) => (
                        <div key={d.id} className="px-5 py-4">
                          <p className="text-base font-bold text-[#0E2F6B]">{d.nom}</p>
                          <p className="text-sm text-[#6B7280]">{d.description || "—"} | {d.cas?.reference || "—"}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {searchResults?.caseTypes && searchResults.caseTypes.length > 0 && (
                  <div>
                    <h3 className="text-xs font-bold text-[#6B7280] mb-2 uppercase tracking-wider">أنواع القضايا ({searchResults.caseTypes.length})</h3>
                    <div className="divide-y divide-border rounded-xl border border-border overflow-hidden">
                      {searchResults.caseTypes.map((ct) => (
                        <div key={ct.id} className="px-5 py-4">
                          <p className="text-base font-bold text-[#0E2F6B]">{ct.nameAr}</p>
                          <p className="text-sm text-[#6B7280]">{ct.description || "—"}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {(!searchResults?.clients?.length && !searchResults?.cases?.length && !searchResults?.documents?.length && !searchResults?.caseTypes?.length) && (
                  <div className="py-12 text-center">
                    <p className="text-base text-[#6B7280]">لا توجد نتائج مطابقة</p>
                  </div>
                )}
              </div>
            )}
          </div>
        </motion.div>
      )}

      {/* ====== Contenu du Dashboard ====== */}
      {!searchPerformed && (<>
        {/* ====== Statistiques ====== */}
        <div className="flex items-center gap-3">
          <span className="text-sm font-bold text-[#6B7280] uppercase tracking-wider">إحصائيات المكتب</span>
        </div>
        <motion.div
          variants={item}
          className="grid grid-cols-2 lg:grid-cols-4 justify-items-center gap-6 lg:gap-14"
        >
          {stats.map((s) => (
            <StatCircle
              key={s.title}
              title={s.title}
              value={s.value}
              icone={s.icone}
            />
          ))}
        </motion.div>

        {/* ====== Rappels ====== */}
        <motion.div
          variants={item}
          className="grid grid-cols-1 lg:grid-cols-5 gap-5"
        >
          <div className="lg:col-span-3">
            <CountdownTimer event={nextEvent} onFinish={addTimerNotification} />
          </div>
          <div className="lg:col-span-2">
            <button
              type="button"
              onClick={() => setShowCreateModal(true)}
              className="w-full flex items-center justify-center gap-3 bg-[#FFF6EC] border-2 border-dashed border-[#FF9F1C]/40 rounded-card p-6 hover:bg-[#FFF0DD] hover:border-[#FF9F1C]/70 transition-all duration-250 cursor-pointer"
            >
              <div className="w-10 h-10 rounded-full bg-[#FF9F1C] flex items-center justify-center shrink-0">
                <IconeAnimee icone={icones.ajouter} taille={29} animation="click" hoverScale={1.12} />
              </div>
              <span className="text-lg font-bold text-[#0E2F6B]">إضافة تذكيرات</span>
            </button>
          </div>
        </motion.div>

        {/* ====== Derniers fichiers ====== */}
        <motion.div variants={item}>
          <div className="bg-white rounded-card shadow-card p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-bold text-[#0E2F6B]">آخر الملفات</h2>
              <Link
                href="/cases"
                className="inline-flex items-center gap-1.5 text-base font-bold text-[#0F3D91] hover:text-[#1E5BDB] transition-colors"
              >
                عرض جميع الملفات
                <ArrowLeft className="w-5 h-5" />
              </Link>
            </div>
            <DataTable
              columns={caseColumns}
              data={data.recentCases}
              emptyMessage="لا توجد ملفات لعرضها"
            />
          </div>
        </motion.div>
      </>)}

      {/* ====== Notification Popup ====== */}
      <NotificationPopup
        reminders={pendingReminders}
        onDismiss={dismissReminder}
      />

      {/* ====== Create Reminder Modal ====== */}
      <CreateReminderModal
        open={showCreateModal}
        onClose={() => setShowCreateModal(false)}
        onCreate={createEvent}
      />
    </motion.div>
  );
}
