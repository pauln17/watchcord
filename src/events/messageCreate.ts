import { EmbedBuilder, type Message } from "discord.js";

import type { ExtendedClient } from "../discord/ExtendedClient";
import type { Condition, Watch } from "../types";
import type { ILogger } from "../util/logger";
import { titleCase } from "../util/strings";

const matchesCondition = (condition: Condition, message: Message) => {
  const {
    sensitive,
    type,
    include,
    exclude,
    targetUsers = [],
    targetRoles = [],
  } = condition;

  if (targetUsers.length > 0 && !targetUsers.includes(message.author.id))
    return false;
  if (
    targetRoles.length > 0 &&
    (!message.member ||
      !targetRoles.some((roleId) => message.member!.roles.cache.has(roleId)))
  )
    return false;

  switch (type) {
    case "TERM":
      if (include.length === 0 && exclude.length === 0) return false;

      if (include.length > 0) {
        if (
          !include.some((term) =>
            sensitive
              ? message.content.includes(term)
              : message.content.toLowerCase().includes(term.toLowerCase()),
          )
        )
          return false;
      }

      if (exclude.length > 0) {
        if (
          exclude.some((term) =>
            sensitive
              ? message.content.includes(term)
              : message.content.toLowerCase().includes(term.toLowerCase()),
          )
        )
          return false;
      }

      return true;
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
                `**Type:** ${titleCase(condition.type)}`,
                `**Case Sensitive:** ${condition.sensitive ? "Enabled" : "Disabled"}`,
              ];

              if (condition.include.length > 0) {
                lines.push(
                  `**Include Terms (${condition.include.length}):** ${condition.include.join(", ")}`,
                );
              }
              if (condition.exclude.length > 0) {
                lines.push(
                  `**Exclude Terms (${condition.exclude.length}):** ${condition.exclude.join(", ")}`,
                );
              }

              if (condition.targetUsers.length > 0) {
                lines.push(
                  `**Condition User(s):** ${condition.targetUsers.map((id) => `<@${id}>`).join(", ")}`,
                );
              }

              if (condition.targetRoles.length > 0) {
                lines.push(
                  `**Condition Role(s):** ${condition.targetRoles.map((id) => `<@&${id}>`).join(", ")}`,
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

  try {
    const [guildScopedWatches, channelScopedWatches] = await Promise.all([
      client.services.watchService.getGuildScopedWatches(guildId),
      client.services.watchService.getChannelScopedWatches(guildId, channelId),
    ]);

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
              message: `Failed to send notification on watch: ${watch.id} to user: ${watch.userId}`,
              error,
            });
          }
        }
      }),
    );
  } catch (error) {
    logger.error({
      message: "An error occurred on message create event handler",
      error,
    });
  }
}
