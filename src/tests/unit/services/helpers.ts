import { vi } from "vitest";

import type { IWatchCache } from "../../../cache/watchCache";
import type { IConditionRepository } from "../../../repositories/conditionRepository";
import type { IRepositories } from "../../../repositories/types";
import type { IWatchRepository } from "../../../repositories/watchRepository";
import type { Condition, Watch } from "../../../types";

export const watches: Watch[] = [
  {
    id: "w-1",
    name: "a",
    userId: "u-1",
    enabled: true,
    scope: "GUILD",
    guildId: "g-1",
    channelId: null,
    conditions: [],
  },
];

export const conditions: Condition[] = [
  {
    id: "c-1",
    watchId: "w-1",
    name: "a",
    type: "ANY",
    sensitive: false,
    include: [],
    exclude: [],
    targetUsers: [],
    targetRoles: [],
  },
];

export const createRepos = (overrides?: {
  watchRepository?: Partial<IWatchRepository>;
  conditionRepository?: Partial<IConditionRepository>;
}): IRepositories => {
  return {
    watchRepository: {
      findAll: vi.fn(),
      findById: vi.fn(),
      findByIdAndUserId: vi.fn(),
      findManyByUserIdAndGuildId: vi.fn(),
      findManyChannelScopedByGuildIdAndChannelId: vi.fn(),
      findManyGuildScopedByGuildId: vi.fn(),
      create: vi.fn(),
      updateById: vi.fn(),
      deleteById: vi.fn(),
      ...overrides?.watchRepository,
    },
    conditionRepository: {
      findByIdAndUserId: vi.fn(),
      create: vi.fn(),
      deleteById: vi.fn(),
      ...overrides?.conditionRepository,
    },
  };
};

export const createCache = (overrides: Partial<IWatchCache>): IWatchCache => {
  return {
    getGuildScopedWatches: vi.fn(),
    getChannelScopedWatches: vi.fn(),
    getUserWatches: vi.fn(),
    getUserWatch: vi.fn(),
    setGuildScopedWatches: vi.fn(),
    setChannelScopedWatches: vi.fn(),
    setUserWatches: vi.fn(),
    setUserWatch: vi.fn(),
    invalidate: vi.fn(),
    ...overrides,
  };
};
