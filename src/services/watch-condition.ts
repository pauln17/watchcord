import type { PrismaClient } from "../../generated/prisma/client";
import type { WatchCondition } from "../types/condition";

export interface IWatchConditionService {
  getWatchConditionById: (
    id: string,
    userId: string,
  ) => Promise<WatchCondition | null>;
  createWatchCondition: (
    watchCondition: WatchCondition,
  ) => Promise<WatchCondition>;
  updateWatchCondition: (
    id: string,
    watchCondition: WatchCondition,
    userId: string,
  ) => Promise<WatchCondition | null>;
  deleteWatchCondition: (
    id: string,
    userId: string,
  ) => Promise<WatchCondition | null>;
}

export class WatchConditionService implements IWatchConditionService {
  private readonly prisma: PrismaClient;

  constructor(prisma: PrismaClient) {
    this.prisma = prisma;
  }

  getWatchConditionById = async (
    id: string,
    userId: string,
  ): Promise<WatchCondition | null> => {
    return await this.prisma.watchCondition.findFirst({
      where: { id, watch: { userId } },
    });
  };

  createWatchCondition = async (
    watchCondition: WatchCondition,
  ): Promise<WatchCondition> => {
    return await this.prisma.watchCondition.create({
      data: watchCondition,
    });
  };

  updateWatchCondition = async (
    id: string,
    watchCondition: WatchCondition,
    userId: string,
  ): Promise<WatchCondition | null> => {
    const existing = await this.getWatchConditionById(id, userId);
    if (!existing) {
      return null;
    }

    return await this.prisma.watchCondition.update({
      where: { id: existing.id, watch: { userId } },
      data: watchCondition,
    });
  };

  deleteWatchCondition = async (
    id: string,
    userId: string,
  ): Promise<WatchCondition | null> => {
    const existing = await this.getWatchConditionById(id, userId);
    if (!existing) {
      return null;
    }

    return await this.prisma.watchCondition.delete({
      where: { id: existing.id, watch: { userId } },
    });
  };
}
