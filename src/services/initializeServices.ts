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
  const watches = await services.watchService.getAllWatches();

  for (const watch of watches) {
    await redis.set(`watches:${watch.id}`, JSON.stringify(watch));

    if (watch.scope === "GUILD") {
      await redis.sAdd(`guilds:${watch.guildId}`, watch.id);
    } else if (watch.scope === "CHANNEL" && watch.channelId) {
      await redis.sAdd(
        `guilds:${watch.guildId}:channels:${watch.channelId}`,
        watch.id,
      );
    }
  }
};
