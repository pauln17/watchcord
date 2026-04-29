import { Client, EmbedBuilder, type Message } from "discord.js";

import type { IServices } from "../services";
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
  client: Client,
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
        value: (
          await Promise.all(
            matchedConditions.map((condition) =>
              (async () => {
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

                const targetUserNames = await Promise.all(
                  condition.targetUsers.map(async (id) => {
                    const user = await client.users.fetch(id);
                    return user ? `${user.username}` : id;
                  }),
                );
                if (condition.targetUsers.length > 0) {
                  lines.push(
                    `**Condition User(s):** ${targetUserNames.join(", ")}`,
                  );
                }

                const targetRoleNames = await Promise.all(
                  condition.targetRoles.map(async (id) => {
                    const role = await client.guilds.cache
                      .get(watch.guildId)
                      ?.roles.fetch(id);
                    return role ? `${role.name}` : id;
                  }),
                );
                if (condition.targetRoles.length > 0) {
                  lines.push(
                    `**Condition Role(s):** ${targetRoleNames.join(", ")}`,
                  );
                }

                return lines.join("\n");
              })(),
            ),
          )
        ).join("\n\n"),
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
  client: Client,
  message: Message,
  services: IServices,
  logger: ILogger,
) {
  const { guildId, channelId, content } = message;
  if (!guildId || !channelId || !content) return;

  try {
    const [guildScopedWatches, channelScopedWatches] = await Promise.all([
      services.watchService.getGuildScopedWatches(guildId),
      services.watchService.getChannelScopedWatches(guildId, channelId),
    ]);

    const watches = [...guildScopedWatches, ...channelScopedWatches];

    await Promise.all(
      watches.map(async (watch) => {
        // if (watch.userId === message.author.id) return;

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
