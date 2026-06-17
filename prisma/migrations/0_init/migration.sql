-- CreateSchema
CREATE SCHEMA IF NOT EXISTS "public";

-- CreateTable
CREATE TABLE "mood_boards" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "created_at" TIMESTAMPTZ(6) DEFAULT CURRENT_TIMESTAMP,
    "user_id" TEXT NOT NULL,
    "query" TEXT NOT NULL,
    "is_veg" BOOLEAN NOT NULL,
    "mood_board" JSONB NOT NULL,

    CONSTRAINT "mood_boards_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "restaurants" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "cloudinary_image_id" TEXT,
    "area_name" TEXT,
    "cuisines" TEXT,
    "avg_rating_string" TEXT,

    CONSTRAINT "restaurants_pkey" PRIMARY KEY ("id")
);

