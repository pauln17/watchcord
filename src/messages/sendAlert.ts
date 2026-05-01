import { Client, EmbedBuilder, type Message } from "discord.js";

import type { Condition, Watch } from "../types";
import { titleCase } from "../util/strings";

export const sendAlert = async (
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
