import { WatchCache } from "../cache/watchCache";
import { ExtendedClient } from "../discord/ExtendedClient";
import { prisma } from "../lib/prisma";
import {
  ConditionRepository,
  type IRepositories,
  WatchRepository,
} from "../repositories";
import { ConditionService, type IServices, WatchService } from "../services";
import { logger } from "../util/logger";
import { initializeRedis } from "./redis";

export const initializeApp = async (): Promise<ExtendedClient> => {
  const redis = await initializeRedis();

  const repositories: IRepositories = {
    watchRepository: new WatchRepository(prisma),
    conditionRepository: new ConditionRepository(prisma),
  };

  const cache = new WatchCache(redis, logger);

  const services: IServices = {
    watchService: new WatchService(repositories, cache),
    conditionService: new ConditionService(repositories, cache),
  };

  return new ExtendedClient(services, logger);
};
