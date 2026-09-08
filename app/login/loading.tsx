export default function LoginLoading() {
  return (
    <div className="flex items-center justify-center min-h-screen bg-black">
      <div className="text-center">
        <div className="animate-spin w-12 h-12 border-2 border-white border-t-transparent rounded-full mx-auto" />
      </div>
    </div>
  );
}
