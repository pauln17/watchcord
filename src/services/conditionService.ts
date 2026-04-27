import type { RedisClientType } from "../lib/redis";
import type { IRepositories } from "../repositories";
import type { Condition } from "../types";
import type { ILogger } from "../util/logger";

export interface IConditionService {
  getUserCondition: (id: string, userId: string) => Promise<Condition | null>;
  createUserCondition: (data: Omit<Condition, "id">) => Promise<Condition>;
  deleteUserCondition: (
    id: string,
    userId: string,
  ) => Promise<Condition | null>;
}

export class ConditionService implements IConditionService {
  constructor(
    private readonly repositories: IRepositories,
    private readonly redis: RedisClientType,
    private readonly logger: ILogger,
  ) {}

  getUserCondition = async (
    id: string,
    userId: string,
  ): Promise<Condition | null> => {
    return await this.repositories.conditionRepository.findByIdAndUserId(
      id,
      userId,
    );
  };

  createUserCondition = async (
    data: Omit<Condition, "id">,
  ): Promise<Condition> => {
    return await this.repositories.conditionRepository.create({
      ...data,
    });
  };

  deleteUserCondition = async (
    id: string,
    userId: string,
  ): Promise<Condition | null> => {
    const existing =
      await this.repositories.conditionRepository.findByIdAndUserId(id, userId);
    if (!existing) return null;

    return await this.repositories.conditionRepository.deleteById(id);
  };
}
