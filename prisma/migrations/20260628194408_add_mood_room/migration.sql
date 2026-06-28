-- CreateEnum
CREATE TYPE "MoodRoomStatus" AS ENUM ('ACTIVE', 'ARCHIVED');

-- CreateEnum
CREATE TYPE "MoodRoomSessionStatus" AS ENUM ('ACTIVE', 'ENDED');

-- CreateEnum
CREATE TYPE "MoodRoomPhase" AS ENUM ('LOBBY', 'PROMPT_COLLECTION', 'RESTAURANT_VOTING', 'ITEM_VOTING', 'FINISHED');

-- CreateTable
CREATE TABLE "mood_rooms" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "name" VARCHAR(100) NOT NULL,
    "hostId" TEXT NOT NULL,
    "status" "MoodRoomStatus" NOT NULL DEFAULT 'ACTIVE',
    "createdAt" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMPTZ(6) NOT NULL,
    "lastActivityAt" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "maxMembers" INTEGER NOT NULL DEFAULT 8,

    CONSTRAINT "mood_rooms_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "mood_room_invites" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "roomId" UUID NOT NULL,
    "code" VARCHAR(12) NOT NULL,
    "expiresAt" TIMESTAMPTZ(6),
    "revokedAt" TIMESTAMPTZ(6),
    "createdAt" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "mood_room_invites_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "mood_room_members" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "roomId" UUID NOT NULL,
    "userId" TEXT,
    "displayName" VARCHAR(50) NOT NULL,
    "joinedAt" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "leftAt" TIMESTAMPTZ(6),
    "inviteId" UUID,

    CONSTRAINT "mood_room_members_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "mood_room_sessions" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "title" VARCHAR(100),
    "roomId" UUID NOT NULL,
    "status" "MoodRoomSessionStatus" NOT NULL DEFAULT 'ACTIVE',
    "phase" "MoodRoomPhase" NOT NULL DEFAULT 'LOBBY',
    "startedAt" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "endedAt" TIMESTAMPTZ(6),
    "updatedAt" TIMESTAMPTZ(6) NOT NULL,

    CONSTRAINT "mood_room_sessions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "mood_room_messages" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "sessionId" UUID NOT NULL,
    "memberId" UUID NOT NULL,
    "content" TEXT NOT NULL,
    "createdAt" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "editedAt" TIMESTAMPTZ(6),

    CONSTRAINT "mood_room_messages_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "mood_room_prompts" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "sessionId" UUID NOT NULL,
    "memberId" UUID NOT NULL,
    "prompt" TEXT NOT NULL,
    "createdAt" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "mood_room_prompts_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "mood_room_restaurant_votes" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "sessionId" UUID NOT NULL,
    "memberId" UUID NOT NULL,
    "restaurantId" TEXT NOT NULL,
    "createdAt" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "mood_room_restaurant_votes_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "mood_room_item_votes" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "sessionId" UUID NOT NULL,
    "memberId" UUID NOT NULL,
    "itemId" TEXT NOT NULL,
    "quantity" INTEGER NOT NULL DEFAULT 1,
    "createdAt" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "mood_room_item_votes_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "mood_room_final_selections" (
    "sessionId" UUID NOT NULL,
    "restaurantId" TEXT NOT NULL,
    "restaurant" JSONB NOT NULL,
    "items" JSONB NOT NULL,
    "createdAt" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "mood_room_final_selections_pkey" PRIMARY KEY ("sessionId")
);

-- CreateIndex
CREATE INDEX "mood_rooms_hostId_idx" ON "mood_rooms"("hostId");

-- CreateIndex
CREATE INDEX "mood_rooms_status_idx" ON "mood_rooms"("status");

-- CreateIndex
CREATE UNIQUE INDEX "mood_room_invites_code_key" ON "mood_room_invites"("code");

-- CreateIndex
CREATE INDEX "mood_room_invites_roomId_idx" ON "mood_room_invites"("roomId");

-- CreateIndex
CREATE INDEX "mood_room_members_roomId_displayName_idx" ON "mood_room_members"("roomId", "displayName");

-- CreateIndex
CREATE INDEX "mood_room_members_roomId_idx" ON "mood_room_members"("roomId");

-- CreateIndex
CREATE INDEX "mood_room_members_userId_idx" ON "mood_room_members"("userId");

-- CreateIndex
CREATE INDEX "mood_room_members_inviteId_idx" ON "mood_room_members"("inviteId");

-- CreateIndex
CREATE INDEX "mood_room_sessions_roomId_idx" ON "mood_room_sessions"("roomId");

