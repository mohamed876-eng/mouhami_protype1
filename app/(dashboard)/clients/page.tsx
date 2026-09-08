// Page de liste des clients
// Tableau avec recherche, pagination et actions

"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useClients } from "@/hooks/useClients";
import DataTable from "@/components/ui/DataTable";
import Pagination from "@/components/ui/Pagination";
import Badge from "@/components/ui/Badge";
import IconeAnimee from "@/components/ui/IconeAnimee";
import { lottieClients, lottiePlus } from "@/components/lottie";
import { formatDateShort } from "@/lib/utils";

export default function ClientsPage() {
  const {
    clients,
    pagination,
    loading,
    fetchClients,
    deleteClient,
  } = useClients();
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);

  useEffect(() => {
    fetchClients({ page, search });
  }, [page, search, fetchClients]);

  const handleDelete = async (id: string, name: string) => {
    if (confirm(`هل أنت متأكد من حذف ${name}؟`)) {
      await deleteClient(id);
    }
  };

  const columns = [
    {
      key: "prenom",
      label: "الاسم",
      render: (_: any, row: any) => (
        <Link
          href={`/clients/${row.id}`}
          className="text-primary-500 hover:text-primary-600 font-medium"
        >
          {row.prenom} {row.nom}
        </Link>
      ),
    },
    {
      key: "cin",
      label: "CIN",
    },
    {
      key: "telephone",
      label: "الهاتف",
    },
    {
      key: "ville",
      label: "المدينة",
    },
    {
      key: "statut",
      label: "الحالة",
      render: (value: string) => <Badge text={value === "actif" ? "نشط" : "غير نشط"} />,
    },
    {
      key: "_count",
      label: "الملفات",
      render: (value: any) => value?.cases || 0,
    },
    {
      key: "createdAt",
      label: "تاريخ الإضافة",
      render: (value: string) => formatDateShort(value),
    },
    {
      key: "actions",
      label: "الإجراءات",
      render: (_: any, row: any) => (
        <div className="flex gap-2">
          <Link
            href={`/clients/${row.id}`}
            className="text-primary-500 hover:text-primary-700 text-sm"
          >
            عرض
          </Link>
          <Link
            href={`/clients/${row.id}/edit`}
            className="text-blue-500 hover:text-blue-700 text-sm"
          >
            تعديل
          </Link>
          <button
            onClick={() => handleDelete(row.id, `${row.prenom} ${row.nom}`)}
            className="text-red-500 hover:text-red-700 text-sm"
          >
            حذف
          </button>
        </div>
      ),
    },
  ];

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-xl bg-[#EAF2FF] flex items-center justify-center shrink-0">
            <IconeAnimee icone={lottieClients} taille={42} title="العملاء" />
          </div>
          <h1 className="text-3xl text-primary-500">العملاء</h1>
        </div>
        <Link
          href="/clients/new"
          className="bg-primary-500 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-primary-600 transition-colors"
        >
          <span className="inline-flex items-center gap-1.5"><IconeAnimee icone={lottiePlus} taille={20} animation="click" /> إضافة عميل</span>
        </Link>
      </div>

      {/* Recherche */}
      <div className="mb-6">
        <input
          type="text"
          value={search}
          onChange={(e) => {
            setSearch(e.target.value);
            setPage(1);
          }}
          placeholder="ابحث عن عميل بالاسم، CIN، أو الهاتف..."
          className="w-full max-w-md px-4 py-2.5 border border-secondary-200 rounded-lg text-sm focus:ring-2 focus:ring-primary-500 focus:border-transparent"
        />
      </div>

      <DataTable columns={columns} data={clients} loading={loading} emptyMessage="لا يوجد عملاء بعد" />

      <Pagination
        page={pagination.page}
        totalPages={pagination.totalPages}
        onPageChange={setPage}
      />
    </div>
  );
}
