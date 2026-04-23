import {
  ChatInputCommandInteraction,
  EmbedBuilder,
  MessageFlags,
} from "discord.js";

import type { IServices } from "../../services/initializeServices";

export const removeWatch = async (
  interaction: ChatInputCommandInteraction,
  services: IServices,
) => {
  const watchId = interaction.options.getString("id", true);

  const titleCase = (str: string) =>
    str.toLowerCase().charAt(0).toUpperCase() + str.toLowerCase().slice(1);

  const existing = await services.watchService.getWatchById(
    watchId,
    interaction.user.id,
  );

  if (!existing) {
    return await interaction.reply({
      content: "Watch not found",
      flags: MessageFlags.Ephemeral,
    });
  }

  const watch = await services.watchService.deleteWatch(
    watchId,
    interaction.user.id,
  );
  if (!watch) {
    return await interaction.reply({
      content: "Failed to remove watch",
      flags: MessageFlags.Ephemeral,
    });
  }

  const notificationEmbed = new EmbedBuilder()
    .setColor("#5f58b6")
    .setTitle("Watch Removed")
    .setDescription("Your watch has been removed successfully.")
    .addFields(
      { name: "Name", value: `${watch.name}` },
      { name: "ID", value: `\`${watch.id}\`` },
      { name: "Scope", value: `${titleCase(watch.scope)}` },
      { name: "Server", value: `${interaction.guild?.name}` },
      ...(watch.scope === "CHANNEL" && watch.channelId
        ? [{ name: "Channel", value: `<#${watch.channelId}>` }]
        : []),
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
