import type { IWatchCache } from "../cache/watchCache";
import { CONDITION_LIMITS } from "../constants";
import type { IRepositories } from "../repositories";
import type { Condition } from "../types";
import { ValidationError } from "../util/error";

export interface IConditionService {
  getUserCondition: (id: string, userId: string) => Promise<Condition | null>;
  createUserCondition: (
    data: Omit<Condition, "id">,
    guildId: string,
    channelId: string | null,
    userId: string,
  ) => Promise<Condition>;
  deleteUserCondition: (
    id: string,
    userId: string,
  ) => Promise<Condition | null>;
}

export class ConditionService implements IConditionService {
  constructor(
    private readonly repositories: IRepositories,
    private readonly cache: IWatchCache,
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

  getUserWatchConditions = async (
    watchId: string,
    userId: string,
  ): Promise<Condition[]> => {
    return await this.repositories.conditionRepository.findManyByWatchIdAndUserId(
      watchId,
      userId,
    );
  };

  createUserCondition = async (
    data: Omit<Condition, "id">,
    guildId: string,
    channelId: string | null,
    userId: string,
  ): Promise<Condition> => {
    const userConditionsByWatch = await this.getUserWatchConditions(
      data.watchId,
      userId,
    );
    if (userConditionsByWatch.length >= CONDITION_LIMITS.MAX_CONDITIONS)
      throw new ValidationError(
        "You have reached the maximum number of conditions for this watch",
      );

    const condition = await this.repositories.conditionRepository.create({
      ...data,
    });

    await this.cache.invalidate(guildId, channelId, userId, data.watchId);

    return condition;
  };

  deleteUserCondition = async (
    id: string,
    userId: string,
  ): Promise<Condition | null> => {
    const existing = await this.getUserCondition(id, userId);
    if (!existing) return null;

    const condition =
      await this.repositories.conditionRepository.deleteById(id);

    const watch = await this.repositories.watchRepository.findById(
      existing.watchId,
    );

    if (watch) {
      await this.cache.invalidate(
        watch.guildId,
        watch.channelId,
        watch.userId,
        existing.watchId,
      );
    }

    return condition;
  };
}
