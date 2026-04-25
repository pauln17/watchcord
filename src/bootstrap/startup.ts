import { ExtendedClient } from "../discord/ExtendedClient";
import { prisma } from "../lib/prisma";
import { redis } from "../lib/redis";
import { ConditionService, type IServices, WatchService } from "../services";
import { logger } from "../util/logger";

export const startup = async (): Promise<ExtendedClient> => {
  await redis.connect();

  const services: IServices = {
    watchService: new WatchService(prisma, redis),
    conditionService: new ConditionService(prisma, redis),
  };

  return new ExtendedClient(services, redis, logger);
};
