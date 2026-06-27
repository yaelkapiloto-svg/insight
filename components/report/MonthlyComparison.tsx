"use client";

import { AnimatedCounter } from "./AnimatedCounter";
import type { MonthlyMetricData, ChangeData } from "@/types/report";

const METRICS = [
  {
    key: "views" as const,
    label: "צפיות",
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} className="w-5 h-5">
        <path d="M2 12s3-7 10-7 10 7 10 7-3 7-10 7-10-7-10-7Z" />
        <circle cx="12" cy="12" r="3" />
      </svg>
    ),
    gradient: "from-blue-500 to-cyan-400",
    bg: "from-blue-50 to-cyan-50",
    text: "text-blue-600",
    bar: "bg-gradient-to-r from-blue-500 to-cyan-400",
  },
  {
    key: "reach" as const,
    label: "הגעה",
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} className="w-5 h-5">
        <circle cx="12" cy="12" r="10" />
        <path d="M12 2a14.5 14.5 0 0 0 0 20 14.5 14.5 0 0 0 0-20" />
        <path d="M2 12h20" />
      </svg>
    ),
    gradient: "from-violet-500 to-purple-400",
    bg: "from-violet-50 to-purple-50",
    text: "text-violet-600",
    bar: "bg-gradient-to-r from-violet-500 to-purple-400",
  },
  {
    key: "interactions" as const,
    label: "אינטראקציות",
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} className="w-5 h-5">
        <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
      </svg>
    ),
    gradient: "from-rose-500 to-pink-400",
    bg: "from-rose-50 to-pink-50",
    text: "text-rose-600",
    bar: "bg-gradient-to-r from-rose-500 to-pink-400",
  },
  {
    key: "clicks" as const,
    label: "קליקים",
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} className="w-5 h-5">
        <path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z" />
      </svg>
    ),
    gradient: "from-amber-500 to-orange-400",
    bg: "from-amber-50 to-orange-50",
    text: "text-amber-600",
    bar: "bg-gradient-to-r from-amber-500 to-orange-400",
  },
];

function fmt(n: number | null): number {
  return n ?? 0;
}

function fmtLabel(n: number | null): string {
  if (n === null) return "—";
  if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(1)}M`;
  if (n >= 1_000) return `${(n / 1_000).toFixed(1)}K`;
  return n.toLocaleString("en-US");
}

interface Props {
  current: MonthlyMetricData | null;
  previous: MonthlyMetricData | null;
  changes: ChangeData;
  currentMonthLabel: string;
  previousMonthLabel: string;
}

export function MonthlyComparison({ current, previous, changes, currentMonthLabel, previousMonthLabel }: Props) {
  return (
    <section>
      <h2 className="text-xl font-bold text-[#1a1a2e] mb-4">השוואה חודשית</h2>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {METRICS.map((m, i) => {
          const change = changes[m.key];
          const val = current?.[m.key] ?? null;
          const prevVal = previous?.[m.key] ?? null;
          const isUp = change?.direction === "up";
          const isDown = change?.direction === "down";

          return (
            <div
              key={m.key}
              className="group relative bg-white rounded-2xl overflow-hidden border border-[#e2e8f0] shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-300"
              style={{ animationDelay: `${i * 80}ms` }}
            >
              {/* gradient top bar */}
              <div className={`h-1.5 w-full bg-gradient-to-r ${m.gradient}`} />

              <div className={`absolute inset-0 bg-gradient-to-br ${m.bg} opacity-0 group-hover:opacity-60 transition-opacity duration-300 pointer-events-none`} />

              <div className="relative p-4">
                {/* icon + label */}
                <div className="flex items-center justify-between mb-3">
                  <span className="text-xs font-semibold text-gray-500 uppercase tracking-wider">{m.label}</span>
                  <span className={`${m.text} opacity-70`}>{m.icon}</span>
                </div>

                {/* big number */}
                <div className="mb-1">
                  <div className="text-3xl font-black text-[#1a1a2e] leading-none" dir="ltr">
                    {val !== null
                      ? <AnimatedCounter value={fmt(val)} formatter={fmtLabel} />
                      : "—"}
                  </div>
                  <div className="text-xs text-gray-400 mt-1">{currentMonthLabel}</div>
                </div>

                {/* change pill */}
                {change && (
                  <div className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-bold mt-1 ${
                    isUp
                      ? "bg-emerald-100 text-emerald-700"
                      : isDown
                      ? "bg-red-100 text-red-600"
                      : "bg-gray-100 text-gray-500"
                  }`} dir="ltr">
                    <span>{isUp ? "↑" : isDown ? "↓" : "→"}</span>
                    <span>{Math.abs(change.percent)}%</span>
                  </div>
                )}

                {/* previous month */}
                <div className="mt-3 pt-3 border-t border-[#e2e8f0]">
                  <div className="text-xs text-gray-400 mb-0.5">{previousMonthLabel}</div>
                  <div className="text-sm font-semibold text-gray-500" dir="ltr">
                    {fmtLabel(prevVal)}
                  </div>
                </div>

                {/* mini progress bar */}
                {val !== null && prevVal !== null && prevVal > 0 && (
                  <div className="mt-2 h-1 bg-gray-100 rounded-full overflow-hidden">
                    <div
                      className={`h-full rounded-full transition-all duration-1000 ${m.bar}`}
                      style={{ width: `${Math.min((val / Math.max(val, prevVal)) * 100, 100)}%` }}
                    />
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
}
