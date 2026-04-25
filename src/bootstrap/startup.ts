import { ExtendedClient } from "../discord/ExtendedClient";
import { prisma } from "../lib/prisma";
import { redis } from "../lib/redis";
import {
  ConditionRepository,
  type IRepositories,
  WatchRepository,
} from "../repositories";
import { ConditionService,type IServices, WatchService } from "../services";
import { logger } from "../util/logger";

export const startup = async (): Promise<ExtendedClient> => {
  await redis.connect();

  const repositories: IRepositories = {
    watchRepository: new WatchRepository(prisma),
    conditionRepository: new ConditionRepository(prisma),
  };

  const services: IServices = {
    watchService: new WatchService(repositories.watchRepository, redis),
    conditionService: new ConditionService(
      repositories.conditionRepository,
      repositories.watchRepository,
    ),
  };

  return new ExtendedClient(services, redis, logger);
};
