import { ChatInputCommandInteraction, EmbedBuilder } from "discord.js";

import type { IServices } from "../../services";
import { titleCase } from "../../util/strings";

export const listWatch = async (
  interaction: ChatInputCommandInteraction,
  services: IServices,
) => {
  const watches = await services.watchService.getUserWatches(
    interaction.user.id,
    interaction.guildId!,
  );

  if (!watches || watches.length === 0) {
    return await interaction.editReply({
      content: "You have no watches in this server",
    });
  }

  const watchFields = watches.map((watch, i) => {
    const value = [
      `**Name:** ${watch.name}`,
      `**ID:** \`${watch.id}\``,
      `**Enabled:** ${watch.enabled ? "True" : "False"}`,
      `**Scope:** ${titleCase(watch.scope)}`,
      `**Server:** ${interaction.guild?.name ?? `\`${watch.guildId}\``}`,
      ...(watch.scope === "CHANNEL" && watch.channelId
        ? [`**Channel:** <#${watch.channelId}>`]
        : []),
      `**View:** \`/watch view id: ${watch.id}\``,
    ].join("\n");

    const separator = i < watches.length - 1 ? "\n\n---" : "";

    return {
      name: `**Watch Name:** ${watch.name}`,
      value: value + separator,
    };
  });

  const notificationEmbed = new EmbedBuilder()
    .setColor("#5f58b6")
    .setTitle(`Watch List of Server: ${interaction.guild!.name}`)
    .addFields(...watchFields)
    .setFooter({
      text: "Watchcord",
      iconURL: interaction.client.user?.displayAvatarURL() ?? "",
    })
    .setTimestamp(new Date());

  return await interaction.editReply({
    embeds: [notificationEmbed],
  });
};
