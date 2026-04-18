import type { PrismaClient } from "../../generated/prisma/client";
import { WatchService } from "./watch";
import { WatchConditionService } from "./watch-condition";

export const initializeServices = (prisma: PrismaClient) => {
  return {
    watchService: new WatchService(prisma),
    watchConditionService: new WatchConditionService(prisma),
  };
};
