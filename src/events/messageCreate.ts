import { EmbedBuilder, type Message } from "discord.js";

import type { ExtendedClient } from "../discord/ExtendedClient";
import type { Watch,WatchCondition } from "../types";
import type { ILogger } from "../util/logger";

const matchesCondition = (condition: WatchCondition, message: Message) => {
  const { type, value, targetUserId, targetRoleId } = condition;

  if (targetUserId && targetUserId !== message.author.id) {
    return false;
  }

  if (targetRoleId && !message.member?.roles.cache.has(targetRoleId)) {
    return false;
  }

  switch (type) {
    case "TERM":
      return message.content.includes(value);
    case "REGEX":
      try {
        return new RegExp(value).test(message.content);
      } catch {
        return false;
      }
    default:
      return false;
  }
};

const sendNotification = async (
  client: ExtendedClient,
  watch: Watch,
  matchedConditions: WatchCondition[],
  message: Message,
  logger: ILogger,
) => {
  const titleCase = (str: string) =>
    str.toLowerCase().charAt(0).toUpperCase() + str.toLowerCase().slice(1);

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
            [
              `**Name:** ${condition.name}`,
              condition.targetUserId &&
                `**Condition User:** <@${condition.targetUserId}>`,
              condition.targetRoleId &&
                `**Condition Role:** <@&${condition.targetRoleId}>`,
              `**${titleCase(condition.type)}:** ${condition.value}`,
            ]
              .filter(Boolean)
              .join("\n"),
          )
          .join("\n\n"),
      },
    )
    .setFooter({
      text: "Watchcord",
      iconURL: client.user?.displayAvatarURL() ?? "",
    })
    .setTimestamp(new Date());

  try {
    const user = await client.users.fetch(watch.userId);
    await user.send({ embeds: [notificationEmbed] });
  } catch (error) {
    logger.error({
      message: "Failed to send watch notification DM",
      error: { watchId: watch.id, userId: watch.userId, cause: error },
    });
  }
};

export async function handleMessageCreate(
  client: ExtendedClient,
  message: Message,
  logger: ILogger,
) {
  if (message.author.bot) {
    return;
  }

  const { guildId, channelId, content } = message;
  if (!guildId || !channelId || !content) {
    return;
  }

  const redis = client.redis;

  const watchIds = Array.from(
    new Set([
      ...(await redis.sMembers(`wc:guilds:${guildId}:all`)),
      ...(await redis.sMembers(`wc:guilds:${guildId}:channels:${channelId}`)),
    ]),
  );

  if (watchIds.length === 0) {
    return;
  }

  const watches: Watch[] = (
    await redis.mGet(watchIds.map((id) => `wc:watches:${id}`))
  )
    .filter((value): value is string => value !== null)
    .map((watch) => JSON.parse(watch) as Watch);

  await Promise.all(
    watches.map(async (watch) => {
      const matchedConditions = watch.conditions.filter((condition) =>
        matchesCondition(condition, message),
      );

      if (matchedConditions.length > 0) {
        console.log(matchedConditions);
        await sendNotification(
          client,
          watch,
          matchedConditions,
          message,
          logger,
        );
      }
    }),
  );
}
