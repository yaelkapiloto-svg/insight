DELETE FROM "top_content";--> statement-breakpoint
ALTER TABLE "top_content" DROP CONSTRAINT "top_content_client_id_month_metric_unique";--> statement-breakpoint
ALTER TABLE "top_content" ADD CONSTRAINT "top_content_client_id_month_content_type_unique" UNIQUE("client_id","month","content_type");