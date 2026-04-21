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
  const name = interaction.options.getString("name");
  const channel = interaction.options.getChannel("channel");

  if (!name || !channel) {
    return await interaction.reply({
      content: "Missing required arguments",
      flags: MessageFlags.Ephemeral,
    });
  }

  const watch = await services.watchService.createWatch({
    name,
    userId: interaction.user.id,
    guildId: interaction.guildId!,
    channelId: channel.id,
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
