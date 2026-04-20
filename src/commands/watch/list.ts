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
  const channel = interaction.options.getChannel("channel", false, [
    ChannelType.GuildText,
  ]);

  const watches = channel
    ? await services.watchService.getUserWatchesByGuildAndChannel(
        interaction.guildId!,
        channel.id,
        interaction.user.id,
      )
    : await services.watchService.getUserWatchesByGuild(
        interaction.guildId!,
        interaction.user.id,
      );

  if (!watches || watches.length === 0) {
    return await interaction.reply({
      content: "You have no watches in this server",
      flags: MessageFlags.Ephemeral,
    });
  }

  const notificationEmbed = new EmbedBuilder()
    .setColor("#5f58b6")
    .setTitle(`Watch List of Server: ${interaction.guild!.name}`)
    .setFooter({
      text: "Watchcord",
      iconURL: interaction.client.user?.displayAvatarURL() ?? "",
    })
    .setTimestamp(new Date());

  let description = "";
  watches.forEach((watch) => {
    const channelName =
      interaction.guild?.channels.cache.get(watch.channelId)?.name ??
      "Unknown Channel";

    description += [
      `**${watch.name}**`,
      `Channel: ${channelName} <#${watch.channelId}>`,
      `View: \`/watch view id: ${watch.id}\``,
      "\n",
    ].join("\n");
  });

  notificationEmbed.setDescription(description);

  return await interaction.reply({
    embeds: [notificationEmbed],
    flags: MessageFlags.Ephemeral,
  });
};
