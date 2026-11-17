-- Clean up rows that would violate the new constraints (e.g. test data with fake user ids).
UPDATE "mood_boards" SET "creator_id" = NULL
WHERE "creator_id" IS NOT NULL AND NOT EXISTS (SELECT 1 FROM "user" WHERE "user"."id" = "mood_boards"."creator_id");

DELETE FROM "saved_mood_boards"
WHERE NOT EXISTS (SELECT 1 FROM "user" WHERE "user"."id" = "saved_mood_boards"."user_id")
   OR NOT EXISTS (SELECT 1 FROM "mood_boards" WHERE "mood_boards"."id" = "saved_mood_boards"."mood_board_id");

-- AddForeignKey
ALTER TABLE "mood_boards" ADD CONSTRAINT "mood_boards_creator_id_fkey" FOREIGN KEY ("creator_id") REFERENCES "user"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "saved_mood_boards" ADD CONSTRAINT "saved_mood_boards_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "user"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "saved_mood_boards" ADD CONSTRAINT "saved_mood_boards_mood_board_id_fkey" FOREIGN KEY ("mood_board_id") REFERENCES "mood_boards"("id") ON DELETE CASCADE ON UPDATE CASCADE;
