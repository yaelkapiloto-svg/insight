"use client";

import { useRouter, usePathname } from "next/navigation";

const HEBREW_MONTHS: Record<string, string> = {
  "01": "ינואר", "02": "פברואר", "03": "מרץ", "04": "אפריל",
  "05": "מאי", "06": "יוני", "07": "יולי", "08": "אוגוסט",
  "09": "ספטמבר", "10": "אוקטובר", "11": "נובמבר", "12": "דצמבר",
};

function formatMonth(month: string): string {
  const [year, mm] = month.split("-");
  return `${HEBREW_MONTHS[mm] ?? mm} ${year}`;
}

interface Props {
  availableMonths: string[];
  currentMonth: string;
}

export function MonthDropdown({ availableMonths, currentMonth }: Props) {
  const router = useRouter();
  const pathname = usePathname();

  if (availableMonths.length === 0) return null;

  return (
    <div className="flex items-center gap-2">
      <span className="text-xs text-gray-300">חודש:</span>
      <select
        value={currentMonth}
        onChange={(e) => {
          const params = new URLSearchParams({ month: e.target.value });
          router.push(`${pathname}?${params.toString()}`);
        }}
        className="border border-white/20 rounded-lg px-3 py-1.5 text-sm bg-white/10 text-white outline-none focus:border-white cursor-pointer"
      >
        {availableMonths.map((m) => (
          <option key={m} value={m} className="text-[#1a1a2e]">
            {formatMonth(m)}
          </option>
        ))}
      </select>
    </div>
  );
}
