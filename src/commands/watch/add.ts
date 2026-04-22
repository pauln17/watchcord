import {
  ChatInputCommandInteraction,
  EmbedBuilder,
  MessageFlags,
} from "discord.js";

import type { IServices } from "../../services/initializeServices";

export const addWatch = async (
  interaction: ChatInputCommandInteraction,
  services: IServices,
) => {
  const name = interaction.options.getString("name", true);
  const scope = interaction.options.getString("scope", true);
  const channel = interaction.options.getChannel("channel");

  if (scope === "CHANNEL" && !channel) {
    return await interaction.reply({
      content: "Channel is required when scope is set to channel",
      flags: MessageFlags.Ephemeral,
    });
  }

  if (scope !== "GUILD" && scope !== "CHANNEL") {
    return await interaction.reply({
      content: "Invalid scope",
      flags: MessageFlags.Ephemeral,
    });
  }

  const watch = await services.watchService.createWatch({
    name,
    userId: interaction.user.id,
    scope,
    guildId: interaction.guildId!,
    ...(channel != null ? { channelId: channel.id } : {}),
  });

  const notificationEmbed = new EmbedBuilder()
    .setColor("#5f58b6")
    .setTitle("Watch Created")
    .setDescription(
      "Your watch has been created successfully, use `/watch view <id>` to see details.",
    )
    .addFields(
      { name: "Name", value: `${name}` },
      { name: "ID", value: `\`${watch.id}\`` },
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
