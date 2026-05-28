"use client";

import { useState } from "react";
import { Button } from "@/components/ui/Button";

interface Props {
  clientName: string;
  month: string;
}

const HEBREW_MONTHS: Record<string, string> = {
  "01": "ינואר", "02": "פברואר", "03": "מרץ", "04": "אפריל",
  "05": "מאי", "06": "יוני", "07": "יולי", "08": "אוגוסט",
  "09": "ספטמבר", "10": "אוקטובר", "11": "נובמבר", "12": "דצמבר",
};

export function DownloadPDFButton({ clientName, month }: Props) {
  const [loading, setLoading] = useState(false);

  async function handleDownload() {
    setLoading(true);
    try {
      const html2pdf = (await import("html2pdf.js")).default;
      const element = document.getElementById("report-content");
      if (!element) return;

      const [year, mm] = month.split("-");
      const monthLabel = HEBREW_MONTHS[mm] ?? mm;
      const filename = `דוח-קפילוטו-${clientName}-${monthLabel}-${year}.pdf`;

      await html2pdf()
        .set({
          margin: [10, 10, 10, 10],
          filename,
          image: { type: "jpeg", quality: 0.95 },
          html2canvas: { scale: 2, useCORS: true, direction: "rtl" },
          jsPDF: { unit: "mm", format: "a4", orientation: "portrait" },
        })
        .from(element)
        .save();
    } finally {
      setLoading(false);
    }
  }

  return (
    <Button variant="secondary" onClick={handleDownload} disabled={loading}>
      {loading ? "מייצר PDF..." : "⬇ הורד כ-PDF"}
    </Button>
  );
}
