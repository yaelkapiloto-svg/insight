"use client";

import { Button } from "@/components/ui/Button";

export function DownloadPDFButton() {
  function handlePrint() {
    window.print();
  }

  return (
    <Button variant="secondary" onClick={handlePrint}>
      ⬇ הורד כ-PDF
    </Button>
  );
}
