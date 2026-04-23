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

  const titleCase = (str: string) =>
    str.toLowerCase().charAt(0).toUpperCase() + str.toLowerCase().slice(1);

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

  const title = channel
    ? `Watch List of Channel: ${channel.name} <#${channel.id}>`
    : `Watch List of Server: ${interaction.guild!.name}`;

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
    .setTitle(title)
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
