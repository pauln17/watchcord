import {
  ChatInputCommandInteraction,
  EmbedBuilder,
  MessageFlags,
} from "discord.js";

import type { IServices } from "../../services";
import type { ScopeType } from "../../types";
import { titleCase } from "../../util/strings";

export const editWatch = async (
  interaction: ChatInputCommandInteraction,
  services: IServices,
) => {
  const watchId = interaction.options.getString("id", true);
  const name = interaction.options.getString("name");
  const scope = interaction.options.getString("scope") as ScopeType;
  const channel = interaction.options.getChannel("channel");

  const watch = await services.watchService.updateUserWatch(
    watchId,
    interaction.user.id,
    {
      ...(name != null ? { name } : {}),
      ...(scope != null ? { scope } : {}),
      ...(channel != null ? { channelId: channel.id } : {}),
    },
  );

  if (!watch) {
    return await interaction.reply({
      content: "Watch not found",
      flags: MessageFlags.Ephemeral,
    });
  }

  const notificationEmbed = new EmbedBuilder()
    .setColor("#5f58b6")
    .setTitle("Watch Edited")
    .setDescription("Your watch has been edited successfully.")
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
