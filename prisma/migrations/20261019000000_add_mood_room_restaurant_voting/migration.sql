CREATE TYPE "MoodRoomNominationStatus" AS ENUM ('IDLE', 'GENERATING', 'READY', 'FAILED');

ALTER TABLE "mood_room_sessions"
ADD COLUMN "restaurantNominees" JSONB NOT NULL DEFAULT '[]',
ADD COLUMN "nominationStatus" "MoodRoomNominationStatus" NOT NULL DEFAULT 'IDLE',
ADD COLUMN "nominationStartedAt" TIMESTAMPTZ(6),
ADD COLUMN "nominationError" VARCHAR(300),
ADD COLUMN "selectedRestaurantId" TEXT;
