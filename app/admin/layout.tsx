import Image from "next/image";
import Link from "next/link";

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-[#f5f5fb]">
      <header className="bg-gradient-to-r from-[#1a1a2e] to-[#2d1b69] sticky top-0 z-10 shadow-lg">
        <div className="max-w-6xl mx-auto px-4 h-14 flex items-center justify-between">
          <div className="flex items-center gap-5">
            <Link href="/admin">
              <Image src="/logo.png" alt="KAPILOTO" width={110} height={36} className="object-contain brightness-0 invert" />
            </Link>
            <Link
              href="/admin"
              className="flex items-center gap-1.5 text-sm text-white/70 hover:text-white hover:bg-white/10 px-3 py-1.5 rounded-lg transition"
            >
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} className="w-4 h-4">
                <path d="m3 9 9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
                <polyline points="9 22 9 12 15 12 15 22" />
              </svg>
              <span>כל הלקוחות</span>
            </Link>
          </div>
          <form action="/api/auth/logout" method="POST">
            <button
              type="submit"
              className="text-sm text-white/60 hover:text-white hover:bg-white/10 px-3 py-1.5 rounded-lg transition"
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
