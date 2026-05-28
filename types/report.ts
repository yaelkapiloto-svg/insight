export interface MetricSet {
  views: number | null;
  reach: number | null;
  interactions: number | null;
  clicks: number | null;
}

export interface MonthlyMetricData extends MetricSet {
  month: string;
  filmingDays: number | null;
  meetingsCount: number | null;
  followersCount: number | null;
  followersGrowth: number | null;
}

export interface ContentTypeData extends MetricSet {
  contentType: string;
  postCount: number | null;
}

export interface TopContentItem {
  metric: string;
  contentType: string;
  value: number | null;
  screenshotUrl: string | null;
  driveFileId: string | null;
}

export interface FollowerRow {
  month: string;
  followersCount: number | null;
  followersGrowth: number | null;
}

export interface AverageData {
  annual: MetricSet;
  threeMonth: MetricSet;
}

export interface ChangeData {
  views: { absolute: number; percent: number; direction: "up" | "down" | "neutral" } | null;
  reach: { absolute: number; percent: number; direction: "up" | "down" | "neutral" } | null;
  interactions: { absolute: number; percent: number; direction: "up" | "down" | "neutral" } | null;
  clicks: { absolute: number; percent: number; direction: "up" | "down" | "neutral" } | null;
}

export interface ReportData {
  client: {
    id: string;
    name: string;
    logoUrl: string | null;
  };
  month: string;
  status: string;
  analysisHtml: string | null;
  summaryHtml: string | null;
  publishedAt: string | null;
  currentMetrics: MonthlyMetricData | null;
  previousMetrics: MonthlyMetricData | null;
  averages: AverageData;
  changes: ChangeData;
  contentTypes: ContentTypeData[];
  topContent: TopContentItem[];
  followersHistory: FollowerRow[];
  availableMonths: string[];
}
