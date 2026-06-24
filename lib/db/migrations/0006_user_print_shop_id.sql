ALTER TABLE "user" ADD COLUMN "print_shop_id" text;
--> statement-breakpoint
ALTER TABLE "user" ADD CONSTRAINT "user_print_shop_id_print_shop_id_fk" FOREIGN KEY ("print_shop_id") REFERENCES "public"."print_shop"("id") ON DELETE no action ON UPDATE no action;
