import Image from "next/image";
import type { TopContentItem } from "@/types/report";

const METRIC_LABELS: Record<string, string> = {
  views: "צפיות",
  reach: "הגעה",
  interactions: "אינטראקציות",
  clicks: "קליקים",
};

const CONTENT_TYPE_LABELS: Record<string, string> = {
  reels: "רילס",
  stories: "סטוריז",
  posts: "פוסטים",
  carousel: "קרוסלה",
};

function fmt(n: number | null): string {
  if (n === null) return "—";
  if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(1)}M`;
  if (n >= 1_000) return `${(n / 1_000).toFixed(1)}K`;
  return n.toLocaleString("he-IL");
}

interface Props {
  items: TopContentItem[];
}

export function TopContent({ items }: Props) {
  if (items.length === 0) return null;

  return (
    <section>
      <h2 className="text-lg font-bold text-[#1a1a2e] mb-3">טופ תוכן החודש</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {items.map((item) => (
          <div
            key={item.metric}
            className="bg-white rounded-2xl border border-[#e2e8f0] overflow-hidden"
          >
            <div className="p-4">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-semibold text-[#1a1a2e]">
                  {METRIC_LABELS[item.metric] ?? item.metric}
                </span>
                <span className="text-xs bg-[#f8f8fb] border border-[#e2e8f0] px-2 py-0.5 rounded-full text-gray-600">
                  {CONTENT_TYPE_LABELS[item.contentType] ?? item.contentType}
                </span>
              </div>
              <div className="text-2xl font-bold text-[#e94560]">{fmt(item.value)}</div>
            </div>

            {item.screenshotUrl && (
              <div className="relative w-full aspect-video bg-[#f8f8fb]">
                <Image
                  src={
                    item.driveFileId
                      ? `/api/drive-image/${item.driveFileId}`
                      : item.screenshotUrl
                  }
                  alt={`טופ תוכן - ${METRIC_LABELS[item.metric] ?? item.metric}`}
                  fill
                  className="object-contain"
                  sizes="(max-width: 768px) 100vw, 50vw"
                />
              </div>
            )}
          </div>
        ))}
      </div>
    </section>
  );
}
