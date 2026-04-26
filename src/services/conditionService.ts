import type { RedisClientType } from "../lib/redis";
import type { IRepositories } from "../repositories";
import type { WatchCondition } from "../types";
import type { ILogger } from "../util/logger";

export interface IConditionService {
  getUserCondition: (
    id: string,
    userId: string,
  ) => Promise<WatchCondition | null>;
  createUserCondition: (
    data: Omit<WatchCondition, "id">,
  ) => Promise<WatchCondition | null>;
  updateUserCondition: (
    id: string,
    userId: string,
    data: WatchCondition,
  ) => Promise<WatchCondition | null>;
  deleteUserCondition: (
    id: string,
    userId: string,
  ) => Promise<WatchCondition | null>;
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
  ): Promise<WatchCondition | null> => {
    return await this.repositories.conditionRepository.findById(id);
  };

  createUserCondition = async (
    data: Omit<WatchCondition, "id">,
  ): Promise<WatchCondition | null> => {
    return await this.repositories.conditionRepository.create({
      ...data,
    });
  };

  updateUserCondition = async (
    id: string,
    userId: string,
    data: WatchCondition,
  ): Promise<WatchCondition | null> => {
    const existing = await this.getUserCondition(id, userId);
    if (!existing) return null;

    return await this.repositories.conditionRepository.updateById(id, data);
  };

  deleteUserCondition = async (
    id: string,
    userId: string,
  ): Promise<WatchCondition | null> => {
    const existing = await this.getUserCondition(id, userId);
    if (!existing) return null;

    return await this.repositories.conditionRepository.deleteById(id);
  };
}
