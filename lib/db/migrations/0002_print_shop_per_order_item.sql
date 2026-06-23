ALTER TABLE "order_item" ADD COLUMN "print_shop_id" text;--> statement-breakpoint
UPDATE "order_item" SET "print_shop_id" = "order"."print_shop_id" FROM "order" WHERE "order_item"."order_id" = "order"."id";--> statement-breakpoint
ALTER TABLE "order_item" ALTER COLUMN "print_shop_id" SET NOT NULL;--> statement-breakpoint
ALTER TABLE "order_item" ADD CONSTRAINT "order_item_print_shop_id_print_shop_id_fk" FOREIGN KEY ("print_shop_id") REFERENCES "public"."print_shop"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "order" DROP CONSTRAINT "order_print_shop_id_print_shop_id_fk";--> statement-breakpoint
ALTER TABLE "order" DROP COLUMN "print_shop_id";
