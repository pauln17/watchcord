import { describe, expect, test, vi } from "vitest";

import { ValidationError } from "../../errors/ValidationError";
import { ConditionService } from "../../services/conditionService";
import type { Condition, ScopeType, Watch } from "../../types";
import { conditions, createCache, createRepos, watches } from "./helpers";

describe("ConditionService", () => {
  describe("getUserCondition", async () => {
    test("retrieve user's condition from repo", async () => {
      const repos = createRepos({
        conditionRepository: {
          findByIdAndUserId: vi.fn().mockResolvedValue(conditions[0]),
        },
      });
      const cache = createCache({});

      const service = new ConditionService(repos, cache);
      const result = await service.getUserCondition("c-1", "u-1");

      expect(result).toBe(conditions[0]);
      expect(repos.conditionRepository.findByIdAndUserId).toHaveBeenCalledWith(
        "c-1",
        "u-1",
      );
    });
  });

  describe("createUserCondition", async () => {
    test("type is any but include or exclude are provided -> throw validation error", async () => {
      const repos = createRepos({});
      const cache = createCache({});

      const service = new ConditionService(repos, cache);
      await expect(
        service.createUserCondition(
          {
            watchId: "w-1",
            name: "a",
            type: "ANY",
            sensitive: false,
            include: ["a"],
            exclude: ["a", "b", "c"],
            targetUsers: [],
            targetRoles: [],
          },
          "g-1",
          "c-1",
          "u-1",
        ),
      ).rejects.toThrow(ValidationError);
      expect(repos.conditionRepository.create).not.toHaveBeenCalled();
      expect(cache.invalidate).not.toHaveBeenCalled();
    });

    test("type is term but include or exclude are not provided -> throw validation error", async () => {
      const repos = createRepos({});
      const cache = createCache({});

      const service = new ConditionService(repos, cache);
      await expect(
        service.createUserCondition(
          {
            watchId: "w-1",
            name: "a",
            type: "TERM",
            sensitive: false,
            include: [],
            exclude: [],
            targetUsers: [],
            targetRoles: [],
          },
          "g-1",
          "c-1",
          "u-1",
        ),
      ).rejects.toThrow(ValidationError);
      expect(repos.conditionRepository.create).not.toHaveBeenCalled();
      expect(cache.invalidate).not.toHaveBeenCalled();
    });

    test("array fields exceed array length limit -> throw validation error", async () => {
      const repos = createRepos({});
      const cache = createCache({});

      const service = new ConditionService(repos, cache);
      await expect(
        service.createUserCondition(
          {
            watchId: "w-1",
            name: "a",
            type: "TERM",
            sensitive: false,
            include: ["1", "2", "3", "4", "5", "6"],
            exclude: [],
            targetUsers: [],
            targetRoles: [],
          },
          "g-1",
          "c-1",
          "u-1",
        ),
      ).rejects.toThrow(ValidationError);
      expect(repos.conditionRepository.create).not.toHaveBeenCalled();
      expect(cache.invalidate).not.toHaveBeenCalled();
    });

    test("array fields exceed individual item length limit -> throw validation error", async () => {
      const repos = createRepos({});
      const cache = createCache({});

      const service = new ConditionService(repos, cache);
      await expect(
        service.createUserCondition(
          {
            watchId: "w-1",
            name: "a",
            type: "TERM",
            sensitive: false,
            include: [
              "1234567890123456789012345678901234567890123456789012345678901234567890",
              "a",
              "b",
              "c",
            ],
            exclude: [],
            targetUsers: [],
            targetRoles: [],
          },
          "g-1",
          "c-1",
          "u-1",
        ),
      ).rejects.toThrow(ValidationError);
      expect(repos.conditionRepository.create).not.toHaveBeenCalled();
      expect(cache.invalidate).not.toHaveBeenCalled();
    });

    test("valid inputs -> create condition -> invalidate watch cache", async () => {
      const repos = createRepos({
        conditionRepository: {
          create: vi.fn().mockResolvedValue(conditions[0]),
        },
      });
      const cache = createCache({});

      const service = new ConditionService(repos, cache);
      const result = await service.createUserCondition(
        {
          watchId: "w-1",
          name: "a",
          type: "ANY",
          sensitive: false,
          include: [],
          exclude: [],
          targetUsers: [],
          targetRoles: [],
        },
        "g-1",
        "c-1",
        "u-1",
      );

      expect(result).toBe(conditions[0]);
      expect(repos.conditionRepository.create).toHaveBeenCalledWith({
        watchId: "w-1",
        name: "a",
        type: "ANY",
        sensitive: false,
        include: [],
        exclude: [],
        targetUsers: [],
        targetRoles: [],
      });
      expect(cache.invalidate).toHaveBeenCalledWith("g-1", "c-1", "u-1", "w-1");
    });
  });

  describe("deleteUserCondition", async () => {
    test("condition not found -> return null", async () => {
      const repos = createRepos({
        conditionRepository: {
          findByIdAndUserId: vi.fn().mockResolvedValue(null),
        },
      });
      const cache = createCache({});

      const service = new ConditionService(repos, cache);
      const result = await service.deleteUserCondition("c-1", "u-1");

      expect(result).toBeNull();
      expect(repos.conditionRepository.findByIdAndUserId).toHaveBeenCalledWith(
        "c-1",
        "u-1",
      );
      expect(repos.conditionRepository.deleteById).not.toHaveBeenCalled();
      expect(repos.watchRepository.findById).not.toHaveBeenCalled();
      expect(cache.invalidate).not.toHaveBeenCalled();
    });

    test("condition found -> valid inputs -> delete condition -> invalidate watch cache", async () => {
      const repos = createRepos({
        conditionRepository: {
          findByIdAndUserId: vi.fn().mockResolvedValue(conditions[0]),
          deleteById: vi.fn().mockResolvedValue(conditions[0]),
        },
        watchRepository: {
          findById: vi.fn().mockResolvedValue(watches[0]),
        },
      });
      const cache = createCache({});

      const service = new ConditionService(repos, cache);
      const result = await service.deleteUserCondition("c-1", "u-1");

      expect(result).toBe(conditions[0]);
      expect(repos.conditionRepository.findByIdAndUserId).toHaveBeenCalledWith(
        "c-1",
        "u-1",
      );
      expect(repos.conditionRepository.deleteById).toHaveBeenCalledWith("c-1");
      expect(repos.watchRepository.findById).toHaveBeenCalledWith("w-1");
      expect(cache.invalidate).toHaveBeenCalledWith("g-1", null, "u-1", "w-1");
    });
  });
});
