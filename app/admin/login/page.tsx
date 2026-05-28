"use client";

import { useState } from "react";
import Image from "next/image";

export default function AdminLoginPage() {
  const [email, setEmail] = useState("");
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
        body: JSON.stringify({ email }),
      });

      if (res.ok) {
        const data = await res.json();
        if (data.loginUrl) {
          setLoginUrl(data.loginUrl);
        }
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
    <div className="min-h-screen bg-[#f8f8fb] flex items-center justify-center px-4">
      <div className="w-full max-w-sm bg-white rounded-2xl shadow-sm border border-[#e2e8f0] p-8">
        <div className="flex justify-center mb-6">
          <Image src="/logo.png" alt="KAPILOTO" width={140} height={50} className="object-contain" />
        </div>

        <h1 className="text-xl font-bold text-center text-[#1a1a2e] mb-1">כניסה למערכת ניהול</h1>
        <p className="text-sm text-gray-500 text-center mb-6">הזיני את האימייל שלך כדי לקבל קישור כניסה</p>

        {status === "sent" ? (
          <div className="text-center space-y-4">
            {loginUrl ? (
              <>
                <div className="text-4xl mb-2">🔑</div>
                <p className="font-medium text-[#1a1a2e]">הקישור שלך מוכן:</p>
                <a
                  href={loginUrl}
                  className="block w-full bg-[#e94560] text-white rounded-lg py-3 text-sm font-medium hover:bg-[#c73550] transition text-center"
                >
                  לחצי כאן להיכנס
                </a>
                <p className="text-xs text-gray-400">הקישור תקף ל-15 דקות</p>
              </>
            ) : (
              <>
                <div className="text-4xl mb-3">📧</div>
                <p className="font-medium text-[#1a1a2e]">הקישור נשלח!</p>
                <p className="text-sm text-gray-500 mt-1">בדקי את תיבת המייל. הקישור תקף ל-15 דקות.</p>
              </>
            )}
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-[#1a1a2e] mb-1">כתובת אימייל</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                placeholder="you@example.com"
                className="w-full border border-[#e2e8f0] rounded-lg px-3 py-2.5 text-sm outline-none focus:border-[#e94560] focus:ring-1 focus:ring-[#e94560] transition"
                dir="ltr"
              />
            </div>

            {status === "error" && (
              <p className="text-sm text-[#e94560]">{errorMsg}</p>
            )}

            <button
              type="submit"
              disabled={status === "loading"}
              className="w-full bg-[#1a1a2e] text-white rounded-lg py-2.5 text-sm font-medium hover:bg-[#2a2a4e] transition disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {status === "loading" ? "שולח..." : "שלח קישור כניסה"}
            </button>
          </form>
        )}
      </div>
    </div>
  );
}
