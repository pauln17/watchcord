import type { RedisClientType } from "../lib/redis";
import type { IWatchRepository } from "../repositories";
import type { Watch } from "../types";

export interface IWatchService {
  getUserWatch: (id: string, userId: string) => Promise<Watch | null>;
  getUserWatches: (userId: string, guildId: string) => Promise<Watch[]>;
  createUserWatch: (data: Omit<Watch, "id" | "conditions">) => Promise<Watch>;
  updateUserWatch: (
    id: string,
    userId: string,
    data: Partial<Pick<Watch, "name" | "scope" | "channelId">>,
  ) => Promise<Watch | null>;
  deleteUserWatch: (id: string, userId: string) => Promise<Watch | null>;
}

export class WatchService implements IWatchService {
  constructor(
    private readonly watchRepository: IWatchRepository,
    private readonly redis: RedisClientType,
  ) {}

  private updateRedis = async (
    operation: "CREATE" | "DELETE",
    watch: Watch,
  ): Promise<void> => {
    switch (operation) {
      case "CREATE":
        await this.redis.set(`wc:watches:${watch.id}`, JSON.stringify(watch));
        await this.redis.sAdd(
          `wc:users:${watch.userId}:guilds:${watch.guildId}`,
          watch.id,
        );
        switch (watch.scope) {
          case "GUILD":
            await this.redis.sAdd(
              `wc:scopes:guilds:${watch.guildId}`,
              watch.id,
            );
            break;
          case "CHANNEL":
            if (watch.channelId) {
              await this.redis.sAdd(
                `wc:scopes:channels:${watch.channelId}`,
                watch.id,
              );
            }
            break;
        }
        break;
      case "DELETE":
        await this.redis.del(`wc:watches:${watch.id}`);
        await this.redis.sRem(
          `wc:users:${watch.userId}:guilds:${watch.guildId}`,
          watch.id,
        );
        switch (watch.scope) {
          case "GUILD":
            await this.redis.sRem(
              `wc:scopes:guilds:${watch.guildId}`,
              watch.id,
            );
            break;
          case "CHANNEL":
            if (watch.channelId) {
              await this.redis.sRem(
                `wc:scopes:channels:${watch.channelId}`,
                watch.id,
              );
            }
            break;
        }
        break;
    }
  };

  getUserWatch = async (id: string, userId: string): Promise<Watch | null> => {
    const cached = await this.redis.get(`wc:watches:${id}`);
    if (cached) {
      const watch = JSON.parse(cached) as Watch;
      if (watch.userId === userId) return watch;
    }

    const watch = await this.watchRepository.findById(id);
    if (!watch || watch.userId !== userId) {
      return null;
    }

    await this.updateRedis("CREATE", watch);

    return watch;
  };

  getUserWatches = async (
    userId: string,
    guildId: string,
  ): Promise<Watch[]> => {
    const ids = await this.redis.sMembers(
      `wc:users:${userId}:guilds:${guildId}`,
    );
    if (ids.length > 0) {
      const keys = ids.map((id) => `wc:watches:${id}`);
      const cached = await this.redis.mGet(keys);
      const watches = cached
        .filter((watch): watch is string => watch !== null)
        .map((watch) => JSON.parse(watch) as Watch);
      if (watches.length > 0) return watches;
    }

    const watches = await this.watchRepository.findManyByUserIdAndGuildId(
      userId,
      guildId,
    );

    if (watches.length > 0) {
      for (const watch of watches) {
        await this.updateRedis("CREATE", watch);
      }
    }

    return watches;
  };

  createUserWatch = async (
    data: Omit<Watch, "id" | "conditions">,
  ): Promise<Watch> => {
    const watch = await this.watchRepository.create({
      ...data,
      channelId: data.scope === "GUILD" ? null : (data.channelId ?? null),
    });

    await this.updateRedis("CREATE", watch);

    return watch;
  };

  updateUserWatch = async (
    id: string,
    userId: string,
    data: Partial<Pick<Watch, "name" | "scope" | "channelId">>,
  ): Promise<Watch | null> => {
    const existing = await this.getUserWatch(id, userId);
    if (!existing) {
      return null;
    }

    const updatePayload: Partial<Pick<Watch, "name" | "scope" | "channelId">> =
      {
        ...(data.name != null ? { name: data.name } : {}),
        ...(data.scope != null ? { scope: data.scope } : {}),
        ...(data.scope === "GUILD"
          ? { channelId: null }
          : data.channelId !== undefined
            ? { channelId: data.channelId }
            : {}),
      };

    const updated = await this.watchRepository.updateById(id, updatePayload);

    await this.updateRedis("DELETE", existing);
    await this.updateRedis("CREATE", updated);

    return updated;
  };

  deleteUserWatch = async (
    id: string,
    userId: string,
  ): Promise<Watch | null> => {
    const existing = await this.getUserWatch(id, userId);
    if (!existing) {
      return null;
    }

    const deleted = await this.watchRepository.deleteById(id);

    await this.updateRedis("DELETE", existing);

    return deleted;
  };
}
