import type { PrismaClient } from "../../generated/prisma/client";
import type { Condition } from "../types";

export interface IConditionRepository {
  findByIdAndUserId: (id: string, userId: string) => Promise<Condition | null>;
  create: (data: Omit<Condition, "id">) => Promise<Condition>;
  deleteById: (id: string) => Promise<Condition>;
}

export class ConditionRepository implements IConditionRepository {
  constructor(private readonly prisma: PrismaClient) {}

  findByIdAndUserId = async (
    id: string,
    userId: string,
  ): Promise<Condition | null> => {
    return await this.prisma.condition.findFirst({
      where: { id, watch: { userId } },
    });
  };

  create = async (data: Omit<Condition, "id">): Promise<Condition> => {
    return await this.prisma.condition.create({
      data,
    });
  };

  deleteById = async (id: string): Promise<Condition> => {
    return await this.prisma.condition.delete({
      where: { id },
    });
  };
}
