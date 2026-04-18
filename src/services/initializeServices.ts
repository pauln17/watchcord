import type { PrismaClient } from "../../generated/prisma/client";
import { WatchConditionService, WatchService } from "./index";

export interface IServices {
  watchService: WatchService;
  watchConditionService: WatchConditionService;
}

export const initializeServices = (prisma: PrismaClient): IServices => {
  return {
    watchService: new WatchService(prisma),
    watchConditionService: new WatchConditionService(prisma),
  };
};
