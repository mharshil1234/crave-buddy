-- Expand restaurants into the full catalogue record, preserving existing data.
ALTER TABLE "restaurants"
ADD COLUMN     "cost_for_two" INTEGER,
ADD COLUMN     "delivery_time" TEXT,
ADD COLUMN     "is_open" BOOLEAN NOT NULL DEFAULT true,
ADD COLUMN     "locality" TEXT,
ADD COLUMN     "rating" DOUBLE PRECISION,
ADD COLUMN     "rating_count" TEXT;

-- "4.4" -> 4.4 (non-numeric strings become NULL)
UPDATE "restaurants"
SET "rating" = CASE WHEN "avg_rating_string" ~ '^[0-9]+(\.[0-9]+)?$' THEN "avg_rating_string"::DOUBLE PRECISION END;

ALTER TABLE "restaurants" DROP COLUMN "avg_rating_string";

-- "North Indian, Biryani" -> {"North Indian","Biryani"}
ALTER TABLE "restaurants"
ALTER COLUMN "cuisines" TYPE TEXT[] USING COALESCE(string_to_array("cuisines", ', '), ARRAY[]::TEXT[]),
ALTER COLUMN "cuisines" SET DEFAULT ARRAY[]::TEXT[];

-- CreateTable
CREATE TABLE "menu_items" (
    "id" TEXT NOT NULL,
    "restaurant_id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT NOT NULL DEFAULT '',
    "price" INTEGER NOT NULL,
    "veg" BOOLEAN NOT NULL,
    "category" TEXT NOT NULL DEFAULT '',
    "rating" DOUBLE PRECISION,
    "img" TEXT NOT NULL DEFAULT '',

    CONSTRAINT "menu_items_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "menu_items_restaurant_id_idx" ON "menu_items"("restaurant_id");

-- AddForeignKey
ALTER TABLE "menu_items" ADD CONSTRAINT "menu_items_restaurant_id_fkey" FOREIGN KEY ("restaurant_id") REFERENCES "restaurants"("id") ON DELETE CASCADE ON UPDATE CASCADE;
