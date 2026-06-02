CREATE TABLE "admin_magic_tokens" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"email" text NOT NULL,
	"token" text NOT NULL,
	"expires_at" timestamp with time zone NOT NULL,
	"used" boolean DEFAULT false NOT NULL,
	"created_at" timestamp with time zone DEFAULT now(),
	CONSTRAINT "admin_magic_tokens_token_unique" UNIQUE("token")
);
--> statement-breakpoint
CREATE TABLE "clients" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"name" text NOT NULL,
	"logo_url" text,
	"sheet_id" text DEFAULT '' NOT NULL,
	"drive_folder_id" text DEFAULT '' NOT NULL,
	"magic_token" text NOT NULL,
	"is_active" boolean DEFAULT true NOT NULL,
	"created_at" timestamp with time zone DEFAULT now(),
	"updated_at" timestamp with time zone DEFAULT now(),
	CONSTRAINT "clients_magic_token_unique" UNIQUE("magic_token")
);
--> statement-breakpoint
CREATE TABLE "content_type_metrics" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"client_id" uuid NOT NULL,
	"month" date NOT NULL,
	"content_type" text NOT NULL,
	"views" bigint,
	"reach" bigint,
	"interactions" bigint,
	"clicks" bigint,
	"post_count" integer,
	"raw_data" jsonb,
	"created_at" timestamp with time zone DEFAULT now(),
	CONSTRAINT "content_type_metrics_client_id_month_content_type_unique" UNIQUE("client_id","month","content_type")
);
--> statement-breakpoint
CREATE TABLE "monthly_metrics" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"client_id" uuid NOT NULL,
	"month" date NOT NULL,
	"filming_days" integer,
	"meetings_count" integer,
	"views" bigint,
	"reach" bigint,
	"interactions" bigint,
	"clicks" bigint,
	"followers_count" integer,
	"followers_growth" integer,
	"raw_data" jsonb,
	"created_at" timestamp with time zone DEFAULT now(),
	"updated_at" timestamp with time zone DEFAULT now(),
	CONSTRAINT "monthly_metrics_client_id_month_unique" UNIQUE("client_id","month")
);
--> statement-breakpoint
CREATE TABLE "report_months" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"client_id" uuid NOT NULL,
	"month" date NOT NULL,
	"status" text DEFAULT 'draft' NOT NULL,
	"analysis_html" text,
	"summary_html" text,
	"published_at" timestamp with time zone,
	"synced_at" timestamp with time zone,
	"created_at" timestamp with time zone DEFAULT now(),
	"updated_at" timestamp with time zone DEFAULT now(),
	CONSTRAINT "report_months_client_id_month_unique" UNIQUE("client_id","month")
);
--> statement-breakpoint
CREATE TABLE "sync_logs" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"client_id" uuid,
	"started_at" timestamp with time zone DEFAULT now(),
	"finished_at" timestamp with time zone,
	"status" text,
	"error" text,
	"details" jsonb
);
--> statement-breakpoint
CREATE TABLE "top_content" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"client_id" uuid NOT NULL,
	"month" date NOT NULL,
	"metric" text NOT NULL,
	"content_type" text NOT NULL,
	"value" bigint,
	"drive_file_id" text,
	"screenshot_url" text,
	"screenshot_cached_at" timestamp with time zone,
	"raw_data" jsonb,
	CONSTRAINT "top_content_client_id_month_metric_unique" UNIQUE("client_id","month","metric")
);
--> statement-breakpoint
ALTER TABLE "content_type_metrics" ADD CONSTRAINT "content_type_metrics_client_id_clients_id_fk" FOREIGN KEY ("client_id") REFERENCES "public"."clients"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "monthly_metrics" ADD CONSTRAINT "monthly_metrics_client_id_clients_id_fk" FOREIGN KEY ("client_id") REFERENCES "public"."clients"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "report_months" ADD CONSTRAINT "report_months_client_id_clients_id_fk" FOREIGN KEY ("client_id") REFERENCES "public"."clients"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "sync_logs" ADD CONSTRAINT "sync_logs_client_id_clients_id_fk" FOREIGN KEY ("client_id") REFERENCES "public"."clients"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "top_content" ADD CONSTRAINT "top_content_client_id_clients_id_fk" FOREIGN KEY ("client_id") REFERENCES "public"."clients"("id") ON DELETE cascade ON UPDATE no action;