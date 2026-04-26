import type { RedisJSON } from "redis";

import type { RedisClientType } from "../lib/redis";
import type { IRepositories } from "../repositories";
import type { RedisSearchResult, Watch } from "../types";
import type { ILogger } from "../util/logger";

export interface IWatchService {
  getWatches: () => Promise<Watch[]>;
  getGuildScopedWatches: (guildId: string) => Promise<Watch[]>;
  getChannelScopedWatches: (
    guildId: string,
    channelId: string,
  ) => Promise<Watch[]>;
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
    private readonly repositories: IRepositories,
    private readonly redis: RedisClientType,
    private readonly logger: ILogger,
  ) {}

  getWatches = async (): Promise<Watch[]> => {
    return await this.repositories.watchRepository.findAll();
  };

  getGuildScopedWatches = async (guildId: string): Promise<Watch[]> => {
    const result = (await this.redis.ft.search(
      "idx:watches",
      `@scope:{"GUILD"} @guildId:{"${guildId}"}`,
    )) as unknown as RedisSearchResult<Watch>;

    if (result.total > 0 && result.documents.length > 0) {
      const watches = result.documents
        .map((doc) => doc.value)
        .filter((value): value is Watch => value != null);

      if (watches.length > 0) {
        return watches;
      }
    }

    const watches =
      await this.repositories.watchRepository.findManyGuildScopedByGuildId(
        guildId,
      );

    await this.redis.json.mSet(
      watches.map((watch) => ({
        key: `wc:watches:${watch.id}`,
        path: "$",
        value: watch as unknown as RedisJSON,
      })),
    );

    return watches;
  };

  getChannelScopedWatches = async (
    guildId: string,
    channelId: string,
  ): Promise<Watch[]> => {
    const result = (await this.redis.ft.search(
      "idx:watches",
      `@scope:{"CHANNEL"} @guildId:{"${guildId}"} @channelId:{"${channelId}"}`,
    )) as unknown as RedisSearchResult<Watch>;

    if (result.total > 0 && result.documents.length > 0) {
      const watches = result.documents
        .map((doc) => doc.value)
        .filter((value): value is Watch => value != null);

      if (watches.length > 0) {
        return watches;
      }
    }

    const watches =
      await this.repositories.watchRepository.findManyChannelScopedByGuildIdAndChannelId(
        guildId,
        channelId,
      );

    await this.redis.json.mSet(
      watches.map((watch) => ({
        key: `wc:watches:${watch.id}`,
        path: "$",
        value: watch as unknown as RedisJSON,
      })),
    );

    return watches;
  };

  getUserWatch = async (id: string, userId: string): Promise<Watch | null> => {
    const result = (await this.redis.ft.search(
      "idx:watches",
      `@id:{"${id}"} @userId:{"${userId}"}`,
      {
        LIMIT: {
          from: 0,
          size: 1,
        },
      },
    )) as unknown as RedisSearchResult<Watch>;

    if (result.total > 0 && result.documents[0]?.value != null) {
      return result.documents[0].value;
    }

    const watch = await this.repositories.watchRepository.findByIdAndUserId(
      id,
      userId,
    );

    if (!watch) return null;

    await this.redis.json.set(
      `wc:watches:${id}`,
      "$",
      watch as unknown as RedisJSON,
    );

    return watch;
  };

  getUserWatches = async (
    userId: string,
    guildId: string,
  ): Promise<Watch[]> => {
    const result = (await this.redis.ft.search(
      "idx:watches",
      `@userId:{"${userId}"} @guildId:{"${guildId}"}`,
      {
        LIMIT: {
          from: 0,
          size: 100,
        },
      },
    )) as unknown as RedisSearchResult<Watch>;

    if (result.total > 0 && result.documents.length > 0) {
      const watches = result.documents
        .map((doc) => doc.value)
        .filter((value): value is Watch => value != null);

      if (watches.length > 0) {
        return watches;
      }
    }

    const watches =
      await this.repositories.watchRepository.findManyByUserIdAndGuildId(
        userId,
        guildId,
      );

    await this.redis.json.mSet(
      watches.map((watch) => ({
        key: `wc:watches:${watch.id}`,
        path: "$",
        value: watch as unknown as RedisJSON,
      })),
    );

    return watches;
  };

  createUserWatch = async (
    data: Omit<Watch, "id" | "conditions">,
  ): Promise<Watch> => {
    if (data.scope === "CHANNEL" && !data.channelId) {
      throw new Error("Channel is required when scope is set to channel");
    }

    if (data.scope === "GUILD" && data.channelId) {
      throw new Error("Guild scope cannot be used with a channel");
    }

    const watch = await this.repositories.watchRepository.create({
      ...data,
      channelId: data.scope === "GUILD" ? null : data.channelId!,
    });

    try {
      await this.redis.json.set(
        `wc:watches:${watch.id}`,
        "$",
        watch as unknown as RedisJSON,
      );
    } catch (error) {
      this.logger.error({
        message: "Failed to create watch in Redis cache",
        error,
      });
    }

    return watch;
  };

  updateUserWatch = async (
    id: string,
    userId: string,
    data: Partial<Pick<Watch, "name" | "scope" | "channelId">>,
  ): Promise<Watch | null> => {
    const existing = await this.repositories.watchRepository.findByIdAndUserId(
      id,
      userId,
    );
    if (!existing) return null;

    if (data.scope === "CHANNEL" && !data.channelId) {
      throw new Error("Channel is required when scope is set to channel");
    }

    if (data.scope === "GUILD" && data.channelId) {
      throw new Error("Guild scope cannot be used with a channel");
    }

    const watch = await this.repositories.watchRepository.updateById(id, {
      ...(data.name != null ? { name: data.name } : {}),
      ...(data.scope != null ? { scope: data.scope } : {}),
      ...(data.scope === "GUILD"
        ? { channelId: null }
        : data.channelId !== undefined
          ? { channelId: data.channelId }
          : {}),
    });

    try {
      await this.redis.json.set(
        `wc:watches:${id}`,
        "$",
        watch as unknown as RedisJSON,
      );
    } catch (error) {
      this.logger.error({
        message: "Failed to update watch in Redis cache",
        error,
      });
    }

    return watch;
  };

  deleteUserWatch = async (
    id: string,
    userId: string,
  ): Promise<Watch | null> => {
    const existing = await this.repositories.watchRepository.findByIdAndUserId(
      id,
      userId,
    );
    if (!existing) return null;

    const watch = await this.repositories.watchRepository.deleteById(id);

    try {
      await this.redis.json.del(`wc:watches:${id}`);
    } catch (error) {
      this.logger.error({
        message: "Failed to delete watch from Redis cache",
        error,
      });
    }

    return watch;
  };
}
