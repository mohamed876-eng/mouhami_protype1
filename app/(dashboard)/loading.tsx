export default function Loading() {
  return (
    <div className="flex items-center justify-center min-h-[60vh]">
      <div className="text-center">
        <div className="animate-spin w-12 h-12 border-2 border-[#0F3D91] border-t-transparent rounded-full mx-auto" />
        <p className="mt-4 text-[#6B7280] text-sm">جاري التحميل...</p>
      </div>
    </div>
  );
}
