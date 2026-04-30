import { ChatInputCommandInteraction, EmbedBuilder } from "discord.js";

import type { IServices } from "../../services";
import { titleCase } from "../../util/strings";

export const removeWatch = async (
  interaction: ChatInputCommandInteraction,
  services: IServices,
) => {
  const watchId = interaction.options.getString("id", true);

  const watch = await services.watchService.deleteUserWatch(
    watchId,
    interaction.user.id,
  );

  if (!watch) {
    return await interaction.editReply({
      content: "Watch not found",
    });
  }

  const notificationEmbed = new EmbedBuilder()
    .setColor("#5f58b6")
    .setTitle("Watch Removed")
    .setDescription("Your watch has been removed successfully.")
    .addFields(
      { name: "Name", value: `${watch.name}` },
      { name: "ID", value: `\`${watch.id}\`` },
      { name: "Enabled", value: `${watch.enabled ? "True" : "False"}` },
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

  return await interaction.editReply({
    embeds: [notificationEmbed],
  });
};
