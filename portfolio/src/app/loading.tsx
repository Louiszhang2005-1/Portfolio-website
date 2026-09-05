export default function Loading() {
  return (
    <main className="grid min-h-screen place-items-center bg-[#050505] text-[#e1e0cc]">
      <div className="relative h-16 w-16">
        <div className="absolute inset-0 rounded-full border border-[#e1e0cc]/10" />
        <div className="absolute inset-2 animate-spin rounded-full border-2 border-transparent border-t-[#59eafb]" />
        <div className="absolute inset-6 rounded-full bg-[#e1e0cc]/70 shadow-[0_0_28px_rgba(89,234,251,0.35)]" />
      </div>
    </main>
  );
}