-- CreateIndex
CREATE INDEX "mood_room_sessions_status_idx" ON "mood_room_sessions"("status");

-- CreateIndex
CREATE INDEX "mood_room_sessions_roomId_status_idx" ON "mood_room_sessions"("roomId", "status");

-- CreateIndex
CREATE INDEX "mood_room_messages_sessionId_createdAt_idx" ON "mood_room_messages"("sessionId", "createdAt");

-- CreateIndex
CREATE INDEX "mood_room_messages_memberId_idx" ON "mood_room_messages"("memberId");

-- CreateIndex
CREATE INDEX "mood_room_prompts_sessionId_idx" ON "mood_room_prompts"("sessionId");

-- CreateIndex
CREATE UNIQUE INDEX "mood_room_prompts_sessionId_memberId_key" ON "mood_room_prompts"("sessionId", "memberId");

-- CreateIndex
CREATE INDEX "mood_room_restaurant_votes_sessionId_idx" ON "mood_room_restaurant_votes"("sessionId");

-- CreateIndex
CREATE INDEX "mood_room_restaurant_votes_sessionId_restaurantId_idx" ON "mood_room_restaurant_votes"("sessionId", "restaurantId");

-- CreateIndex
CREATE UNIQUE INDEX "mood_room_restaurant_votes_sessionId_memberId_key" ON "mood_room_restaurant_votes"("sessionId", "memberId");

-- CreateIndex
CREATE INDEX "mood_room_item_votes_sessionId_idx" ON "mood_room_item_votes"("sessionId");

-- CreateIndex
CREATE INDEX "mood_room_item_votes_sessionId_itemId_idx" ON "mood_room_item_votes"("sessionId", "itemId");

-- CreateIndex
CREATE UNIQUE INDEX "mood_room_item_votes_sessionId_memberId_itemId_key" ON "mood_room_item_votes"("sessionId", "memberId", "itemId");

-- AddForeignKey
ALTER TABLE "mood_rooms" ADD CONSTRAINT "mood_rooms_hostId_fkey" FOREIGN KEY ("hostId") REFERENCES "user"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "mood_room_invites" ADD CONSTRAINT "mood_room_invites_roomId_fkey" FOREIGN KEY ("roomId") REFERENCES "mood_rooms"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "mood_room_members" ADD CONSTRAINT "mood_room_members_roomId_fkey" FOREIGN KEY ("roomId") REFERENCES "mood_rooms"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "mood_room_members" ADD CONSTRAINT "mood_room_members_userId_fkey" FOREIGN KEY ("userId") REFERENCES "user"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "mood_room_members" ADD CONSTRAINT "mood_room_members_inviteId_fkey" FOREIGN KEY ("inviteId") REFERENCES "mood_room_invites"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "mood_room_sessions" ADD CONSTRAINT "mood_room_sessions_roomId_fkey" FOREIGN KEY ("roomId") REFERENCES "mood_rooms"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "mood_room_messages" ADD CONSTRAINT "mood_room_messages_sessionId_fkey" FOREIGN KEY ("sessionId") REFERENCES "mood_room_sessions"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "mood_room_messages" ADD CONSTRAINT "mood_room_messages_memberId_fkey" FOREIGN KEY ("memberId") REFERENCES "mood_room_members"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "mood_room_prompts" ADD CONSTRAINT "mood_room_prompts_sessionId_fkey" FOREIGN KEY ("sessionId") REFERENCES "mood_room_sessions"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "mood_room_prompts" ADD CONSTRAINT "mood_room_prompts_memberId_fkey" FOREIGN KEY ("memberId") REFERENCES "mood_room_members"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "mood_room_restaurant_votes" ADD CONSTRAINT "mood_room_restaurant_votes_sessionId_fkey" FOREIGN KEY ("sessionId") REFERENCES "mood_room_sessions"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "mood_room_restaurant_votes" ADD CONSTRAINT "mood_room_restaurant_votes_memberId_fkey" FOREIGN KEY ("memberId") REFERENCES "mood_room_members"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "mood_room_item_votes" ADD CONSTRAINT "mood_room_item_votes_sessionId_fkey" FOREIGN KEY ("sessionId") REFERENCES "mood_room_sessions"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "mood_room_item_votes" ADD CONSTRAINT "mood_room_item_votes_memberId_fkey" FOREIGN KEY ("memberId") REFERENCES "mood_room_members"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "mood_room_final_selections" ADD CONSTRAINT "mood_room_final_selections_sessionId_fkey" FOREIGN KEY ("sessionId") REFERENCES "mood_room_sessions"("id") ON DELETE CASCADE ON UPDATE CASCADE;
