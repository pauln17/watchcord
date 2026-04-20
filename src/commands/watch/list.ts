import {
  ChannelType,
  ChatInputCommandInteraction,
  EmbedBuilder,
  MessageFlags,
} from "discord.js";

import type { IServices } from "../../services/initializeServices";

export const listWatch = async (
  interaction: ChatInputCommandInteraction,
  services: IServices,
) => {
  if (!interaction.guild || !interaction.guildId) {
    return await interaction.reply({
      content: "This command can only be used in a guild",
      flags: MessageFlags.Ephemeral,
    });
  }

  const channel = interaction.options.getChannel("channel", false, [
    ChannelType.GuildText,
  ]);

  const notificationEmbed = new EmbedBuilder()
    .setColor("#5f58b6")
    .setTitle(`Watch List of Server: ${interaction.guild.name}`)
    .setFooter({
      text: "Watchcord",
      iconURL: interaction.client.user?.displayAvatarURL() ?? "",
    })
    .setTimestamp(new Date());

  if (channel) {
    const watches = await services.watchService.getUserWatchesByGuildAndChannel(
      interaction.guildId,
      channel.id,
      interaction.user.id,
    );

    // Build Embed Description

    notificationEmbed.setDescription(`TBD ${watches}`);
  } else {
    const watches = await services.watchService.getUserWatchesByGuild(
      interaction.guildId,
      interaction.user.id,
    );

    // Build Embed Description
    notificationEmbed.setDescription(`TBD ${watches}`);
  }

  return await interaction.reply({
    embeds: [notificationEmbed],
    flags: MessageFlags.Ephemeral,
  });
};
