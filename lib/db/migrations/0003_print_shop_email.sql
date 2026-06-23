ALTER TABLE "print_shop" ADD COLUMN "email" text NOT NULL DEFAULT '';--> statement-breakpoint
ALTER TABLE "print_shop" ALTER COLUMN "email" DROP DEFAULT;
