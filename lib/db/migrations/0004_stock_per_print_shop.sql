CREATE TABLE "product_size_stock" (
	"id" text PRIMARY KEY NOT NULL,
	"product_size_id" text NOT NULL,
	"print_shop_id" text NOT NULL,
	"stock" integer DEFAULT 0 NOT NULL
);
--> statement-breakpoint
ALTER TABLE "product_size_stock" ADD CONSTRAINT "product_size_stock_product_size_id_product_size_id_fk" FOREIGN KEY ("product_size_id") REFERENCES "public"."product_size"("id") ON DELETE cascade ON UPDATE no action;
--> statement-breakpoint
ALTER TABLE "product_size_stock" ADD CONSTRAINT "product_size_stock_print_shop_id_print_shop_id_fk" FOREIGN KEY ("print_shop_id") REFERENCES "public"."print_shop"("id") ON DELETE cascade ON UPDATE no action;
--> statement-breakpoint
CREATE INDEX "product_size_stock_productSizeId_idx" ON "product_size_stock" USING btree ("product_size_id");
--> statement-breakpoint
CREATE INDEX "product_size_stock_printShopId_idx" ON "product_size_stock" USING btree ("print_shop_id");
--> statement-breakpoint
CREATE UNIQUE INDEX "product_size_stock_size_shop_uidx" ON "product_size_stock" USING btree ("product_size_id","print_shop_id");
--> statement-breakpoint
INSERT INTO "product_size_stock" ("id", "product_size_id", "print_shop_id", "stock")
SELECT
	"product_size"."id" || '-' || "print_shop"."id",
	"product_size"."id",
	"print_shop"."id",
	GREATEST(0, "product_size"."stock" - (shop_rank - 1) * GREATEST(1, "product_size"."stock" / 4))
FROM "product_size"
CROSS JOIN (
	SELECT "id", ROW_NUMBER() OVER (ORDER BY "name") AS shop_rank
	FROM "print_shop"
) AS "print_shop";
--> statement-breakpoint
ALTER TABLE "product_size" DROP COLUMN "stock";
