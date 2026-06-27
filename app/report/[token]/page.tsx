import { notFound } from "next/navigation";
import { getReportData } from "@/lib/reports/getReportData";
import { ReportHero } from "@/components/report/ReportHero";
import { DryStats } from "@/components/report/DryStats";
import { AverageCards } from "@/components/report/AverageCards";
import { MonthlyComparison } from "@/components/report/MonthlyComparison";
import { TextAnalysis } from "@/components/report/TextAnalysis";
import { FollowersTable } from "@/components/report/FollowersTable";
import { TopContent } from "@/components/report/TopContent";
import { DownloadPDFButton } from "@/components/report/DownloadPDFButton";
import Image from "next/image";

export const dynamic = "force-dynamic";

const HEBREW_MONTHS: Record<string, string> = {
  "01": "ינואר", "02": "פברואר", "03": "מרץ", "04": "אפריל",
  "05": "מאי", "06": "יוני", "07": "יולי", "08": "אוגוסט",
  "09": "ספטמבר", "10": "אוקטובר", "11": "נובמבר", "12": "דצמבר",
};

function formatMonth(month: string): string {
  const [year, mm] = month.split("-");
  return `${HEBREW_MONTHS[mm] ?? mm} ${year}`;
}

export default async function ReportPage({
  params,
  searchParams,
}: {
  params: Promise<{ token: string }>;
  searchParams: Promise<{ month?: string }>;
}) {
  const { token } = await params;
  const { month: monthParam } = await searchParams;

  const data = await getReportData(token, monthParam ?? null);

  if ("notFound" in data) notFound();

  if ("needsPublish" in data) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-[#1a1a2e] via-[#2d1b69] to-[#7c3aed] flex items-center justify-center">
        <div className="text-center bg-white/10 backdrop-blur-md border border-white/20 rounded-3xl p-10 mx-4">
          <Image src="/logo.png" alt="KAPILOTO" width={140} height={50} className="object-contain mx-auto mb-6 brightness-0 invert" />
          <h1 className="text-xl font-bold text-white">הדוח עדיין לא פורסם</h1>
          <p className="text-white/60 mt-2 text-sm">הדוח של {data.client.name} יהיה זמין בקרוב.</p>
        </div>
      </div>
    );
  }

  const currentMonthLabel = formatMonth(data.month);
  const previousMonthLabel = data.previousMetrics ? formatMonth(data.previousMetrics.month) : "חודש קודם";

  return (
    <div className="min-h-screen bg-[#f5f5fb]">

      {/* Premium gradient hero */}
      <ReportHero
        clientName={data.client.name}
        clientLogoUrl={data.client.logoUrl}
        monthLabel={currentMonthLabel}
        metrics={data.currentMetrics}
        availableMonths={data.availableMonths}
        currentMonth={data.month}
      />

      {/* Main content */}
      <main className="max-w-4xl mx-auto px-4 py-10 space-y-10" id="report-content">
        {data.currentMetrics && (
          <DryStats metrics={data.currentMetrics} />
        )}

        <MonthlyComparison
          current={data.currentMetrics}
          previous={data.previousMetrics}
          changes={data.changes}
          currentMonthLabel={currentMonthLabel}
          previousMonthLabel={previousMonthLabel}
        />

        <AverageCards averages={data.averages} />

        <TextAnalysis html={data.analysisHtml} title="ניתוח המספרים" />

        <FollowersTable history={data.followersHistory} />

        <TopContent items={data.topContent} />

        <TextAnalysis html={data.summaryHtml} title="סיכום ומסקנות" />
      </main>

      {/* Footer */}
      <footer className="max-w-4xl mx-auto px-4 py-8 mt-4">
        <div className="flex items-center justify-between border-t border-[#e2e8f0] pt-6">
          <p className="text-xs text-gray-400">
            {data.publishedAt
              ? `פורסם: ${new Date(data.publishedAt).toLocaleDateString("he-IL")}`
              : ""}
          </p>
          <DownloadPDFButton />
        </div>
      </footer>
    </div>
  );
}
