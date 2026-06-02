import { notFound } from "next/navigation";
import Image from "next/image";
import { getReportData } from "@/lib/reports/getReportData";
import { MonthDropdown } from "@/components/report/MonthDropdown";
import { DryStats } from "@/components/report/DryStats";
import { AverageCards } from "@/components/report/AverageCards";
import { MonthlyComparison } from "@/components/report/MonthlyComparison";
import { TextAnalysis } from "@/components/report/TextAnalysis";
import { FollowersTable } from "@/components/report/FollowersTable";
import { TopContent } from "@/components/report/TopContent";
import { DownloadPDFButton } from "@/components/report/DownloadPDFButton";

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
      <div className="min-h-screen bg-[#f8f8fb] flex items-center justify-center">
        <div className="text-center">
          <Image src="/logo.png" alt="KAPILOTO" width={140} height={50} className="object-contain mx-auto mb-6" />
          <h1 className="text-xl font-bold text-[#1a1a2e]">הדוח עדיין לא פורסם</h1>
          <p className="text-gray-500 mt-2 text-sm">הדוח של {data.client.name} יהיה זמין בקרוב.</p>
        </div>
      </div>
    );
  }

  const currentMonthLabel = formatMonth(data.month);
  const previousMonthLabel = data.previousMetrics ? formatMonth(data.previousMetrics.month) : "חודש קודם";

  return (
    <div className="min-h-screen bg-[#f8f8fb]">
      <header className="bg-white border-b border-[#e2e8f0] sticky top-0 z-10">
        <div className="max-w-4xl mx-auto px-4 h-16 flex items-center justify-between">
          <Image src="/logo.png" alt="KAPILOTO" width={110} height={36} className="object-contain" />
          <div className="flex items-center gap-4">
            {data.client.logoUrl ? (
              <Image
                src={data.client.logoUrl}
                alt={data.client.name}
                width={80}
                height={32}
                className="object-contain"
              />
            ) : (
              <span className="text-sm font-bold text-[#1a1a2e]">{data.client.name}</span>
            )}
          </div>
        </div>
      </header>

      <div className="bg-[#1a1a2e] text-white">
        <div className="max-w-4xl mx-auto px-4 py-4 flex items-center justify-between">
          <div>
            <h1 className="text-lg font-bold">דוח סושיאל מדיה</h1>
            <p className="text-sm text-gray-300 mt-0.5">{data.client.name} · {currentMonthLabel}</p>
          </div>
          <div className="flex items-center gap-3">
            <MonthDropdown
              availableMonths={data.availableMonths}
              currentMonth={data.month}
            />
          </div>
        </div>
      </div>

      <main className="max-w-4xl mx-auto px-4 py-8 space-y-8" id="report-content">
        {data.currentMetrics && (
          <DryStats metrics={data.currentMetrics} />
        )}

        <AverageCards averages={data.averages} />

        <MonthlyComparison
          current={data.currentMetrics}
          previous={data.previousMetrics}
          changes={data.changes}
          currentMonthLabel={currentMonthLabel}
          previousMonthLabel={previousMonthLabel}
        />

        <TextAnalysis html={data.analysisHtml} title="ניתוח המספרים" />

        <FollowersTable history={data.followersHistory} />

        <TopContent items={data.topContent} />

        <TextAnalysis html={data.summaryHtml} title="סיכום ומסקנות" />
      </main>

      <footer className="max-w-4xl mx-auto px-4 py-6 flex items-center justify-between border-t border-[#e2e8f0] mt-4">
        <p className="text-xs text-gray-400">
          {data.publishedAt
            ? `פורסם: ${new Date(data.publishedAt).toLocaleDateString("he-IL")}`
            : ""}
        </p>
        <DownloadPDFButton clientName={data.client.name} month={data.month} />
      </footer>
    </div>
  );
}
