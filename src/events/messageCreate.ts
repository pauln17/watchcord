import { EmbedBuilder, type Message } from "discord.js";

import type { ExtendedClient } from "../discord/ExtendedClient";
import type { Condition, Watch } from "../types";
import type { ILogger } from "../util/logger";
import { titleCase } from "../util/strings";

const matchesCondition = (condition: Condition, message: Message) => {
  const { type, value, targetUserIds = [], targetRoleIds = [] } = condition;

  if (targetUserIds.length > 0 && !targetUserIds.includes(message.author.id))
    return false;
  if (
    targetRoleIds.length > 0 &&
    (!message.member ||
      !targetRoleIds.some((roleId) => message.member!.roles.cache.has(roleId)))
  )
    return false;

  switch (type) {
    case "TERM":
      if (typeof value !== "string") return false;
      return message.content.includes(value);
    case "REGEX":
      try {
        if (typeof value !== "string") return false;
        return new RegExp(value).test(message.content);
      } catch {
        return false;
      }
    default:
      return true;
  }
};

const sendNotification = async (
  client: ExtendedClient,
  watch: Watch,
  matchedConditions: Condition[],
  message: Message,
) => {
  const notificationEmbed = new EmbedBuilder()
    .setColor("#5f58b6")
    .setTitle(`Watch Triggered: ${watch.name}`)
    .addFields(
      { name: "Name", value: `${watch.name}` },
      { name: "ID", value: `\`${watch.id}\`` },
      {
        name: "Scope",
        value: `${titleCase(watch.scope)}`,
      },
      {
        name: "Triggered By",
        value: `<@${message.author.id}> in ${message.url}`,
      },
      {
        name: "Message",
        value:
          message.content.length <= 300
            ? message.content
            : `${message.content.slice(0, 297)}...`,
      },
      {
        name: `Conditions Matched (${matchedConditions.length})`,
        value: matchedConditions
          .map((condition) =>
            (() => {
              const lines: string[] = [
                `**Name:** ${condition.name}`,
                `**Type:** ${condition.type ? titleCase(condition.type) : "N/A"}`,
                `**Value:** ${condition.value ?? "N/A"}`,
              ];

              if (condition.targetUserIds.length > 0) {
                lines.push(
                  `**Condition User(s):** ${condition.targetUserIds.map((id) => `<@${id}>`).join(", ")}`,
                );
              }

              if (condition.targetRoleIds.length > 0) {
                lines.push(
                  `**Condition Role(s):** ${condition.targetRoleIds.map((id) => `<@&${id}>`).join(", ")}`,
                );
              }

              return lines.join("\n");
            })(),
          )
          .join("\n\n"),
      },
    )
    .setFooter({
      text: "Watchcord",
      iconURL: client.user?.displayAvatarURL() ?? "",
    })
    .setTimestamp(new Date());

  const user = await client.users.fetch(watch.userId);
  await user.send({ embeds: [notificationEmbed] });
};

export async function handleMessageCreate(
  client: ExtendedClient,
  message: Message,
  logger: ILogger,
) {
  const { guildId, channelId, content } = message;
  if (!guildId || !channelId || !content) return;

  const guildScopedWatches =
    await client.services.watchService.getGuildScopedWatches(guildId);
  const channelScopedWatches =
    await client.services.watchService.getChannelScopedWatches(
      guildId,
      channelId,
    );

  const watches = [...guildScopedWatches, ...channelScopedWatches];

  await Promise.all(
    watches.map(async (watch) => {
      if (watch.userId === message.author.id) return;

      const matchedConditions = watch.conditions.filter((condition) =>
        matchesCondition(condition, message),
      );

      if (matchedConditions.length > 0) {
        try {
          await sendNotification(client, watch, matchedConditions, message);
        } catch (error) {
          logger.error({
            message: "Failed to send watch notification",
            error,
          });
        }
      }
    }),
  );
}
