import { Client, EmbedBuilder } from "discord.js";

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
      { name: "Server", value: `${client.guilds.cache.get(guildId)?.name}` },
      { name: "Channel", value: `<#${channelId}>` },
      { name: "Link", value: `${url}` },
      {
        name: "Message Details",
        value: `${[
          `**Author:** <@${authorId}>`,
          `**Content:** ${content.length <= 300 ? content : `${content.slice(0, 297)}...`}`,
        ].join("\n")}`,
      },
      {
        name: `Conditions Matched (${conditions.length})`,
        value: (
          await Promise.all(
            conditions.map((condition) =>
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
