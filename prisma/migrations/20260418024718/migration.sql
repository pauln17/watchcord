-- CreateEnum
CREATE TYPE "WatchConditionType" AS ENUM ('USER', 'TERM', 'REGEX');

-- CreateTable
CREATE TABLE "watch" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "guildId" TEXT NOT NULL,
    "channelId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "watch_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "watch_conditions" (
    "id" TEXT NOT NULL,
    "watchId" TEXT NOT NULL,
    "type" "WatchConditionType" NOT NULL,
    "value" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "watch_conditions_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "watch_conditions" ADD CONSTRAINT "watch_conditions_watchId_fkey" FOREIGN KEY ("watchId") REFERENCES "watch"("id") ON DELETE CASCADE ON UPDATE CASCADE;
