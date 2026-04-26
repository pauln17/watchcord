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

  const services: IServices = {
    watchService: new WatchService(repositories, redis, logger),
    conditionService: new ConditionService(repositories, redis, logger),
  };

  return new ExtendedClient(services, redis, logger);
};
