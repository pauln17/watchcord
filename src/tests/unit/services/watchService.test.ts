import { describe, expect, test, vi } from "vitest";

import { ValidationError } from "../../../util/error";
import { WatchService } from "../../../services/watchService";
import type { ScopeType } from "../../../types";
import { createCache, createMockWatch, createRepos } from "./helpers";

describe("WatchService", () => {
  describe("getWatches", async () => {
    test("retrieves all watches from repo", async () => {
      const watches = [createMockWatch()];
      const repos = createRepos({
        watchRepository: {
          findAll: vi.fn().mockResolvedValue(watches),
        },
      });
      const cache = createCache({});

      const service = new WatchService(repos, cache);
      const result = await service.getWatches();

      expect(result).toBe(watches);
      expect(repos.watchRepository.findAll).toHaveBeenCalled();
    });
  });

  describe("getUserWatch", async () => {
    test("cache hit -> return cached, skip repo/set", async () => {
      const watch = createMockWatch();
      const repos = createRepos({});
      const cache = createCache({
        getUserWatch: vi.fn().mockResolvedValue(watch),
      });

      const service = new WatchService(repos, cache);
      const result = await service.getUserWatch("w-1", "u-1");

      expect(result).toBe(watch);
      expect(cache.getUserWatch).toHaveBeenCalledWith("w-1", "u-1");
      expect(repos.watchRepository.findByIdAndUserId).not.toHaveBeenCalled();
      expect(cache.setUserWatch).not.toHaveBeenCalled();
    });

    test("cache miss -> repo fetch, set cache, return watches", async () => {
      const watch = createMockWatch();
      const repos = createRepos({
        watchRepository: {
          findByIdAndUserId: vi.fn().mockResolvedValue(watch),
        },
      });
      const cache = createCache({
        getUserWatch: vi.fn().mockResolvedValue(null),
      });

      const service = new WatchService(repos, cache);
      const result = await service.getUserWatch("w-1", "u-1");

      expect(result).toBe(watch);
      expect(repos.watchRepository.findByIdAndUserId).toHaveBeenCalledWith(
        "w-1",
        "u-1",
      );
      expect(cache.setUserWatch).toHaveBeenCalledWith("w-1", "u-1", watch);
    });
  });

  describe("getUserWatches", () => {
    test("cache hit -> return cached, skip repo", async () => {
      const watches = [createMockWatch()];
      const repos = createRepos({});
      const cache = createCache({
        getUserWatches: vi.fn().mockResolvedValue(watches),
      });

      const service = new WatchService(repos, cache);
      const result = await service.getUserWatches("u-1", "g-1");

      expect(result).toBe(watches);
      expect(cache.getUserWatches).toHaveBeenCalledWith("u-1", "g-1");
      expect(
        repos.watchRepository.findManyByUserIdAndGuildId,
      ).not.toHaveBeenCalled();
      expect(cache.setUserWatches).not.toHaveBeenCalled();
    });

    test("cache miss -> repo fetch, set cache, return watches", async () => {
      const watches = [createMockWatch()];
      const repos = createRepos({
        watchRepository: {
          findManyByUserIdAndGuildId: vi.fn().mockResolvedValue(watches),
        },
      });
      const cache = createCache({
        getUserWatches: vi.fn().mockResolvedValue(null),
      });

      const service = new WatchService(repos, cache);
      const result = await service.getUserWatches("u-1", "g-1");

      expect(result).toBe(watches);
      expect(cache.getUserWatches).toHaveBeenCalledWith("u-1", "g-1");
      expect(
        repos.watchRepository.findManyByUserIdAndGuildId,
      ).toHaveBeenCalledWith("u-1", "g-1");
      expect(cache.setUserWatches).toHaveBeenCalledWith("u-1", "g-1", watches);
    });
  });

  describe("getGuildScopedWatches", async () => {
    test("cache hit -> return cached, skip repo/set", async () => {
      const watches = [createMockWatch()];
      const repos = createRepos({});
      const cache = createCache({
        getGuildScopedWatches: vi.fn().mockResolvedValue(watches),
      });

      const service = new WatchService(repos, cache);
      const result = await service.getGuildScopedWatches("g-1");

      expect(result).toBe(watches);
      expect(cache.getGuildScopedWatches).toHaveBeenCalledWith("g-1");
      expect(
        repos.watchRepository.findManyGuildScopedByGuildId,
      ).not.toHaveBeenCalled();
      expect(cache.setGuildScopedWatches).not.toHaveBeenCalled();
    });

    test("cache miss -> repo fetch, set cache, return watches", async () => {
      const watches = [createMockWatch()];
      const repos = createRepos({
        watchRepository: {
          findManyGuildScopedByGuildId: vi.fn().mockResolvedValue(watches),
        },
      });
      const cache = createCache({
        getGuildScopedWatches: vi.fn().mockResolvedValue(null),
      });

      const service = new WatchService(repos, cache);
      const result = await service.getGuildScopedWatches("g-1");

      expect(result).toBe(watches);
      expect(cache.getGuildScopedWatches).toHaveBeenCalledWith("g-1");
      expect(
        repos.watchRepository.findManyGuildScopedByGuildId,
      ).toHaveBeenCalledWith("g-1");
      expect(cache.setGuildScopedWatches).toHaveBeenCalledWith("g-1", watches);
    });
  });

  describe("getChannelScopedWatches", async () => {
    test("cache hit -> return cached, skip repo/set", async () => {
      const watches = [createMockWatch()];
      const repos = createRepos({});
      const cache = createCache({
        getChannelScopedWatches: vi.fn().mockResolvedValue(watches),
      });

      const service = new WatchService(repos, cache);
      const result = await service.getChannelScopedWatches("g-1", "c-1");

      expect(result).toBe(watches);
      expect(cache.getChannelScopedWatches).toHaveBeenCalledWith("c-1");
      expect(
        repos.watchRepository.findManyChannelScopedByGuildIdAndChannelId,
      ).not.toHaveBeenCalled();
      expect(cache.setChannelScopedWatches).not.toHaveBeenCalled();
    });
  });

  test("cache miss -> repo fetch, set cache, return watches", async () => {
    const watches = [createMockWatch()];
    const repos = createRepos({
      watchRepository: {
        findManyChannelScopedByGuildIdAndChannelId: vi
          .fn()
          .mockResolvedValue(watches),
      },
    });
    const cache = createCache({
      getChannelScopedWatches: vi.fn().mockResolvedValue(null),
    });

    const service = new WatchService(repos, cache);
    const result = await service.getChannelScopedWatches("g-1", "c-1");

    expect(result).toBe(watches);
    expect(cache.getChannelScopedWatches).toHaveBeenCalledWith("c-1");
    expect(
      repos.watchRepository.findManyChannelScopedByGuildIdAndChannelId,
    ).toHaveBeenCalledWith("g-1", "c-1");
    expect(cache.setChannelScopedWatches).toHaveBeenCalledWith("c-1", watches);
  });

  describe("createUserWatch", async () => {
    test("invalid scope -> throw validation error", async () => {
      const repos = createRepos({});
      const cache = createCache({});
      const service = new WatchService(repos, cache);
      await expect(
        service.createUserWatch({
          name: "a",
          userId: "u-1",
          enabled: true,
          scope: "INVALID" as ScopeType,
          guildId: "g-1",
          channelId: null,
        }),
      ).rejects.toThrow(ValidationError);
    });

    test("guild scope with channels -> throw validation error", async () => {
      const repos = createRepos({});
      const cache = createCache({});
      const service = new WatchService(repos, cache);
      await expect(
        service.createUserWatch({
          name: "a",
          userId: "u-1",
          enabled: true,
          scope: "GUILD",
          guildId: "g-1",
          channelId: "c-1",
        }),
      ).rejects.toThrow(ValidationError);
    });

    test("channel scope without channel -> throw validation error", async () => {
      const repos = createRepos({});
      const cache = createCache({});

      const service = new WatchService(repos, cache);

      await expect(
        service.createUserWatch({
          name: "a",
          userId: "u-1",
          enabled: true,
          scope: "CHANNEL",
          guildId: "g-1",
          channelId: null,
        }),
      ).rejects.toThrow(ValidationError);
      expect(repos.watchRepository.create).not.toHaveBeenCalled();
      expect(cache.invalidate).not.toHaveBeenCalled();
    });

    test("valid inputs -> create watch -> invalidate watch cache", async () => {
      const watch = createMockWatch();
      const repos = createRepos({
        watchRepository: {
          create: vi.fn().mockResolvedValue(watch),
        },
      });
      const cache = createCache({});

      const service = new WatchService(repos, cache);
      const result = await service.createUserWatch({
        name: "a",
        userId: "u-1",
        enabled: true,
        scope: "GUILD",
        guildId: "g-1",
        channelId: null,
      });

      expect(result).toBe(watch);
      expect(repos.watchRepository.create).toHaveBeenCalledWith({
        name: "a",
        userId: "u-1",
        enabled: true,
        scope: "GUILD",
        guildId: "g-1",
        channelId: null,
      });
      expect(cache.invalidate).toHaveBeenCalledWith("g-1", null, "u-1", "w-1");
    });
  });

  // describe("updateUserWatch", async () => {});
  describe("deleteUserWatch", async () => {
    test("watch not found -> return null", async () => {
      const repos = createRepos({
        watchRepository: {
          findByIdAndUserId: vi.fn().mockResolvedValue(null),
        },
      });
      const cache = createCache({});

      const service = new WatchService(repos, cache);
      const result = await service.deleteUserWatch("w-1", "u-1");

      expect(result).toBeNull();
      expect(repos.watchRepository.findByIdAndUserId).toHaveBeenCalledWith(
        "w-1",
        "u-1",
      );
      expect(repos.watchRepository.deleteById).not.toHaveBeenCalled();
      expect(cache.invalidate).not.toHaveBeenCalled();
    });
  });

  test("watch found -> valid inputs -> delete watch -> invalidate watch cache", async () => {
    const watch = createMockWatch();
    const repos = createRepos({
      watchRepository: {
        findByIdAndUserId: vi.fn().mockResolvedValue(watch),
        deleteById: vi.fn().mockResolvedValue(watch),
      },
    });
    const cache = createCache({});

    const service = new WatchService(repos, cache);
    const result = await service.deleteUserWatch("w-1", "u-1");

    expect(result).toBe(watch);
    expect(repos.watchRepository.findByIdAndUserId).toHaveBeenCalledWith(
      "w-1",
      "u-1",
    );
    expect(repos.watchRepository.deleteById).toHaveBeenCalledWith("w-1");
    expect(cache.invalidate).toHaveBeenCalledWith("g-1", null, "u-1", "w-1");
  });
});
