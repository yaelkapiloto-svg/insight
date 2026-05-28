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

  if (availableMonths.length <= 1) return null;

  return (
    <select
      value={currentMonth}
      onChange={(e) => {
        const params = new URLSearchParams({ month: e.target.value });
        router.push(`${pathname}?${params.toString()}`);
      }}
      className="border border-[#e2e8f0] rounded-lg px-3 py-2 text-sm bg-white outline-none focus:border-[#e94560] cursor-pointer"
    >
      {availableMonths.map((m) => (
        <option key={m} value={m}>
          {formatMonth(m)}
        </option>
      ))}
    </select>
  );
}
