// Page de détail d'un client
// Affiche les informations et la liste de ses dossiers

"use client";

import { useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { useClients } from "@/hooks/useClients";
import DataTable from "@/components/ui/DataTable";
import Badge from "@/components/ui/Badge";
import { formatDateShort, formatCaseStatus } from "@/lib/utils";

export default function ClientDetailPage() {
  const { id } = useParams();
  const router = useRouter();
  const { client, loading, fetchClient, deleteClient } = useClients();

  useEffect(() => {
    if (id) fetchClient(id as string);
  }, [id, fetchClient]);

  if (loading || !client) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin w-8 h-8 border-4 border-primary-500 border-t-transparent rounded-full" />
      </div>
    );
  }

  const handleDelete = async () => {
    if (confirm("هل أنت متأكد من حذف هذا العميل؟")) {
      await deleteClient(client.id);
      router.push("/clients");
    }
  };

  const caseColumns = [
    {
      key: "reference",
      label: "المرجع",
      render: (value: string, row: any) => (
        <Link
          href={`/cases/${row.id}`}
          className="text-primary-500 hover:text-primary-600 font-medium"
        >
          {value}
        </Link>
      ),
    },
    { key: "type", label: "النوع" },
    {
      key: "etat",
      label: "الحالة",
      render: (value: string) => <Badge text={formatCaseStatus(value)} />,
    },
    {
      key: "dateCreation",
      label: "تاريخ الإنشاء",
      render: (value: string) => formatDateShort(value),
    },
  ];

  return (
    <div>
      {/* En-tête */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-4">
          <div className="w-16 h-16 bg-primary-500 rounded-full flex items-center justify-center text-white text-2xl font-bold">
            {client.prenom.charAt(0)}
            {client.nom.charAt(0)}
          </div>
          <div>
            <h1 className="text-2xl font-bold text-primary-500">
              {client.prenom} {client.nom}
            </h1>
            <p className="text-secondary-400">
              CIN: {client.cin} | {client.telephone}
            </p>
          </div>
        </div>
        <div className="flex gap-3">
          <Link
            href={`/clients/${client.id}/edit`}
            className="bg-primary-500 text-white px-4 py-2 rounded-lg text-sm hover:bg-primary-600 transition-colors"
          >
            تعديل
          </Link>
          <button
            onClick={handleDelete}
            className="bg-red-500 text-white px-4 py-2 rounded-lg text-sm hover:bg-red-600 transition-colors"
          >
            حذف
          </button>
        </div>
      </div>

      {/* Informations */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
        <div className="bg-white rounded-xl border border-secondary-200 p-5">
          <h3 className="font-semibold text-primary-500 mb-4">المعلومات الشخصية</h3>
          <div className="space-y-3 text-sm">
            <div className="flex justify-between">
              <span className="text-secondary-400">الاسم الكامل</span>
              <span>{client.prenom} {client.nom}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-secondary-400">CIN</span>
              <span>{client.cin}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-secondary-400">الهاتف</span>
              <span>{client.telephone}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-secondary-400">البريد الإلكتروني</span>
              <span>{client.email || "—"}</span>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl border border-secondary-200 p-5">
          <h3 className="font-semibold text-primary-500 mb-4">العنوان</h3>
          <div className="space-y-3 text-sm">
            <div className="flex justify-between">
              <span className="text-secondary-400">المدينة</span>
              <span>{client.ville || "—"}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-secondary-400">العنوان</span>
              <span>{client.adresse || "—"}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-secondary-400">المهنة</span>
              <span>{client.profession || "—"}</span>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl border border-secondary-200 p-5">
          <h3 className="font-semibold text-primary-500 mb-4">معلومات إضافية</h3>
          <div className="space-y-3 text-sm">
            <div className="flex justify-between">
              <span className="text-secondary-400">الحالة</span>
              <Badge text={client.statut === "actif" ? "نشط" : "غير نشط"} />
            </div>
            <div className="flex justify-between">
              <span className="text-secondary-400">تاريخ الإضافة</span>
              <span>{formatDateShort(client.createdAt)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-secondary-400">عدد الملفات</span>
              <span>{client.cases?.length || 0}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Observations */}
      {client.observations && (
        <div className="bg-white rounded-xl border border-secondary-200 p-5 mb-8">
          <h3 className="font-semibold text-primary-500 mb-2">ملاحظات</h3>
          <p className="text-sm text-secondary-600">{client.observations}</p>
        </div>
      )}

      {/* Dossiers du client */}
      <h2 className="text-lg font-semibold text-primary-500 mb-4">
        ملفات العميل
      </h2>
      <DataTable
        columns={caseColumns}
        data={client.cases || []}
        emptyMessage="لا توجد ملفات لهذا العميل"
      />
    </div>
  );
}
