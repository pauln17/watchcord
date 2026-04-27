import type { IWatchCache } from "../cache/watchCache";
import type { IRepositories } from "../repositories";
import type { Watch } from "../types";

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
    private readonly cache: IWatchCache,
  ) {}

  getWatches = async (): Promise<Watch[]> => {
    return await this.repositories.watchRepository.findAll();
  };

  getGuildScopedWatches = async (guildId: string): Promise<Watch[]> => {
    const cached = await this.cache.getGuildScopedWatches(guildId);
    if (cached !== null) return cached;

    const watches =
      await this.repositories.watchRepository.findManyGuildScopedByGuildId(
        guildId,
      );

    await this.cache.setGuildScopedWatches(guildId, watches);

    return watches;
  };

  getChannelScopedWatches = async (
    guildId: string,
    channelId: string,
  ): Promise<Watch[]> => {
    const cached = await this.cache.getChannelScopedWatches(channelId);
    if (cached !== null) return cached;

    const watches =
      await this.repositories.watchRepository.findManyChannelScopedByGuildIdAndChannelId(
        guildId,
        channelId,
      );

    await this.cache.setChannelScopedWatches(channelId, watches);

    return watches;
  };

  getUserWatch = async (id: string, userId: string): Promise<Watch | null> => {
    const cached = await this.cache.getUserWatch(id, userId);
    if (cached !== null) return cached;

    const watch = await this.repositories.watchRepository.findByIdAndUserId(
      id,
      userId,
    );
    if (!watch) return null;

    await this.cache.setUserWatch(id, userId, watch);
    return watch;
  };

  getUserWatches = async (
    userId: string,
    guildId: string,
  ): Promise<Watch[]> => {
    const cached = await this.cache.getUserWatches(userId, guildId);
    if (cached !== null) return cached;

    const watches =
      await this.repositories.watchRepository.findManyByUserIdAndGuildId(
        userId,
        guildId,
      );

    await this.cache.setUserWatches(userId, guildId, watches);

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

    await this.cache.invalidate(
      watch.guildId,
      watch.channelId,
      watch.userId,
      watch.id,
    );

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

    await this.cache.invalidate(
      existing.guildId,
      existing.channelId,
      existing.userId,
      existing.id,
    );

    if (watch.channelId !== existing.channelId) {
      await this.cache.invalidate(
        watch.guildId,
        watch.channelId,
        watch.userId,
        watch.id,
      );
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

    await this.cache.invalidate(
      watch.guildId,
      watch.channelId,
      watch.userId,
      watch.id,
    );

    return watch;
  };
}
