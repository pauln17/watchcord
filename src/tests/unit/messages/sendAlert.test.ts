import { describe, expect, test, vi } from "vitest";

import { notifyUser } from "../../../messages/notifyUser";
import type { ILogger } from "../../../util/logger";
import {
  createMockClient,
  createMockCondition,
  createMockWatch,
  getEmbedField,
} from "./helpers";

describe("notifyUser", () => {
  test("sends watch alert embed to watch owner", async () => {
    const { client, send } = createMockClient();
    const watch = createMockWatch();
    const condition = createMockCondition({
      name: "Deploy Mentions",
      type: "TERM",
      sensitive: true,
      include: ["deploy"],
      exclude: ["staging"],
      targetUsers: ["target-user-1"],
      targetRoles: ["target-role-1"],
    });
    const messageData = {
      authorId: "author-1",
      guildId: "g-1",
      channelId: "c-1",
      url: "https://discord.com/channels/g-1/c-1/m-99",
      content: "deploy production now",
    };
    const logger = { error: vi.fn() } as unknown as ILogger;

    await notifyUser(client, watch, [condition], messageData, logger);

    expect(client.users.fetch).toHaveBeenCalledWith("owner-1");
    expect(send).toHaveBeenCalledTimes(1);

    const payload = send.mock.calls[0]![0];
    const embed = payload.embeds[0].toJSON();

    expect(embed).toMatchObject({
      title: "Watch Triggered: Release Watch",
      footer: {
        text: "Watchcord",
        icon_url: "https://example.com/bot.png",
      },
    });
    expect(getEmbedField(embed, "Name").value).toBe("Release Watch");
    expect(getEmbedField(embed, "ID").value).toBe("`w-1`");
    expect(getEmbedField(embed, "Scope").value).toBe("Channel");
    expect(getEmbedField(embed, "Message Details").value).toBe(
      "**Author:** <@author-1>\n**Content:** deploy production now",
    );
    expect(getEmbedField(embed, "**Condition Name:** Deploy Mentions").value).toBe(
      [
        "**Name:** Deploy Mentions",
        "**ID:** `c-1`",
        "**Type:** Term",
        "**Case Sensitive:** Enabled",
        "**Include Terms (1):** deploy",
        "**Exclude Terms (1):** staging",
        "**Target Users (1):** Target User",
        "**Target Roles (1):** Target Role",
      ].join("\n"),
    );
  });

  test("truncates long message content in alert embed", async () => {
    const { client, send } = createMockClient();
    const watch = createMockWatch();
    const condition = createMockCondition({ name: "Any Message" });
    const messageData = {
      authorId: "author-1",
      guildId: "g-1",
      channelId: "c-1",
      url: "https://discord.com/channels/g-1/c-1/m-1",
      content: "a".repeat(301),
    };
    const logger = { error: vi.fn() } as unknown as ILogger;

    await notifyUser(client, watch, [condition], messageData, logger);

    const payload = send.mock.calls[0]![0];
    const embed = payload.embeds[0].toJSON();

    expect(getEmbedField(embed, "Message Details").value).toBe(
      `**Author:** <@author-1>\n**Content:** ${"a".repeat(297)}...`,
    );
  });
});
