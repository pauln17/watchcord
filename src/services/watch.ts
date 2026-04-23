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
  createWatch: (data: Omit<Watch, "id" | "conditions">) => Promise<Watch>;
  updateWatch: (
    id: string,
    userId: string,
    data: Partial<Omit<Watch, "id" | "conditions">>,
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

  private updateRedis = async (
    operation: "CREATE" | "DELETE",
    watch: Watch,
  ): Promise<void> => {
    switch (operation) {
      case "CREATE":
        await this.redis.set(`wc:watches:${watch.id}`, JSON.stringify(watch));
        switch (watch.scope) {
          case "GUILD":
            await this.redis.sAdd(`wc:guilds:${watch.guildId}`, watch.id);
            break;
          case "CHANNEL":
            if (watch.channelId) {
              await this.redis.sAdd(
                `wc:guilds:${watch.guildId}:channels:${watch.channelId}`,
                watch.id,
              );
            }
            break;
        }
        await this.redis.sAdd(`wc:guilds:${watch.guildId}:all`, watch.id);
        break;
      case "DELETE":
        await this.redis.del(`wc:watches:${watch.id}`);
        switch (watch.scope) {
          case "GUILD":
            await this.redis.sRem(`wc:guilds:${watch.guildId}`, watch.id);
            break;
          case "CHANNEL":
            if (watch.channelId) {
              await this.redis.sRem(
                `wc:guilds:${watch.guildId}:channels:${watch.channelId}`,
                watch.id,
              );
            }
            break;
        }
        await this.redis.sRem(`wc:guilds:${watch.guildId}:all`, watch.id);
        break;
    }
  };

  getAllWatches = async (): Promise<Watch[]> => {
    return await this.prisma.watch.findMany({
      include: {
        conditions: true,
      },
    });
  };

  getWatchById = async (id: string, userId: string): Promise<Watch | null> => {
    const cached = await this.redis.get(`wc:watches:${id}`);
    if (cached) {
      const watch = JSON.parse(cached) as Watch;
      if (watch.userId === userId) return watch;
    }

    return await this.prisma.watch.findFirst({
      where: { id, userId },
      include: { conditions: true },
    });
  };

  getUserWatchesByGuild = async (
    guildId: string,
    userId: string,
  ): Promise<Watch[]> => {
    const ids = await this.redis.sMembers(`wc:guilds:${guildId}:all`);
    if (ids.length > 0) {
      const keys = ids.map((id) => `wc:watches:${id}`);
      const cached = await this.redis.mGet(keys);
      const watches = cached
        .filter((watch): watch is string => watch !== null)
        .map((watch) => JSON.parse(watch) as Watch)
        .filter((watch) => watch.userId === userId);
      if (watches.length > 0) return watches;
    }

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
    const ids = await this.redis.sMembers(
      `wc:guilds:${guildId}:channels:${channelId}`,
    );
    if (ids.length > 0) {
      const keys = ids.map((id) => `wc:watches:${id}`);
      const cached = await this.redis.mGet(keys);
      const watches = cached
        .filter((watch): watch is string => watch !== null)
        .map((watch) => JSON.parse(watch) as Watch)
        .filter((watch) => watch.userId === userId);
      if (watches.length > 0) return watches;
    }

    return await this.prisma.watch.findMany({
      where: { userId, guildId, channelId },
      include: {
        conditions: true,
      },
    });
  };

  createWatch = async (
    data: Omit<Watch, "id" | "conditions">,
  ): Promise<Watch> => {
    const watch = await this.prisma.watch.create({
      data,
      include: {
        conditions: true,
      },
    });

    await this.updateRedis("CREATE", watch);

    return watch;
  };

  updateWatch = async (
    id: string,
    userId: string,
    data: Partial<Omit<Watch, "id" | "conditions">>,
  ): Promise<Watch | null> => {
    const existing = await this.getWatchById(id, userId);
    if (!existing) {
      return null;
    }

    const updated = await this.prisma.watch.update({
      where: { id: existing.id },
      data,
      include: {
        conditions: true,
      },
    });

    await this.updateRedis("DELETE", existing);
    await this.updateRedis("CREATE", updated);

    return updated;
  };
  deleteWatch = async (id: string, userId: string): Promise<Watch | null> => {
    const deleted = await this.prisma.watch.delete({
      where: { id, userId },
      include: {
        conditions: true,
      },
    });

    await this.updateRedis("DELETE", deleted);

    return deleted;
  };
}
