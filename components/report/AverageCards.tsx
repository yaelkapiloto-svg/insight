"use client";

import { AnimatedCounter } from "./AnimatedCounter";
import type { AverageData } from "@/types/report";

const METRICS = [
  { key: "views" as const, label: "צפיות", color: "text-blue-600", dot: "bg-blue-500" },
  { key: "reach" as const, label: "הגעה", color: "text-violet-600", dot: "bg-violet-500" },
  { key: "interactions" as const, label: "אינטראקציות", color: "text-rose-600", dot: "bg-rose-500" },
  { key: "clicks" as const, label: "קליקים", color: "text-amber-600", dot: "bg-amber-500" },
];

function formatNum(n: number | null): string {
  if (n === null) return "—";
  if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(1)}M`;
  if (n >= 1_000) return `${(n / 1_000).toFixed(1)}K`;
  return n.toLocaleString("en-US");
}

interface Props {
  averages: AverageData;
}

export function AverageCards({ averages }: Props) {
  return (
    <section>
      <h2 className="text-xl font-bold text-[#1a1a2e] mb-4">ממוצעים</h2>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {METRICS.map((m) => {
          const annual = averages.annual[m.key];
          const three = averages.threeMonth[m.key];
          const ratio = annual && three && annual > 0 ? Math.min(three / annual, 2) : null;

          return (
            <div
              key={m.key}
              className="bg-white rounded-2xl border border-[#e2e8f0] p-4 shadow-sm hover:shadow-lg hover:-translate-y-0.5 transition-all duration-300"
            >
              <div className="flex items-center gap-2 mb-4">
                <span className={`w-2 h-2 rounded-full ${m.dot}`} />
                <span className="text-xs font-semibold text-gray-500 uppercase tracking-wider">{m.label}</span>
              </div>

              <div className="space-y-3">
                <div>
                  <div className="text-xs text-gray-400 mb-0.5">ממוצע שנתי</div>
                  <div className={`text-xl font-bold ${m.color}`} dir="ltr">
                    {annual !== null
                      ? <AnimatedCounter value={annual} formatter={formatNum} />
                      : "—"}
                  </div>
                </div>

                {/* comparison bar */}
                {ratio !== null && (
                  <div className="relative h-1.5 bg-gray-100 rounded-full overflow-hidden">
                    <div className="absolute inset-y-0 right-0 w-full bg-gray-100 rounded-full" />
                    <div
                      className={`absolute inset-y-0 right-0 rounded-full transition-all duration-1000 ${m.dot}`}
                      style={{ width: `${Math.min(ratio * 50, 100)}%` }}
                    />
                  </div>
                )}

                <div>
                  <div className="text-xs text-gray-400 mb-0.5">ממוצע 3 חודשים</div>
                  <div className="text-lg font-bold text-[#1a1a2e]" dir="ltr">
                    {three !== null
                      ? <AnimatedCounter value={three} formatter={formatNum} />
                      : "—"}
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
}
