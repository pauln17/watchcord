import type { PrismaClient } from "../../generated/prisma/client";
import type { RedisClientType } from "../lib/redis";
import { WatchConditionService, WatchService } from "./index";

export interface IServices {
  watchService: WatchService;
  watchConditionService: WatchConditionService;
}

export const initializeServices = async (
  prisma: PrismaClient,
  redis: RedisClientType,
): Promise<IServices> => {
  const watchService = new WatchService(prisma, redis);
  const watchConditionService = new WatchConditionService(prisma, redis);

  const services = {
    watchService,
    watchConditionService,
  };

  await hydrateRedis(services, redis);

  return services;
};

const hydrateRedis = async (services: IServices, redis: RedisClientType) => {
  for await (const keys of redis.scanIterator({ MATCH: "wc:*" })) {
    if (keys.length > 0) {
      await redis.del(keys);
    }
  }

  const watches = await services.watchService.getAllWatches();

  for (const watch of watches) {
    await redis.set(`wc:watches:${watch.id}`, JSON.stringify(watch));
    await redis.sAdd(
      `wc:users:${watch.userId}:guilds:${watch.guildId}`,
      watch.id,
    );

    switch (watch.scope) {
      case "GUILD":
        await redis.sAdd(`wc:scopes:guilds:${watch.guildId}`, watch.id);
        break;
      case "CHANNEL":
        await redis.sAdd(`wc:scopes:channels:${watch.channelId}`, watch.id);
        break;
    }
  }
};
