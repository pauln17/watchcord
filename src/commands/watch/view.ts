import { ChatInputCommandInteraction, EmbedBuilder } from "discord.js";

import type { IServices } from "../../services";
import { titleCase } from "../../util/strings";

export const viewWatch = async (
  interaction: ChatInputCommandInteraction,
  services: IServices,
) => {
  const watchId = interaction.options.getString("id", true);

  const watch = await services.watchService.getUserWatch(
    watchId,
    interaction.user.id,
  );

  if (!watch) {
    return await interaction.editReply({
      content: "Watch not found",
    });
  }

  const conditions = watch.conditions
    .map((condition) =>
      [
        `**Name:** ${condition.name}`,
        `**ID:** \`${condition.id}\``,
        `**Type:** ${condition.type}`,
        `**Case Sensitive:** ${condition.sensitive ? "Enabled" : "Disabled"}`,
        condition.include.length > 0 &&
          `**Include Terms (${condition.include.length}):** ${condition.include.join(", ")}`,
        condition.exclude.length > 0 &&
          `**Exclude Terms (${condition.exclude.length}):** ${condition.exclude.join(", ")}`,
        condition.targetUsers.length > 0 &&
          `**Target Users (${condition.targetUsers.length}):** ${condition.targetUsers.map((id) => `<@${id}>`).join(", ")}`,
        condition.targetRoles.length > 0 &&
          `**Target Roles (${condition.targetRoles.length}):** ${condition.targetRoles.map((id) => `<@&${id}>`).join(", ")}`,
      ]
        .filter(Boolean)
        .join("\n"),
    )
    .join("\n\n");

  const notificationEmbed = new EmbedBuilder()
    .setColor("#5f58b6")
    .setTitle(`Watch Details: ${watch.name}`)
    .addFields(
      { name: "Name", value: `${watch.name}` },
      { name: "ID", value: `\`${watch.id}\`` },
      { name: "Enabled", value: `${watch.enabled ? "True" : "False"}` },
      { name: "Scope", value: `${titleCase(watch.scope)}` },
      { name: "Server", value: `${interaction.guild?.name}` },
      ...(watch.scope === "CHANNEL" && watch.channelId
        ? [{ name: "Channel", value: `<#${watch.channelId}>` }]
        : []),
      {
        name: `Conditions (${watch.conditions.length})`,
        value: conditions ? conditions : "Empty",
      },
    )
    .setFooter({
      text: "Watchcord",
      iconURL: interaction.client.user?.displayAvatarURL() ?? "",
    })
    .setTimestamp(new Date());

  return await interaction.editReply({
    embeds: [notificationEmbed],
  });
};
