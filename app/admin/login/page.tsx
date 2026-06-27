"use client";

import { useState } from "react";
import Image from "next/image";

export default function AdminLoginPage() {
  const [password, setPassword] = useState("");
  const [status, setStatus] = useState<"idle" | "loading" | "sent" | "error">("idle");
  const [errorMsg, setErrorMsg] = useState("");
  const [loginUrl, setLoginUrl] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setStatus("loading");
    setErrorMsg("");
    setLoginUrl(null);

    try {
      const res = await fetch("/api/auth/admin-magic", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ password }),
      });

      if (res.ok) {
        const data = await res.json();
        if (data.loginUrl) setLoginUrl(data.loginUrl);
        setStatus("sent");
      } else {
        const data = await res.json();
        setErrorMsg(data.error || "שגיאה לא ידועה");
        setStatus("error");
      }
    } catch {
      setErrorMsg("שגיאת רשת, נסי שוב");
      setStatus("error");
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#1a1a2e] via-[#2d1b69] to-[#7c3aed] flex items-center justify-center px-4 relative overflow-hidden">
      {/* decorative orbs */}
      <div className="absolute -top-32 -right-32 w-96 h-96 bg-purple-500/20 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute -bottom-32 -left-32 w-80 h-80 bg-[#e94560]/15 rounded-full blur-3xl pointer-events-none" />

      <div className="relative w-full max-w-sm bg-white/10 backdrop-blur-xl border border-white/20 rounded-3xl shadow-2xl p-8">
        <div className="flex justify-center mb-6">
          <Image src="/logo.png" alt="KAPILOTO" width={140} height={50} className="object-contain brightness-0 invert" />
        </div>

        <h1 className="text-xl font-bold text-center text-white mb-1">כניסה למערכת ניהול</h1>
        <p className="text-sm text-white/50 text-center mb-6">הזיני סיסמה לקבלת קישור כניסה</p>

        {status === "sent" ? (
          <div className="text-center space-y-4">
            {loginUrl ? (
              <>
                <div className="w-14 h-14 bg-white/20 rounded-full flex items-center justify-center mx-auto mb-2">
                  <svg viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth={2} className="w-7 h-7">
                    <path d="M21 2l-2 2m-7.61 7.61a5.5 5.5 0 1 1-7.778 7.778 5.5 5.5 0 0 1 7.777-7.777zm0 0L15.5 7.5m0 0 3 3L22 7l-3-3m-3.5 3.5L19 4" />
                  </svg>
                </div>
                <p className="font-medium text-white">הקישור שלך מוכן:</p>
                <a
                  href={loginUrl}
                  className="block w-full bg-white text-[#1a1a2e] rounded-xl py-3 text-sm font-bold hover:bg-white/90 transition text-center shadow-lg"
                >
                  לחצי כאן להיכנס
                </a>
                <p className="text-xs text-white/40">הקישור תקף ל-15 דקות</p>
              </>
            ) : (
              <>
                <div className="w-14 h-14 bg-white/20 rounded-full flex items-center justify-center mx-auto mb-2">
                  <svg viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth={2} className="w-7 h-7">
                    <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z" />
                    <polyline points="22,6 12,13 2,6" />
                  </svg>
                </div>
                <p className="font-medium text-white">הקישור נשלח!</p>
                <p className="text-sm text-white/50 mt-1">בדקי את תיבת המייל. הקישור תקף ל-15 דקות.</p>
              </>
            )}
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4" dir="ltr">
            <div>
              <label className="block text-sm font-medium text-white/80 mb-1 text-right" dir="rtl">סיסמת מנהל</label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                autoComplete="current-password"
                autoCorrect="off"
                autoCapitalize="off"
                spellCheck={false}
                placeholder="••••••••"
                className="w-full bg-white/90 border border-white/30 rounded-xl px-3 py-2.5 text-sm text-[#1a1a2e] outline-none focus:border-white focus:bg-white transition placeholder:text-gray-400"
                dir="ltr"
              />
            </div>

            {status === "error" && (
              <p className="text-sm text-[#ff6b85] text-right" dir="rtl">{errorMsg}</p>
            )}

            <button
              type="submit"
              disabled={status === "loading"}
              className="w-full bg-white text-[#1a1a2e] font-bold rounded-xl py-2.5 text-sm hover:bg-white/90 transition disabled:opacity-50 disabled:cursor-not-allowed shadow-lg"
            >
              {status === "loading" ? "..." : "כניסה"}
            </button>
          </form>
        )}
      </div>
    </div>
  );
}
