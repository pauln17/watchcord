import { Client, EmbedBuilder } from "discord.js";

import { CONDITION_LIMITS } from "../constants";
import type { Condition, Watch } from "../types";
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
) => {
  const { authorId, guildId, channelId, url, content } = messageData;

  const conditionFields =
    conditions.length >= CONDITION_LIMITS.MAX_CONDITIONS
      ? [
          {
            name: "Conditions Matched",
            value: `${conditions.length} conditions matched — exceeds the maximum that can be listed in one notification.`,
          },
        ]
      : await Promise.all(
          conditions.map(async (condition, i) => {
            const targetUserNames = await Promise.all(
              condition.targetUsers.map(async (id) => {
                const user = await client.users.fetch(id);
                return user ? user.username : id;
              }),
            );
            const targetRoleNames = await Promise.all(
              condition.targetRoles.map(async (id) => {
                const role = await client.guilds.cache
                  .get(watch.guildId)
                  ?.roles.fetch(id);
                return role ? role.name : id;
              }),
            );

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
          }),
        );

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
