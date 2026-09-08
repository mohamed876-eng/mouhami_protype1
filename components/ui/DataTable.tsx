"use client";

import IconeAnimee from "@/components/ui/IconeAnimee";
import { lottieSearch } from "@/components/lottie";

interface Column {
  key: string;
  label: string;
  render?: (value: any, row: any) => React.ReactNode;
}

interface DataTableProps {
  columns: Column[];
  data: any[];
  loading?: boolean;
  emptyMessage?: string;
}

export default function DataTable({
  columns,
  data,
  loading,
  emptyMessage = "لا توجد بيانات",
}: DataTableProps) {
  if (loading) {
    return (
      <div className="bg-white rounded-card shadow-card p-12 text-center">
        <div className="animate-spin w-10 h-10 border-2 border-[#0F3D91] border-t-transparent rounded-full mx-auto" />
        <p className="mt-4 text-base text-[#6B7280]">جاري التحميل...</p>
      </div>
    );
  }

  if (data.length === 0) {
    return (
      <div className="bg-white rounded-card shadow-card p-12 text-center">
        <IconeAnimee icone={lottieSearch} taille={96} className="mx-auto mb-5" />
        <p className="text-lg text-[#6B7280] font-semibold">{emptyMessage}</p>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-card shadow-card overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="border-b border-border">
              {columns.map((col) => (
                <th
                  key={col.key}
                  className="text-right px-6 py-4 text-base font-bold text-[#6B7280]"
                >
                  {col.label}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {data.map((row, index) => (
              <tr
                key={row.id || index}
                className="border-b border-border last:border-b-0 hover:bg-[#EAF2FF]/30 transition-colors duration-150"
              >
                {columns.map((col) => (
                  <td key={col.key} className="px-6 py-4 text-base text-[#0E2F6B]">
                    {col.render ? col.render(row[col.key], row) : row[col.key]}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
