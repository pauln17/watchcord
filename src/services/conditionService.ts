import type { IWatchCache } from "../cache/watchCache";
import { CONDITION_LIMITS } from "../constants/conditionLimits";
import { ValidationError } from "../errors/ValidationError";
import type { IRepositories } from "../repositories";
import type { Condition } from "../types";

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

  private validateArrayLength = (arrayName: string, array: string[]): void => {
    const itemType = {
      Include: "terms",
      Exclude: "terms",
      Users: "users",
      Roles: "roles",
    }[arrayName];

    const limit = {
      Include: CONDITION_LIMITS.maxIncludeTerms,
      Exclude: CONDITION_LIMITS.maxExcludeTerms,
      Users: CONDITION_LIMITS.maxTargetUsers,
      Roles: CONDITION_LIMITS.maxTargetRoles,
    }[arrayName];

    if (array.length > limit!)
      throw new ValidationError(
        `${arrayName} cannot contain more than ${limit} ${itemType}`,
      );
  };

  private validateItemsLength = (arrayName: string, array: string[]): void => {
    for (const item of array) {
      if (item.length > CONDITION_LIMITS.maxItemLength)
        throw new ValidationError(
          `Each item in ${arrayName.toLowerCase()} cannot be longer than ${CONDITION_LIMITS.maxItemLength} characters`,
        );
    }
  };

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
    guildId: string,
    channelId: string | null,
    userId: string,
  ): Promise<Condition> => {
    if (
      data.type === "ANY" &&
      (data.include.length > 0 || data.exclude.length > 0)
    )
      throw new ValidationError("Terms cannot be provided when type is ANY");

    if (
      data.type === "TERM" &&
      data.include.length === 0 &&
      data.exclude.length === 0
    )
      throw new ValidationError("Terms must be provided when type is TERM");

    this.validateArrayLength("Include", data.include);
    this.validateArrayLength("Exclude", data.exclude);
    this.validateArrayLength("Users", data.targetUsers);
    this.validateArrayLength("Roles", data.targetRoles);

    this.validateItemsLength("Include", data.include);
    this.validateItemsLength("Exclude", data.exclude);
    this.validateItemsLength("Users", data.targetUsers);
    this.validateItemsLength("Roles", data.targetRoles);

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
    const existing =
      await this.repositories.conditionRepository.findByIdAndUserId(id, userId);
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
