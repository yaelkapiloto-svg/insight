import Image from "next/image";
import Link from "next/link";

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-[#f8f8fb]">
      <header className="bg-white border-b border-[#e2e8f0] sticky top-0 z-10">
        <div className="max-w-6xl mx-auto px-4 h-14 flex items-center justify-between">
          <div className="flex items-center gap-5">
            <Link href="/admin">
              <Image src="/logo.png" alt="KAPILOTO" width={110} height={36} className="object-contain" />
            </Link>
            <Link
              href="/admin"
              className="flex items-center gap-1.5 text-sm text-gray-600 hover:text-[#e94560] transition"
            >
              <span>🏠</span>
              <span>כל הלקוחות</span>
            </Link>
          </div>
          <form action="/api/auth/logout" method="POST">
            <button
              type="submit"
              className="text-sm text-gray-500 hover:text-[#e94560] transition"
            >
              יציאה
            </button>
          </form>
        </div>
      </header>
      <main className="max-w-6xl mx-auto px-4 py-8">{children}</main>
    </div>
  );
}
