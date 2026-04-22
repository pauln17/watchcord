import type { PrismaClient } from "../../generated/prisma/client";
import type { RedisClientType } from "../lib/redis";
import type { Watch } from "../types/watch";

export interface IWatchService {
  getAllWatches: () => Promise<Watch[]>;
  getWatchById: (id: string, userId: string) => Promise<Watch | null>;
  getUserWatchesByGuild: (guildId: string, userId: string) => Promise<Watch[]>;
  getUserWatchesByGuildAndChannel: (
    guildId: string,
    channelId: string,
    userId: string,
  ) => Promise<Watch[]>;
  createWatch: (watch: Omit<Watch, "id" | "conditions">) => Promise<Watch>;
  updateWatch: (
    id: string,
    userId: string,
    watch: Partial<Omit<Watch, "id" | "conditions">>,
  ) => Promise<Watch | null>;
  deleteWatch: (id: string, userId: string) => Promise<Watch | null>;
}

export class WatchService implements IWatchService {
  private readonly prisma: PrismaClient;
  private readonly redis: RedisClientType;

  constructor(prisma: PrismaClient, redis: RedisClientType) {
    this.prisma = prisma;
    this.redis = redis;
  }

  getAllWatches = async (): Promise<Watch[]> => {
    return await this.prisma.watch.findMany({
      include: {
        conditions: true,
      },
    });
  };

  getWatchById = async (id: string, userId: string): Promise<Watch | null> => {
    return await this.prisma.watch.findFirst({
      where: { id, userId },
      include: { conditions: true },
    });
  };

  getUserWatchesByGuild = async (
    guildId: string,
    userId: string,
  ): Promise<Watch[]> => {
    return await this.prisma.watch.findMany({
      where: { userId, guildId },
      include: {
        conditions: true,
      },
    });
  };

  getUserWatchesByGuildAndChannel = async (
    guildId: string,
    channelId: string,
    userId: string,
  ): Promise<Watch[]> => {
    return await this.prisma.watch.findMany({
      where: { userId, guildId, channelId },
      include: {
        conditions: true,
      },
    });
  };

  createWatch = async (
    watch: Omit<Watch, "id" | "conditions">,
  ): Promise<Watch> => {
    return await this.prisma.watch.create({
      data: watch,
      include: {
        conditions: true,
      },
    });
  };

  updateWatch = async (
    id: string,
    userId: string,
    watch: Partial<Omit<Watch, "id" | "conditions">>,
  ): Promise<Watch | null> => {
    const existing = await this.getWatchById(id, userId);
    if (!existing) {
      return null;
    }

    return await this.prisma.watch.update({
      where: { id: existing.id },
      data: watch,
      include: {
        conditions: true,
      },
    });
  };

  deleteWatch = async (id: string, userId: string): Promise<Watch | null> => {
    const existing = await this.getWatchById(id, userId);
    if (!existing) {
      return null;
    }

    return await this.prisma.watch.delete({
      where: { id: existing.id },
      include: {
        conditions: true,
      },
    });
  };
}
