import { Card } from "@/components/ui/Card";
import type { MonthlyMetricData } from "@/types/report";

interface Props {
  metrics: MonthlyMetricData;
}

export function DryStats({ metrics }: Props) {
  const items = [
    { label: "ימי צילום", value: metrics.filmingDays, icon: "🎬" },
    { label: "פגישות", value: metrics.meetingsCount, icon: "🤝" },
  ];

  return (
    <section>
      <h2 className="text-lg font-bold text-[#1a1a2e] mb-3">פעילות החודש</h2>
      <div className="grid grid-cols-2 gap-4">
        {items.map(({ label, value, icon }) => (
          <Card key={label} className="text-center">
            <div className="text-3xl mb-1">{icon}</div>
            <div className="text-3xl font-bold text-[#1a1a2e]">{value ?? "—"}</div>
            <div className="text-sm text-gray-500 mt-0.5">{label}</div>
          </Card>
        ))}
      </div>
    </section>
  );
}
