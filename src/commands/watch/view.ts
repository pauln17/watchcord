import {
  ChatInputCommandInteraction,
  EmbedBuilder,
  MessageFlags,
} from "discord.js";

import type { IServices } from "../../services/initializeServices";

export const viewWatch = async (
  interaction: ChatInputCommandInteraction,
  services: IServices,
) => {
  const watchId = interaction.options.getString("id", true);
  const userId = interaction.user.id;
  const watch = await services.watchService.getWatchById(watchId, userId);

  if (!watch) {
    return await interaction.reply({
      content: "Watch not found",
      flags: MessageFlags.Ephemeral,
    });
  }

  let conditions = "";

  watch.conditions.forEach((condition) => {
    conditions += [
      `**${condition.name}**`,
      `Type: ${condition.type}`,
      `Value: ${condition.value}`,
      condition.targetUserId && `User: <@${condition.targetUserId}>`,
      condition.targetRoleId && `Role: <@&${condition.targetRoleId}>`,
      `View: \`/condition view id: ${condition.id}\``,
      "\n",
    ]
      .filter(Boolean)
      .join("\n");
  });

  const notificationEmbed = new EmbedBuilder()
    .setColor("#5f58b6")
    .setTitle(`Watch Details: ${watch.name}`)
    .addFields(
      { name: "Name", value: `${watch.name}` },
      { name: "ID", value: `\`${watch.id}\`` },
      { name: "Channel", value: `<#${watch.channelId}>` },
      {
        name: "Conditions",
        value: conditions,
      },
    )
    .setFooter({
      text: "Watchcord",
      iconURL: interaction.client.user?.displayAvatarURL() ?? "",
    })
    .setTimestamp(new Date());

  return await interaction.reply({
    embeds: [notificationEmbed],
    flags: MessageFlags.Ephemeral,
  });
};
