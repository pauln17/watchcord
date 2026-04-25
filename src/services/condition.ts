import type { IConditionRepository, IWatchRepository } from "../repositories";
import type { WatchCondition } from "../types";

export interface IConditionService {
  getUserCondition: (
    id: string,
    userId: string,
  ) => Promise<WatchCondition | null>;
  createUserCondition: (
    userId: string,
    condition: Omit<WatchCondition, "id">,
  ) => Promise<WatchCondition | null>;
  updateUserCondition: (
    id: string,
    userId: string,
    condition: WatchCondition,
  ) => Promise<WatchCondition | null>;
  deleteUserCondition: (
    id: string,
    userId: string,
  ) => Promise<WatchCondition | null>;
}

export class ConditionService implements IConditionService {
  constructor(
    private readonly conditionRepository: IConditionRepository,
    private readonly watchRepository: IWatchRepository,
  ) {}

  private isOwnedByUser = async (
    watchId: string,
    userId: string,
  ): Promise<boolean> => {
    const watch = await this.watchRepository.findById(watchId);
    return watch != null && watch.userId === userId;
  };

  getUserCondition = async (
    id: string,
    userId: string,
  ): Promise<WatchCondition | null> => {
    const condition = await this.conditionRepository.findById(id);
    if (!condition) return null;
    if (!(await this.isOwnedByUser(condition.watchId, userId))) return null;
    return condition;
  };

  createUserCondition = async (
    userId: string,
    condition: Omit<WatchCondition, "id">,
  ): Promise<WatchCondition | null> => {
    if (!(await this.isOwnedByUser(condition.watchId, userId))) return null;
    return await this.conditionRepository.create(condition);
  };

  updateUserCondition = async (
    id: string,
    userId: string,
    condition: WatchCondition,
  ): Promise<WatchCondition | null> => {
    const existing = await this.getUserCondition(id, userId);
    if (!existing) return null;
    return await this.conditionRepository.updateById(id, condition);
  };

  deleteUserCondition = async (
    id: string,
    userId: string,
  ): Promise<WatchCondition | null> => {
    const existing = await this.getUserCondition(id, userId);
    if (!existing) return null;
    return await this.conditionRepository.deleteById(id);
  };
}
