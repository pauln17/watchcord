import type { PrismaClient } from "../../generated/prisma/client";
import type { RedisClientType } from "../lib/redis";
import type { WatchCondition, WatchConditionType } from "../types";

export interface IConditionService {
  getConditionById: (
    id: string,
    userId: string,
  ) => Promise<WatchCondition | null>;
  createCondition: (
    condition: Omit<WatchCondition, "id">,
  ) => Promise<WatchCondition>;
  updateCondition: (
    id: string,
    condition: WatchCondition,
    userId: string,
  ) => Promise<WatchCondition | null>;
  deleteCondition: (
    id: string,
    userId: string,
  ) => Promise<WatchCondition | null>;
}

export class ConditionService implements IConditionService {
  private readonly prisma: PrismaClient;
  private readonly redis: RedisClientType;

  constructor(prisma: PrismaClient, redis: RedisClientType) {
    this.prisma = prisma;
    this.redis = redis;
  }

  getConditionById = async (
    id: string,
    userId: string,
  ): Promise<WatchCondition | null> => {
    return await this.prisma.watchCondition.findFirst({
      where: { id, watch: { userId } },
    });
  };

  createCondition = async (
    condition: Omit<WatchCondition, "id">,
  ): Promise<WatchCondition> => {
    return await this.prisma.watchCondition.create({
      data: {
        watchId: condition.watchId,
        name: condition.name,
        type: condition.type as WatchConditionType,
        targetUserId: condition.targetUserId ?? null,
        targetRoleId: condition.targetRoleId ?? null,
        value: condition.value,
      },
    });
  };

  updateCondition = async (
    id: string,
    condition: WatchCondition,
    userId: string,
  ): Promise<WatchCondition | null> => {
    const existing = await this.getConditionById(id, userId);
    if (!existing) {
      return null;
    }

    return await this.prisma.watchCondition.update({
      where: { id: existing.id, watch: { userId } },
      data: condition,
    });
  };

  deleteCondition = async (
    id: string,
    userId: string,
  ): Promise<WatchCondition | null> => {
    const existing = await this.getConditionById(id, userId);
    if (!existing) {
      return null;
    }

    return await this.prisma.watchCondition.delete({
      where: { id: existing.id, watch: { userId } },
    });
  };
}
