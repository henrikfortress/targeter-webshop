CREATE TABLE "order_fulfillment" (
	"id" text PRIMARY KEY NOT NULL,
	"order_id" text NOT NULL,
	"print_shop_id" text NOT NULL,
	"status" text DEFAULT 'pending' NOT NULL,
	"resend_email_id" text,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "order_fulfillment" ADD CONSTRAINT "order_fulfillment_order_id_order_id_fk" FOREIGN KEY ("order_id") REFERENCES "public"."order"("id") ON DELETE cascade ON UPDATE no action;
--> statement-breakpoint
ALTER TABLE "order_fulfillment" ADD CONSTRAINT "order_fulfillment_print_shop_id_print_shop_id_fk" FOREIGN KEY ("print_shop_id") REFERENCES "public"."print_shop"("id") ON DELETE no action ON UPDATE no action;
--> statement-breakpoint
CREATE INDEX "order_fulfillment_orderId_idx" ON "order_fulfillment" USING btree ("order_id");
--> statement-breakpoint
CREATE UNIQUE INDEX "order_fulfillment_order_print_shop_uidx" ON "order_fulfillment" USING btree ("order_id","print_shop_id");
