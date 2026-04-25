import type { PrismaClient } from "../../generated/prisma/client";
import type { WatchCondition, WatchConditionType } from "../types";

export interface IConditionRepository {
  findById: (id: string) => Promise<WatchCondition | null>;
  create: (data: Omit<WatchCondition, "id">) => Promise<WatchCondition>;
  updateById: (id: string, data: WatchCondition) => Promise<WatchCondition>;
  deleteById: (id: string) => Promise<WatchCondition>;
}

export class ConditionRepository implements IConditionRepository {
  constructor(private readonly prisma: PrismaClient) {}

  findById = async (id: string): Promise<WatchCondition | null> => {
    return await this.prisma.watchCondition.findUnique({ where: { id } });
  };

  create = async (
    data: Omit<WatchCondition, "id">,
  ): Promise<WatchCondition> => {
    return await this.prisma.watchCondition.create({
      data: {
        watchId: data.watchId,
        name: data.name,
        type: data.type as WatchConditionType,
        targetUserId: data.targetUserId ?? null,
        targetRoleId: data.targetRoleId ?? null,
        value: data.value,
      },
    });
  };

  updateById = async (
    id: string,
    data: WatchCondition,
  ): Promise<WatchCondition> => {
    return await this.prisma.watchCondition.update({
      where: { id },
      data: {
        name: data.name,
        type: data.type,
        targetUserId: data.targetUserId ?? null,
        targetRoleId: data.targetRoleId ?? null,
        value: data.value,
        watchId: data.watchId,
      },
    });
  };

  deleteById = async (id: string): Promise<WatchCondition> => {
    return await this.prisma.watchCondition.delete({ where: { id } });
  };
}
