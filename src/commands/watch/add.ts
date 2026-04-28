import { ChatInputCommandInteraction, EmbedBuilder } from "discord.js";

import type { IServices } from "../../services";
import type { ScopeType } from "../../types";
import { titleCase } from "../../util/strings";

export const addWatch = async (
  interaction: ChatInputCommandInteraction,
  services: IServices,
) => {
  const name = interaction.options.getString("name", true);
  const scope = interaction.options.getString("scope", true) as ScopeType;
  const channel = interaction.options.getChannel("channel");

  const watch = await services.watchService.createUserWatch({
    name,
    userId: interaction.user.id,
    scope,
    guildId: interaction.guildId!,
    channelId: channel?.id ?? null,
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
