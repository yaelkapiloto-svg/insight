"use client";

import { AnimatedCounter } from "./AnimatedCounter";
import { MonthDropdown } from "./MonthDropdown";
import type { MonthlyMetricData } from "@/types/report";
import Image from "next/image";

function fmt(n: number | null): number { return n ?? 0; }
function fmtShort(n: number | null): string {
  if (n === null) return "—";
  if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(1)}M`;
  if (n >= 1_000) return `${(n / 1_000).toFixed(1)}K`;
  return n.toLocaleString("en-US");
}

const HERO_STATS = [
  { key: "views" as const, label: "צפיות" },
  { key: "reach" as const, label: "הגעה" },
  { key: "interactions" as const, label: "אינטראקציות" },
  { key: "clicks" as const, label: "קליקים" },
];

interface Props {
  clientName: string;
  clientLogoUrl: string | null;
  monthLabel: string;
  metrics: MonthlyMetricData | null;
  availableMonths: string[];
  currentMonth: string;
}

export function ReportHero({ clientName, clientLogoUrl, monthLabel, metrics, availableMonths, currentMonth }: Props) {
  return (
    <div className="relative overflow-hidden">
      {/* gradient background */}
      <div className="absolute inset-0 bg-gradient-to-br from-[#1a1a2e] via-[#2d1b69] to-[#7c3aed]" />

      {/* decorative blur orbs */}
      <div className="absolute -top-24 -right-24 w-96 h-96 bg-purple-500/30 rounded-full blur-3xl" />
      <div className="absolute -bottom-24 -left-24 w-80 h-80 bg-[#e94560]/20 rounded-full blur-3xl" />
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-64 h-64 bg-blue-500/10 rounded-full blur-3xl" />

      {/* noise texture overlay */}
      <div className="absolute inset-0 opacity-[0.03]" style={{ backgroundImage: 'url("data:image/svg+xml,%3Csvg viewBox=\'0 0 256 256\' xmlns=\'http://www.w3.org/2000/svg\'%3E%3Cfilter id=\'noise\'%3E%3CfeTurbulence type=\'fractalNoise\' baseFrequency=\'0.9\' numOctaves=\'4\' stitchTiles=\'stitch\'/%3E%3C/filter%3E%3Crect width=\'100%25\' height=\'100%25\' filter=\'url(%23noise)\'/%3E%3C/svg%3E")' }} />

      <div className="relative z-10 max-w-4xl mx-auto px-4 pt-8 pb-10">
        {/* top bar: logos */}
        <div className="flex items-center justify-between mb-8">
          <Image src="/logo.png" alt="KAPILOTO" width={110} height={36} className="object-contain brightness-0 invert" />
          <div className="flex items-center gap-3">
            {clientLogoUrl ? (
              <Image src={clientLogoUrl} alt={clientName} width={80} height={32} className="object-contain brightness-0 invert opacity-90" />
            ) : (
              <span className="text-white/90 font-bold text-sm">{clientName}</span>
            )}
          </div>
        </div>

        {/* title */}
        <div className="mb-6">
          <div className="inline-flex items-center gap-2 bg-white/10 backdrop-blur-sm border border-white/20 rounded-full px-3 py-1 text-white/70 text-xs font-medium mb-3">
            <span className="w-1.5 h-1.5 bg-emerald-400 rounded-full animate-pulse" />
            דוח חודשי
          </div>
          <h1 className="text-3xl md:text-4xl font-black text-white leading-tight">
            דוח סושיאל מדיה
          </h1>
          <p className="text-white/60 mt-1 text-base">
            {clientName} · {monthLabel}
          </p>
        </div>

        {/* hero stats grid */}
        {metrics && (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-8">
            {HERO_STATS.map(({ key, label }) => (
              <div
                key={key}
                className="bg-white/10 backdrop-blur-md border border-white/20 rounded-2xl p-4 hover:bg-white/15 transition-colors"
              >
                <div className="text-white/50 text-xs font-medium mb-1">{label}</div>
                <div className="text-2xl font-black text-white" dir="ltr">
                  {metrics[key] !== null
                    ? <AnimatedCounter value={fmt(metrics[key])} formatter={fmtShort} />
                    : "—"}
                </div>
              </div>
            ))}
          </div>
        )}

        {/* month dropdown */}
        <MonthDropdown availableMonths={availableMonths} currentMonth={currentMonth} />
      </div>
    </div>
  );
}
