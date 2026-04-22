import type { PrismaClient } from "../../generated/prisma/client";
import type { RedisClientType } from "../lib/redis";
import { WatchConditionService, WatchService } from "./index";

export interface IServices {
  watchService: WatchService;
  watchConditionService: WatchConditionService;
}

export const initializeServices = (
  prisma: PrismaClient,
  redis: RedisClientType,
): IServices => {
  return {
    watchService: new WatchService(prisma, redis),
    watchConditionService: new WatchConditionService(prisma, redis),
  };
};
