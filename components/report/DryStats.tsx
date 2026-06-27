import type { MonthlyMetricData } from "@/types/report";

interface Props {
  metrics: MonthlyMetricData;
}

function formatDate(d: string): string {
  const [, m, day] = d.split("-");
  return `${day}/${m}`;
}

const ITEMS = [
  {
    key: "filming" as const,
    label: "ימי צילום",
    sublabel: "הפקות תוכן",
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} className="w-7 h-7">
        <rect x="2" y="7" width="20" height="14" rx="2" />
        <path d="m16 7-4-4-4 4" />
        <circle cx="12" cy="14" r="3" />
      </svg>
    ),
    gradient: "from-blue-500 to-cyan-400",
    bg: "from-blue-50 to-cyan-50",
    text: "text-blue-600",
    chipBg: "bg-blue-100 text-blue-700",
  },
  {
    key: "meetings" as const,
    label: "פגישות",
    sublabel: "תיאום ואסטרטגיה",
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} className="w-7 h-7">
        <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
        <circle cx="9" cy="7" r="4" />
        <path d="M23 21v-2a4 4 0 0 0-3-3.87" />
        <path d="M16 3.13a4 4 0 0 1 0 7.75" />
      </svg>
    ),
    gradient: "from-violet-500 to-purple-400",
    bg: "from-violet-50 to-purple-50",
    text: "text-violet-600",
    chipBg: "bg-violet-100 text-violet-700",
  },
] as const;

export function DryStats({ metrics }: Props) {
  const filmingCount = metrics.filmingDates.length || metrics.filmingDays || 0;
  const meetingCount = metrics.meetingDates.length || metrics.meetingsCount || 0;
  const counts = { filming: filmingCount, meetings: meetingCount };
  const dates = { filming: metrics.filmingDates, meetings: metrics.meetingDates };

  return (
    <section>
      <h2 className="text-xl font-bold text-[#1a1a2e] mb-4">פעילות החודש</h2>
      <div className="grid grid-cols-2 gap-4">
        {ITEMS.map((item) => (
          <div
            key={item.key}
            className={`relative overflow-hidden bg-gradient-to-br ${item.bg} rounded-2xl border border-white shadow-sm hover:shadow-lg hover:-translate-y-0.5 transition-all duration-300 p-5`}
          >
            {/* gradient accent top */}
            <div className={`absolute top-0 inset-x-0 h-1 bg-gradient-to-r ${item.gradient}`} />

            {/* icon */}
            <div className={`inline-flex items-center justify-center w-12 h-12 rounded-xl bg-white shadow-sm ${item.text} mb-3`}>
              {item.icon}
            </div>

            {/* count */}
            <div className="text-4xl font-black text-[#1a1a2e] leading-none mb-1">
              {counts[item.key] || "—"}
            </div>
            <div className="font-semibold text-[#1a1a2e]">{item.label}</div>
            <div className="text-xs text-gray-500 mb-3">{item.sublabel}</div>

            {/* date chips */}
            {dates[item.key].length > 0 && (
              <div className="flex flex-wrap gap-1.5">
                {dates[item.key].map((d) => (
                  <span
                    key={d}
                    dir="ltr"
                    className={`text-xs font-semibold px-2.5 py-1 rounded-full ${item.chipBg}`}
                  >
                    {formatDate(d)}
                  </span>
                ))}
              </div>
            )}
          </div>
        ))}
      </div>
    </section>
  );
}
