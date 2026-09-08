"use client";

export default function ClientError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <div className="flex items-center justify-center min-h-[60vh]">
      <div className="text-center">
        <p className="text-lg font-semibold text-red-500 mb-2">حدث خطأ</p>
        <p className="text-sm text-[#6B7280] mb-4">{error.message || "تعذر تحميل الصفحة"}</p>
        <button
          onClick={reset}
          className="bg-[#0F3D91] text-white px-5 py-2.5 rounded-xl text-sm hover:bg-[#0C3174] transition-colors"
        >
          إعادة المحاولة
        </button>
      </div>
    </div>
  );
}
