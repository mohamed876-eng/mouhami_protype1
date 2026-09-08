"use client";

interface PaginationProps {
  page: number;
  totalPages: number;
  onPageChange: (page: number) => void;
}

export default function Pagination({
  page,
  totalPages,
  onPageChange,
}: PaginationProps) {
  if (totalPages <= 1) return null;

  return (
    <div className="flex items-center justify-center gap-2 mt-6">
      <button
        onClick={() => onPageChange(page - 1)}
        disabled={page <= 1}
        className="px-5 py-2.5 rounded-xl border border-border text-base font-semibold text-[#6B7280] disabled:opacity-50 disabled:cursor-not-allowed hover:bg-[#EAF2FF] hover:text-[#0F3D91] transition-all duration-250"
      >
        السابق
      </button>

      {Array.from({ length: totalPages }, (_, i) => i + 1)
        .filter((p) => p === 1 || p === totalPages || Math.abs(p - page) <= 2)
        .map((p, i, arr) => (
          <span key={p} className="flex items-center">
            {i > 0 && arr[i - 1] !== p - 1 && (
              <span className="px-2 text-[#9AA6B8] text-sm">...</span>
            )}
            <button
              onClick={() => onPageChange(p)}
              className={`w-12 h-12 rounded-xl text-base font-bold transition-all duration-250 ${
                p === page
                  ? "bg-[#0F3D91] text-white shadow-sm"
                  : "border border-border text-[#6B7280] hover:bg-[#EAF2FF] hover:text-[#0F3D91]"
              }`}
            >
              {p}
            </button>
          </span>
        ))}

      <button
        onClick={() => onPageChange(page + 1)}
        disabled={page >= totalPages}
        className="px-5 py-2.5 rounded-xl border border-border text-base font-semibold text-[#6B7280] disabled:opacity-50 disabled:cursor-not-allowed hover:bg-[#EAF2FF] hover:text-[#0F3D91] transition-all duration-250"
      >
        التالي
      </button>
    </div>
  );
}
