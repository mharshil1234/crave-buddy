/*
  Warnings:

  - You are about to drop the column `user_id` on the `mood_boards` table. All the data in the column will be lost.
  - Made the column `created_at` on table `mood_boards` required. This step will fail if there are existing NULL values in that column.

*/
-- AlterTable
ALTER TABLE "mood_boards" DROP COLUMN "user_id",
ADD COLUMN     "creator_id" TEXT,
ALTER COLUMN "created_at" SET NOT NULL;

-- CreateTable
CREATE TABLE "saved_mood_boards" (
    "user_id" TEXT NOT NULL,
    "mood_board_id" UUID NOT NULL,
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "saved_mood_boards_pkey" PRIMARY KEY ("user_id","mood_board_id")
);

-- CreateIndex
CREATE INDEX "saved_mood_boards_user_id_idx" ON "saved_mood_boards"("user_id");

-- CreateIndex
CREATE INDEX "saved_mood_boards_mood_board_id_idx" ON "saved_mood_boards"("mood_board_id");

-- CreateIndex
CREATE INDEX "mood_boards_creator_id_idx" ON "mood_boards"("creator_id");

-- CreateIndex
CREATE INDEX "mood_boards_created_at_idx" ON "mood_boards"("created_at");
