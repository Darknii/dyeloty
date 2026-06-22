export default function Header() {
  return (
    <header className="flex items-center justify-between py-6">
      <div className="text-2xl font-bold text-[#2D2D2D]">
        🧶 Dyeloty
      </div>

      <div className="flex gap-4 text-sm text-gray-500">
        <button>🇵🇱 PL</button>
        <button>🇬🇧 EN</button>
      </div>
    </header>
  );
}