import type { RedisJSON } from "redis";

import type { RedisClientType } from "../lib/redis";
import type { IRepositories } from "../repositories";
import type { Condition } from "../types";
import type { RedisSearchResult, Watch } from "../types";
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
    const condition = await this.repositories.conditionRepository.create({
      ...data,
    });

    const result = (await this.redis.ft.search(
      "idx:watches",
      `@id:{"${condition.watchId}"}`,
      {
        LIMIT: {
          from: 0,
          size: 1,
        },
      },
    )) as unknown as RedisSearchResult<Watch>;

    if (result.total > 0 && result.documents[0]?.value != null) {
      result.documents[0].value.conditions.push(condition);
      await this.redis.json.set(
        `wc:watches:${condition.watchId}`,
        "$",
        result.documents[0].value as unknown as RedisJSON,
      );
    }

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

    const result = (await this.redis.ft.search(
      "idx:watches",
      `@id:{"${existing.watchId}"}`,
      {
        LIMIT: {
          from: 0,
          size: 1,
        },
      },
    )) as unknown as RedisSearchResult<Watch>;

    if (result.total > 0 && result.documents[0]?.value != null) {
      result.documents[0].value.conditions =
        result.documents[0].value.conditions.filter(
          (condition) => condition.id !== id,
        );
      await this.redis.json.set(
        `wc:watches:${result.documents[0].value.id}`,
        "$",
        result.documents[0].value as unknown as RedisJSON,
      );
    }

    return condition;
  };
}
