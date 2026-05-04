import type { Client, Message } from "discord.js";
import { expect, vi } from "vitest";

import type { Watch } from "../../../types";
import type { Condition } from "../../../types/condition";

export const createMockClient = () => {
  const send = vi.fn();
  const users = {
    "owner-1": { send, username: "Owner" },
    "target-user-1": { username: "Target User" },
  };
  const roles = {
    "target-role-1": { name: "Target Role" },
  };

  return {
    client: {
      user: {
        displayAvatarURL: vi
          .fn()
          .mockReturnValue("https://example.com/bot.png"),
      },
      users: {
        fetch: vi.fn(async (id: keyof typeof users) => users[id] ?? null),
      },
      guilds: {
        cache: {
          get: vi.fn(() => ({
            roles: {
              fetch: vi.fn(async (id: keyof typeof roles) => roles[id] ?? null),
            },
          })),
        },
      },
    } as unknown as Client,
    send,
  };
};

export const createMockWatch = (overrides: Partial<Watch> = {}): Watch => ({
  id: "w-1",
  name: "Release Watch",
  userId: "owner-1",
  enabled: true,
  scope: "CHANNEL",
  guildId: "g-1",
  channelId: "c-1",
  conditions: [],
  ...overrides,
});

export const createMockCondition = (
  overrides: Partial<Condition> = {},
): Condition => ({
  id: "c-1",
  watchId: "w-1",
  name: "Test Condition",
  sensitive: false,
  type: "ANY",
  include: [],
  exclude: [],
  targetUsers: [],
  targetRoles: [],
  ...overrides,
});

export const createMockMessage = (overrides: {
  content: string;
  authorId: string;
  guildId?: string;
  channelId?: string;
  hasMember?: boolean;
  roleIds?: string[];
  url?: string;
}): Message => {
  const roleSet = new Set(overrides.roleIds ?? []);
  return {
    content: overrides.content,
    guildId: overrides.guildId ?? "g-1",
    channelId: overrides.channelId ?? "c-1",
    url: overrides.url ?? "https://discord.com/channels/g-1/c-1/m-1",
    author: { id: overrides.authorId } as Message["author"],
    member:
      overrides.hasMember === false
        ? null
        : ({
            roles: { cache: { has: (id: string) => roleSet.has(id) } },
          } as Message["member"]),
  } as unknown as Message;
};

export const getEmbedField = (
  embed: { fields?: { name: string; value: string }[] },
  name: string,
) => {
  const field = embed.fields?.find((field) => field.name === name);
  expect(field).toBeDefined();
  return field!;
};
