import {
  ChatInputCommandInteraction,
  EmbedBuilder,
  MessageFlags,
} from "discord.js";

import type { IServices } from "../../services/initializeServices";

export const editWatch = async (
  interaction: ChatInputCommandInteraction,
  services: IServices,
) => {
  const watchId = interaction.options.getString("id", true);
  const userId = interaction.user.id;
  const name = interaction.options.getString("name");
  const channel = interaction.options.getChannel("channel");

  const updated = await services.watchService.updateWatch(watchId, userId, {
    ...(name != null ? { name } : {}),
    ...(channel != null ? { channelId: channel.id } : {}),
  });

  if (!updated) {
    return await interaction.reply({
      content: "Failed to edit watch",
      flags: MessageFlags.Ephemeral,
    });
  }

  const notificationEmbed = new EmbedBuilder()
    .setColor("#5f58b6")
    .setTitle("Watch Edited")
    .setDescription("Your watch has been edited successfully.")
    .addFields(
      { name: "Name", value: `${updated.name}` },
      { name: "ID", value: `\`${updated.id}\`` },
    )
    .setFooter({
      text: "Watchcord",
      iconURL: interaction.client.user?.displayAvatarURL() ?? "",
    });

  return await interaction.reply({
    embeds: [notificationEmbed],
    flags: MessageFlags.Ephemeral,
  });
};
