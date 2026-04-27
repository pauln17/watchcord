-- CreateEnum
CREATE TYPE "ConditionType" AS ENUM ('TERM', 'REGEX');

-- CreateEnum
CREATE TYPE "ScopeType" AS ENUM ('GUILD', 'CHANNEL');

-- CreateTable
CREATE TABLE "watch" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "scope" "ScopeType" NOT NULL,
    "guildId" TEXT NOT NULL,
    "channelId" TEXT,

    CONSTRAINT "watch_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "conditions" (
    "id" TEXT NOT NULL,
    "watchId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "type" "ConditionType",
    "targetUserIds" TEXT[],
    "targetRoleIds" TEXT[],
    "value" TEXT,

    CONSTRAINT "conditions_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "conditions" ADD CONSTRAINT "conditions_watchId_fkey" FOREIGN KEY ("watchId") REFERENCES "watch"("id") ON DELETE CASCADE ON UPDATE CASCADE;
