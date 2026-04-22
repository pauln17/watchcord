import type { PrismaClient } from "../../generated/prisma/client";
import type { RedisClientType } from "../lib/redis";
import type { Watch } from "../types/watch";

export interface IWatchService {
  getWatchById: (id: string, userId: string) => Promise<Watch | null>;
  getUserWatchesByGuild: (
    name: string,
    userId: string,
  ) => Promise<Watch[] | null>;
  getUserWatchesByGuildAndChannel: (
    guildId: string,
    channelId: string,
    userId: string,
  ) => Promise<Watch[] | null>;
  createWatch: (watch: Omit<Watch, "id" | "conditions">) => Promise<Watch>;
  updateWatch: (
    id: string,
    userId: string,
    watch: Partial<Watch>,
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

  getWatchById = async (id: string, userId: string): Promise<Watch | null> => {
    return await this.prisma.watch.findFirst({
      where: { id, userId },
      include: { conditions: true },
    });
  };

  getUserWatchesByGuild = async (
    guildId: string,
    userId: string,
  ): Promise<Watch[] | null> => {
    return await this.prisma.watch.findMany({
      where: { guildId, userId },
      include: { conditions: true },
    });
  };

  getUserWatchesByGuildAndChannel = async (
    guildId: string,
    channelId: string,
    userId: string,
  ): Promise<Watch[] | null> => {
    return await this.prisma.watch.findMany({
      where: { guildId, channelId, userId },
      include: { conditions: true },
    });
  };

  createWatch = async (
    watch: Omit<Watch, "id" | "conditions">,
  ): Promise<Watch> => {
    return await this.prisma.watch.create({
      data: {
        name: watch.name,
        userId: watch.userId,
        guildId: watch.guildId,
        channelId: watch.channelId,
      },
      include: {
        conditions: true,
      },
    });
  };

  updateWatch = async (
    id: string,
    userId: string,
    watch: Partial<Watch>,
  ): Promise<Watch | null> => {
    const existing = await this.getWatchById(id, userId);
    if (!existing) {
      return null;
    }

    return await this.prisma.watch.update({
      where: { id: existing.id },
      data: {
        name: watch.name ?? existing.name,
        channelId: watch.channelId ?? existing.channelId,
      },
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
