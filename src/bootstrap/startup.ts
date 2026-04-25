import { ExtendedClient } from "../discord/ExtendedClient";
import { prisma } from "../lib/prisma";
import { redis } from "../lib/redis";
import {
  type IServices,
  WatchConditionService,
  WatchService,
} from "../services";
import { logger } from "../util/logger";

export const startup = async (): Promise<ExtendedClient> => {
  await redis.connect();

  const services: IServices = {
    watchService: new WatchService(prisma, redis),
    watchConditionService: new WatchConditionService(prisma, redis),
  };

  return new ExtendedClient(services, redis, logger);
};
