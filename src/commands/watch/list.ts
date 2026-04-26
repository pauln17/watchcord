import {
  ChatInputCommandInteraction,
  EmbedBuilder,
  MessageFlags,
} from "discord.js";

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
    return await interaction.reply({
      content: "You have no watches in this server",
      flags: MessageFlags.Ephemeral,
    });
  }

  const description = watches
    .map((watch) => {
      return [
        `**Name:** ${watch.name}`,
        `**ID:** \`${watch.id}\``,
        `**Scope:** ${titleCase(watch.scope)}`,
        `**Server:** ${interaction.guild?.name ?? `\`${watch.guildId}\``}`,
        ...(watch.scope === "CHANNEL" && watch.channelId
          ? [`**Channel:** <#${watch.channelId}>`]
          : []),
        `**View:** \`/watch view id: ${watch.id}\``,
      ].join("\n");
    })
    .join("\n\n---\n\n");

  const notificationEmbed = new EmbedBuilder()
    .setColor("#5f58b6")
    .setTitle(`Watch List of Server: ${interaction.guild!.name}`)
    .setDescription(description)
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
