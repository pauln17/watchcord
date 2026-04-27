import type { RedisClientType } from "../lib/redis";
import type { Watch } from "../types";
import type { ILogger } from "../util/logger";

export interface IWatchCache {
  getGuildScopedWatches: (guildId: string) => Promise<Watch[] | null>;
  getChannelScopedWatches: (channelId: string) => Promise<Watch[] | null>;
  getUserWatches: (userId: string, guildId: string) => Promise<Watch[] | null>;
  getUserWatch: (watchId: string, userId: string) => Promise<Watch | null>;
  setGuildScopedWatches: (guildId: string, watches: Watch[]) => Promise<void>;
  setChannelScopedWatches: (
    channelId: string,
    watches: Watch[],
  ) => Promise<void>;
  setUserWatches: (
    userId: string,
    guildId: string,
    watches: Watch[],
  ) => Promise<void>;
  setUserWatch: (
    watchId: string,
    userId: string,
    watch: Watch,
  ) => Promise<void>;
  invalidate: (
    guildId: string,
    channelId?: string | null,
    userId?: string,
    watchId?: string,
  ) => Promise<void>;
}

export class WatchCache implements IWatchCache {
  private readonly TTL_SECONDS = 3600;

  constructor(
    private readonly redis: RedisClientType,
    private readonly logger: ILogger,
  ) {}

  private guildKey(guildId: string): string {
    return `wc:watches:scope:guild:${guildId}`;
  }

  private channelKey(channelId: string): string {
    return `wc:watches:scope:channel:${channelId}`;
  }

  private userWatchesKey(userId: string, guildId: string): string {
    return `wc:watches:user:${userId}:guild:${guildId}`;
  }

  private userWatchKey(watchId: string, userId: string): string {
    return `wc:watch:user:${userId}:id:${watchId}`;
  }

  getGuildScopedWatches = async (guildId: string): Promise<Watch[] | null> => {
    try {
      const raw = await this.redis.get(this.guildKey(guildId));
      if (raw === null) return null;
      return JSON.parse(raw) as Watch[];
    } catch (error) {
      this.logger.error({
        message: "Redis get failed for guild watches",
        error,
      });
      return null;
    }
  };

  getChannelScopedWatches = async (channelId: string): Promise<Watch[] | null> => {
    try {
      const raw = await this.redis.get(this.channelKey(channelId));
      if (raw === null) return null;
      return JSON.parse(raw) as Watch[];
    } catch (error) {
      this.logger.error({
        message: "Redis get failed for channel watches",
        error,
      });
      return null;
    }
  };

  getUserWatches = async (
    userId: string,
    guildId: string,
  ): Promise<Watch[] | null> => {
    try {
      const raw = await this.redis.get(this.userWatchesKey(userId, guildId));
      if (raw === null) return null;
      return JSON.parse(raw) as Watch[];
    } catch (error) {
      this.logger.error({
        message: "Redis get failed for user watches",
        error,
      });
      return null;
    }
  };

  getUserWatch = async (
    watchId: string,
    userId: string,
  ): Promise<Watch | null> => {
    try {
      const raw = await this.redis.get(this.userWatchKey(watchId, userId));
      if (raw === null) return null;
      return JSON.parse(raw) as Watch;
    } catch (error) {
      this.logger.error({ message: "Redis get failed for user watch", error });
      return null;
    }
  };

  setGuildScopedWatches = async (
    guildId: string,
    watches: Watch[],
  ): Promise<void> => {
    try {
      await this.redis.set(this.guildKey(guildId), JSON.stringify(watches), {
        EX: this.TTL_SECONDS,
      });
    } catch (error) {
      this.logger.error({
        message: "Redis set failed for guild watches",
        error,
      });
    }
  };

  setChannelScopedWatches = async (
    channelId: string,
    watches: Watch[],
  ): Promise<void> => {
    try {
      await this.redis.set(
        this.channelKey(channelId),
        JSON.stringify(watches),
        { EX: this.TTL_SECONDS },
      );
    } catch (error) {
      this.logger.error({
        message: "Redis set failed for channel watches",
        error,
      });
    }
  };

  setUserWatches = async (
    userId: string,
    guildId: string,
    watches: Watch[],
  ): Promise<void> => {
    try {
      await this.redis.set(
        this.userWatchesKey(userId, guildId),
        JSON.stringify(watches),
        { EX: this.TTL_SECONDS },
      );
    } catch (error) {
      this.logger.error({
        message: "Redis set failed for user watches",
        error,
      });
    }
  };

  setUserWatch = async (
    watchId: string,
    userId: string,
    watch: Watch,
  ): Promise<void> => {
    try {
      await this.redis.set(
        this.userWatchKey(watchId, userId),
        JSON.stringify(watch),
        { EX: this.TTL_SECONDS },
      );
    } catch (error) {
      this.logger.error({ message: "Redis set failed for user watch", error });
    }
  };

  invalidate = async (
    guildId: string,
    channelId?: string | null,
    userId?: string,
    watchId?: string,
  ): Promise<void> => {
    try {
      await this.redis.del(this.guildKey(guildId));

      if (channelId) {
        await this.redis.del(this.channelKey(channelId));
      }

      if (userId) {
        await this.redis.del(this.userWatchesKey(userId, guildId));
      }

      if (userId && watchId) {
        await this.redis.del(this.userWatchKey(watchId, userId));
      }
    } catch (error) {
      this.logger.error({ message: "Redis invalidate failed", error });
    }
  };
}
