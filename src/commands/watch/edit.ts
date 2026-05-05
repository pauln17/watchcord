import { ChatInputCommandInteraction, EmbedBuilder } from "discord.js";

import type { IServices } from "../../services";
import type { ScopeType } from "../../types";
import { ValidationError } from "../../util/error";
import { titleCase } from "../../util/strings";

export const editWatch = async (
  interaction: ChatInputCommandInteraction,
  services: IServices,
) => {
  const watchId = interaction.options.getString("id", true);
  const name = interaction.options.getString("name");
  const enabled = interaction.options.getBoolean("enabled");
  const scope = interaction.options.getString("scope") as ScopeType;
  const channel = interaction.options.getChannel("channel");

  if (
    name === undefined &&
    scope === undefined &&
    enabled === undefined &&
    channel === undefined
  )
    throw new ValidationError("At least one option is required");

  if (scope !== undefined && scope !== "GUILD" && scope !== "CHANNEL")
    throw new ValidationError("Invalid scope");

  if (scope === "GUILD" && channel)
    throw new ValidationError("Guild scope cannot be used with a channel");

  if (scope === "CHANNEL" && !channel)
    throw new ValidationError(
      "Channel is required when scope is set to channel",
    );

  const watch = await services.watchService.updateUserWatch(
    watchId,
    interaction.user.id,
    {
      ...(name != null ? { name } : {}),
      ...(enabled != null ? { enabled } : {}),
      ...(scope != null ? { scope } : {}),
      ...(channel != null ? { channelId: channel.id } : {}),
    },
  );

  if (!watch) {
    return await interaction.editReply({
      content: "Watch not found",
    });
  }

  if (watch.scope === "GUILD" && channel !== undefined)
    throw new ValidationError("Guild scope cannot be used with a channel");

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

  return await interaction.editReply({
    embeds: [notificationEmbed],
  });
};
