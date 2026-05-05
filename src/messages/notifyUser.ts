import { Client, EmbedBuilder } from "discord.js";

import { CONDITION_LIMITS } from "../constants";
import type { Condition, Watch } from "../types";
import type { ILogger } from "../util/logger";
import { titleCase } from "../util/strings";

export const notifyUser = async (
  client: Client,
  watch: Watch,
  conditions: Condition[],
  messageData: {
    authorId: string;
    guildId: string;
    channelId: string;
    url: string;
    content: string;
  },
  logger: ILogger,
) => {
  const { authorId, guildId, channelId, url, content } = messageData;
  const mappedUsernames = new Map<string, string>();
  const mappedRoleNames = new Map<string, string>();
  for (const condition of conditions) {
    for (const targetUser of condition.targetUsers) {
      if (mappedUsernames.has(targetUser)) continue;
      const cachedUser = client.users.cache.get(targetUser);
      if (cachedUser) {
        mappedUsernames.set(targetUser, cachedUser.username);
      } else {
        try {
          const fetchedUser = await client.users.fetch(targetUser);
          mappedUsernames.set(targetUser, fetchedUser.username);
        } catch (error) {
          logger.error({
            message: "Failed to fetch user",
            error,
          });
        }
      }
    }

    for (const targetRole of condition.targetRoles) {
      if (mappedRoleNames.has(targetRole)) continue;
      const cachedRole = client.guilds.cache
        .get(watch.guildId)
        ?.roles.cache.get(targetRole);
      if (cachedRole) {
        mappedRoleNames.set(targetRole, cachedRole.name);
      } else {
        try {
          const fetchedRole = await client.guilds.cache
            .get(watch.guildId)
            ?.roles.fetch(targetRole);
          mappedRoleNames.set(targetRole, fetchedRole?.name ?? targetRole);
        } catch (error) {
          logger.error({
            message: "Failed to fetch role",
            error,
          });
        }
      }
    }
  }

  const conditionFields =
    conditions.length >= CONDITION_LIMITS.MAX_CONDITIONS
      ? [
          {
            name: "Conditions Matched",
            value: `${conditions.length} conditions matched — exceeds the maximum that can be listed in one notification.`,
          },
        ]
      : conditions.map((condition, i) => {
          const targetUserNames = condition.targetUsers.map((id) => {
            return mappedUsernames.get(id) ?? id;
          });

          const targetRoleNames = condition.targetRoles.map((id) => {
            return mappedRoleNames.get(id) ?? id;
          });

          const value = [
            `**Name:** ${condition.name}`,
            `**ID:** \`${condition.id}\``,
            `**Type:** ${titleCase(condition.type)}`,
            `**Case Sensitive:** ${condition.sensitive ? "Enabled" : "Disabled"}`,
            condition.include.length > 0 &&
              `**Include Terms (${condition.include.length}):** ${condition.include.join(", ")}`,
            condition.exclude.length > 0 &&
              `**Exclude Terms (${condition.exclude.length}):** ${condition.exclude.join(", ")}`,
            condition.targetUsers.length > 0 &&
              `**Target Users (${condition.targetUsers.length}):** ${targetUserNames.join(", ")}`,
            condition.targetRoles.length > 0 &&
              `**Target Roles (${condition.targetRoles.length}):** ${targetRoleNames.join(", ")}`,
          ]
            .filter(Boolean)
            .join("\n");

          const separator = i < conditions.length - 1 ? "\n\n---" : "";

          return {
            name: `**Condition Name:** ${condition.name}`,
            value: value + separator,
          };
        });

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
        name: "Server",
        value: `${client.guilds.cache.get(guildId)?.name ?? guildId}`,
      },
      { name: "Channel", value: `<#${channelId}>` },
      { name: "Link", value: `${url}` },
      {
        name: "Message Details",
        value: `${[
          `**Author:** <@${authorId}>`,
          `**Content:** ${content.length <= 300 ? content : `${content.slice(0, 297)}...`}`,
        ].join("\n")}`,
      },
      ...conditionFields,
    )
    .setFooter({
      text: "Watchcord",
      iconURL: client.user?.displayAvatarURL() ?? "",
    })
    .setTimestamp(new Date());

  const user = await client.users.fetch(watch.userId);
  await user.send({ embeds: [notificationEmbed] });
};
