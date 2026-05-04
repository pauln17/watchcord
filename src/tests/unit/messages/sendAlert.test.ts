import { describe, expect, test } from "vitest";

import { sendAlert } from "../../../messages/notifyUser";
import {
  createMockClient,
  createMockCondition,
  createMockMessage,
  createMockWatch,
  getEmbedField,
} from "./helpers";

describe("sendAlert", () => {
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
    const message = createMockMessage({
      content: "deploy production now",
      authorId: "author-1",
      url: "https://discord.com/channels/g-1/c-1/m-99",
    });

    await sendAlert(client, watch, [condition], message);

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
    expect(getEmbedField(embed, "Triggered By").value).toBe(
      "<@author-1> in https://discord.com/channels/g-1/c-1/m-99",
    );
    expect(getEmbedField(embed, "Message").value).toBe("deploy production now");
    expect(getEmbedField(embed, "Conditions Matched (1)").value).toBe(
      [
        "**Name:** Deploy Mentions",
        "**Type:** Term",
        "**Case Sensitive:** Enabled",
        "**Include Terms (1):** deploy",
        "**Exclude Terms (1):** staging",
        "**Condition User(s):** Target User",
        "**Condition Role(s):** Target Role",
      ].join("\n"),
    );
  });

  test("truncates long message content in alert embed", async () => {
    const { client, send } = createMockClient();
    const watch = createMockWatch();
    const condition = createMockCondition({ name: "Any Message" });
    const message = createMockMessage({
      content: "a".repeat(301),
      authorId: "author-1",
    });

    await sendAlert(client, watch, [condition], message);

    const payload = send.mock.calls[0]![0];
    const embed = payload.embeds[0].toJSON();

    expect(getEmbedField(embed, "Message").value).toBe(`${"a".repeat(297)}...`);
  });
});
