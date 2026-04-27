import {
  ChatInputCommandInteraction,
  EmbedBuilder,
  MessageFlags,
} from "discord.js";

import type { IServices } from "../../services";
import { titleCase } from "../../util/strings";

export const editWatch = async (
  interaction: ChatInputCommandInteraction,
  services: IServices,
) => {
  const watchId = interaction.options.getString("id", true);
  const name = interaction.options.getString("name");
  const scope = interaction.options.getString("scope");
  const channel = interaction.options.getChannel("channel");

  if (!name && !scope && !channel) {
    return await interaction.reply({
      content: "At least one option is required",
      flags: MessageFlags.Ephemeral,
    });
  }

  if (scope != null && scope !== "GUILD" && scope !== "CHANNEL") {
    return await interaction.reply({
      content: "Invalid scope",
      flags: MessageFlags.Ephemeral,
    });
  }

  if (scope === "CHANNEL" && !channel) {
    return await interaction.reply({
      content: "Channel is required when scope is set to channel",
      flags: MessageFlags.Ephemeral,
    });
  }

  if (scope === "GUILD" && channel) {
    return await interaction.reply({
      content: "Guild scope cannot be used with a channel",
      flags: MessageFlags.Ephemeral,
    });
  }

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
      content: "Failed to edit watch",
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
