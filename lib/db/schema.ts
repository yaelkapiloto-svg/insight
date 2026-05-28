import {
  pgTable,
  uuid,
  text,
  boolean,
  timestamp,
  date,
  integer,
  bigint,
  jsonb,
  unique,
} from "drizzle-orm/pg-core";

export const clients = pgTable("clients", {
  id: uuid("id").primaryKey().defaultRandom(),
  name: text("name").notNull(),
  logoUrl: text("logo_url"),
  sheetId: text("sheet_id").notNull().default(""),
  driveFolderId: text("drive_folder_id").notNull().default(""),
  magicToken: text("magic_token").notNull().unique(),
  isActive: boolean("is_active").notNull().default(true),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow(),
});

export const reportMonths = pgTable(
  "report_months",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    clientId: uuid("client_id")
      .notNull()
      .references(() => clients.id, { onDelete: "cascade" }),
    month: date("month").notNull(),
    status: text("status").notNull().default("draft"),
    analysisHtml: text("analysis_html"),
    summaryHtml: text("summary_html"),
    publishedAt: timestamp("published_at", { withTimezone: true }),
    syncedAt: timestamp("synced_at", { withTimezone: true }),
    createdAt: timestamp("created_at", { withTimezone: true }).defaultNow(),
    updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow(),
  },
  (t) => [unique().on(t.clientId, t.month)]
);

export const monthlyMetrics = pgTable(
  "monthly_metrics",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    clientId: uuid("client_id")
      .notNull()
      .references(() => clients.id, { onDelete: "cascade" }),
    month: date("month").notNull(),
    filmingDays: integer("filming_days"),
    meetingsCount: integer("meetings_count"),
    views: bigint("views", { mode: "number" }),
    reach: bigint("reach", { mode: "number" }),
    interactions: bigint("interactions", { mode: "number" }),
    clicks: bigint("clicks", { mode: "number" }),
    followersCount: integer("followers_count"),
    followersGrowth: integer("followers_growth"),
    rawData: jsonb("raw_data"),
    createdAt: timestamp("created_at", { withTimezone: true }).defaultNow(),
    updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow(),
  },
  (t) => [unique().on(t.clientId, t.month)]
);

export const contentTypeMetrics = pgTable(
  "content_type_metrics",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    clientId: uuid("client_id")
      .notNull()
      .references(() => clients.id, { onDelete: "cascade" }),
    month: date("month").notNull(),
    contentType: text("content_type").notNull(),
    views: bigint("views", { mode: "number" }),
    reach: bigint("reach", { mode: "number" }),
    interactions: bigint("interactions", { mode: "number" }),
    clicks: bigint("clicks", { mode: "number" }),
    postCount: integer("post_count"),
    rawData: jsonb("raw_data"),
    createdAt: timestamp("created_at", { withTimezone: true }).defaultNow(),
  },
  (t) => [unique().on(t.clientId, t.month, t.contentType)]
);

export const topContent = pgTable(
  "top_content",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    clientId: uuid("client_id")
      .notNull()
      .references(() => clients.id, { onDelete: "cascade" }),
    month: date("month").notNull(),
    metric: text("metric").notNull(),
    contentType: text("content_type").notNull(),
    value: bigint("value", { mode: "number" }),
    driveFileId: text("drive_file_id"),
    screenshotUrl: text("screenshot_url"),
    screenshotCachedAt: timestamp("screenshot_cached_at", {
      withTimezone: true,
    }),
    rawData: jsonb("raw_data"),
  },
  (t) => [unique().on(t.clientId, t.month, t.metric)]
);

export const adminMagicTokens = pgTable("admin_magic_tokens", {
  id: uuid("id").primaryKey().defaultRandom(),
  email: text("email").notNull(),
  token: text("token").notNull().unique(),
  expiresAt: timestamp("expires_at", { withTimezone: true }).notNull(),
  used: boolean("used").notNull().default(false),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow(),
});

export const syncLogs = pgTable("sync_logs", {
  id: uuid("id").primaryKey().defaultRandom(),
  clientId: uuid("client_id").references(() => clients.id, {
    onDelete: "set null",
  }),
  startedAt: timestamp("started_at", { withTimezone: true }).defaultNow(),
  finishedAt: timestamp("finished_at", { withTimezone: true }),
  status: text("status"),
  error: text("error"),
  details: jsonb("details"),
});

export type Client = typeof clients.$inferSelect;
export type NewClient = typeof clients.$inferInsert;
export type ReportMonth = typeof reportMonths.$inferSelect;
export type MonthlyMetric = typeof monthlyMetrics.$inferSelect;
export type ContentTypeMetric = typeof contentTypeMetrics.$inferSelect;
export type TopContent = typeof topContent.$inferSelect;
