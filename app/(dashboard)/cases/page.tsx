// Page de liste des dossiers avec recherche et filtres

"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useCases } from "@/hooks/useCases";
import DataTable from "@/components/ui/DataTable";
import Pagination from "@/components/ui/Pagination";
import Badge from "@/components/ui/Badge";
import IconeAnimee from "@/components/ui/IconeAnimee";
import { lottieFolder, lottiePlus } from "@/components/lottie";
import { formatDateShort, formatCaseStatus } from "@/lib/utils";
import Modal from "@/components/ui/Modal";
import { apiService } from "@/lib/api";
import { useRouter } from "next/navigation";
import CourtSelect from "@/components/ui/CourtSelect";
import { CUSTOM_TRIBUNAL_VALUE, JUDICIAL_REGIONS } from "@/lib/judicial-courts";

export default function CasesPage() {
  const { cases, pagination, loading, fetchCases, deleteCase } = useCases();
  const [search, setSearch] = useState("");
  const [etatFilter, setEtatFilter] = useState("");
  const [page, setPage] = useState(1);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [clients, setClients] = useState<any[]>([]);
  const [templates, setTemplates] = useState<any[]>([]);
  const [caseTypesList, setCaseTypesList] = useState<any[]>([]);
  const [newCase, setNewCase] = useState({
    clientId: "",
    type: "",
    regionId: "",
    tribunal: "",
    customTribunal: "",
    description: "",
    templateId: "",
    caseTypeId: "",
  });
  const router = useRouter();
  const selectedCaseType = caseTypesList.find(
    (caseType) => caseType.id === newCase.caseTypeId
  );

  useEffect(() => {
    fetchCases({ page, search, etat: etatFilter || undefined });
  }, [page, search, etatFilter, fetchCases]);

  const openCreateModal = async () => {
    setShowCreateModal(true);
    const [clientsRes, templatesRes, caseTypesRes] = await Promise.all([
      apiService.get<any>("/clients?limit=100"),
      apiService.get<any>("/modeles"),
      apiService.get<any>("/types-de-dossier?active=true"),
    ]);
    if (clientsRes.success) setClients(clientsRes.data!.clients);
    if (templatesRes.success) setTemplates(templatesRes.data!.templates);
    if (caseTypesRes.success) setCaseTypesList(caseTypesRes.data!.types);
  };

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    const { regionId, customTribunal, ...caseData } = newCase;
    const selectedRegion = JUDICIAL_REGIONS.find(
      (region) => String(region.id) === regionId
    );
    const tribunal = (
      caseData.tribunal === CUSTOM_TRIBUNAL_VALUE
        ? customTribunal
        : caseData.tribunal
    ).trim();
    const result = await apiService.post<any>("/dossiers", {
      ...caseData,
      region: selectedRegion?.nameAr,
      tribunal: tribunal || undefined,
    });
    if (result.success) {
      setShowCreateModal(false);
      router.push(`/cases/${result.data!.case.id}`);
    }
  };

  const handleDelete = async (id: string, ref: string) => {
    if (confirm(`هل أنت متأكد من حذف الملف ${ref}؟`)) {
      await deleteCase(id);
    }
  };

  const columns = [
    {
      key: "reference",
      label: "المرجع",
      render: (value: string, row: any) => (
        <Link href={`/cases/${row.id}`} className="text-primary-500 hover:text-primary-600 font-medium">
          {value}
        </Link>
      ),
    },
    {
      key: "client",
      label: "العميل",
      render: (value: any) => value ? `${value.prenom} ${value.nom}` : "—",
    },
    { key: "type", label: "النوع" },
    {
      key: "etat",
      label: "الحالة",
      render: (value: string) => <Badge text={formatCaseStatus(value)} />,
    },
    {
      key: "progress",
      label: "التقدم",
      render: (value: number) => (
        <div className="flex items-center gap-2">
          <div className="flex-1 bg-secondary-200 rounded-full h-2">
            <div className="bg-primary-500 h-2 rounded-full" style={{ width: `${value}%` }} />
          </div>
          <span className="text-xs text-secondary-500">{value}%</span>
        </div>
      ),
    },
    {
      key: "createdAt",
      label: "تاريخ الإنشاء",
      render: (value: string) => formatDateShort(value),
    },
    {
      key: "actions",
      label: "الإجراءات",
      render: (_: any, row: any) => (
        <div className="flex gap-2">
          <Link href={`/cases/${row.id}`} className="text-primary-500 hover:text-primary-700 text-sm">عرض</Link>
          <button onClick={() => handleDelete(row.id, row.reference)} className="text-red-500 hover:text-red-700 text-sm">حذف</button>
        </div>
      ),
    },
  ];

  return (
    <div>
      <div className="flex flex-wrap items-center justify-between gap-3 mb-6">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-xl bg-[#EAF2FF] flex items-center justify-center shrink-0">
            <IconeAnimee icone={lottieFolder} taille={42} title="الملفات" />
          </div>
          <h1 className="text-2xl sm:text-3xl text-primary-500">الملفات</h1>
        </div>
        <button onClick={openCreateModal} className="bg-primary-500 text-white px-5 py-3 rounded-xl hover:bg-primary-600 transition-colors">
          <span className="inline-flex items-center gap-1.5"><IconeAnimee icone={lottiePlus} taille={20} animation="click" /> إضافة ملف</span>
        </button>
      </div>

      {/* Filtres */}
      <div className="flex flex-wrap gap-4 mb-6">
        <input
          type="text"
          value={search}
          onChange={(e) => { setSearch(e.target.value); setPage(1); }}
          placeholder="ابحث عن ملف بالمرجع، النوع، أو العميل..."
          className="flex-1 min-w-[220px] max-w-md px-4 py-2.5 border border-secondary-200 rounded-lg text-sm focus:ring-2 focus:ring-primary-500 focus:border-transparent"
        />
        <select
          value={etatFilter}
          onChange={(e) => { setEtatFilter(e.target.value); setPage(1); }}
          className="px-4 py-2.5 border border-secondary-200 rounded-lg text-sm focus:ring-2 focus:ring-primary-500 focus:border-transparent"
        >
          <option value="">جميع الحالات</option>
          <option value="en_cours">قيد المعالجة</option>
          <option value="cloture">مغلق</option>
          <option value="suspendu">موقوف</option>
        </select>
      </div>

      <DataTable columns={columns} data={cases} loading={loading} emptyMessage="لا توجد ملفات بعد" />
      <Pagination page={pagination.page} totalPages={pagination.totalPages} onPageChange={setPage} />

      {/* Modal de création */}
      <Modal isOpen={showCreateModal} onClose={() => setShowCreateModal(false)} title="إضافة ملف جديد" size="lg">
        <form onSubmit={handleCreate} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-secondary-700 mb-1">العميل *</label>
            <select
              value={newCase.clientId}
              onChange={(e) => setNewCase({ ...newCase, clientId: e.target.value })}
              required
              className="w-full px-4 py-2.5 border border-secondary-200 rounded-lg text-sm"
            >
              <option value="">اختر العميل</option>
              {clients.map((c: any) => (
                <option key={c.id} value={c.id}>{c.prenom} {c.nom} - {c.cin}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-secondary-700 mb-1">النموذج</label>
            <select
              value={newCase.templateId}
              onChange={(e) => setNewCase({ ...newCase, templateId: e.target.value })}
              className="w-full px-4 py-2.5 border border-secondary-200 rounded-lg text-sm"
            >
              <option value="">بدون نموذج</option>
              {templates.map((t: any) => (
                <option key={t.id} value={t.id}>{t.nom}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-secondary-700 mb-1">نوع القضية *</label>
            <select
              value={newCase.caseTypeId}
              onChange={(e) => {
                const selected = caseTypesList.find(ct => ct.id === e.target.value);
                setNewCase({
                  ...newCase,
                  caseTypeId: e.target.value,
                  type: selected ? selected.nameAr : "",
                });
              }}
              required
              className="w-full px-4 py-2.5 border border-secondary-200 rounded-lg text-sm"
            >
              <option value="">اختر نوع القضية</option>
              {caseTypesList.map((ct: any) => (
                <option key={ct.id} value={ct.id}>{ct.nameAr}</option>
              ))}
            </select>
          </div>

          {selectedCaseType && (
            <div className="rounded-lg border border-secondary-200 bg-secondary-50 p-4">
              <div className="flex items-center justify-between gap-3 mb-3">
                <h3 className="text-sm font-medium text-secondary-700">
                  المستندات التي ستتم إضافتها إلى الملف
                </h3>
                <span className="text-xs text-secondary-400">
                  {selectedCaseType.documents?.length || 0} مستند
                </span>
              </div>
              {selectedCaseType.documents?.length ? (
                <ul className="space-y-2">
                  {selectedCaseType.documents.map((document: any) => (
                    <li
                      key={document.id}
                      className="flex items-center justify-between gap-3 rounded-md bg-white px-3 py-2 text-sm"
                    >
                      <span>{document.nameAr}</span>
                      <span className="text-xs text-secondary-400">
                        {document.isRequired ? "إلزامي" : "اختياري"}
                      </span>
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="text-xs text-secondary-500">
                  لا توجد مستندات مرتبطة بهذا النوع بعد
                </p>
              )}
              {newCase.templateId && (
                <p className="mt-3 text-xs text-secondary-500">
                  ستُعتمد مستندات نوع القضية أولًا عند إنشاء الملف
                </p>
              )}
            </div>
          )}

          <div>
            <label className="block text-sm font-medium text-secondary-700 mb-1">النوع (نص حر)</label>
            <input type="text" value={newCase.type} onChange={(e) => setNewCase({ ...newCase, type: e.target.value })} className="w-full px-4 py-2.5 border border-secondary-200 rounded-lg text-sm" placeholder="طلاق، إرث، ..." />
          </div>

          <CourtSelect
            regionId={newCase.regionId}
            tribunal={newCase.tribunal}
            customTribunal={newCase.customTribunal}
            onRegionChange={(regionId) => setNewCase((current) => ({ ...current, regionId, tribunal: "", customTribunal: "" }))}
            onTribunalChange={(tribunal) => setNewCase((current) => ({ ...current, tribunal, customTribunal: tribunal === CUSTOM_TRIBUNAL_VALUE ? current.customTribunal : "" }))}
            onCustomTribunalChange={(customTribunal) => setNewCase((current) => ({ ...current, customTribunal }))}
          />

          <div>
            <label className="block text-sm font-medium text-secondary-700 mb-1">الوصف</label>
            <textarea value={newCase.description} onChange={(e) => setNewCase({ ...newCase, description: e.target.value })} rows={3} className="w-full px-4 py-2.5 border border-secondary-200 rounded-lg text-sm" />
          </div>

          <div className="flex gap-3">
            <button type="submit" className="bg-primary-500 text-white px-6 py-2.5 rounded-lg font-medium hover:bg-primary-600 transition-colors">
              إنشاء الملف
            </button>
            <button type="button" onClick={() => setShowCreateModal(false)} className="px-6 py-2.5 border border-secondary-200 rounded-lg text-sm hover:bg-secondary-50 transition-colors">
              إلغاء
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
