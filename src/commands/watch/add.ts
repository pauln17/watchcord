import {
  ChatInputCommandInteraction,
  EmbedBuilder,
  MessageFlags,
} from "discord.js";

import type { IServices } from "../../services/initializeServices";
import type { WatchConditionType } from "../../types/condition";

export const addWatch = async (
  interaction: ChatInputCommandInteraction,
  services: IServices,
) => {
  if (!interaction.guildId) {
    return await interaction.reply({
      content: "This command can only be used in a guild",
      flags: MessageFlags.Ephemeral,
    });
  }

  const name = interaction.options.getString("name");
  const channel = interaction.options.getChannel("channel");
  const type = interaction.options.getString("type");
  const condition = interaction.options.getString("condition");
  const user = interaction.options.getUser("user");
  const role = interaction.options.getRole("role");

  if (!name || !channel || !type || !condition) {
    return await interaction.reply({
      content: "Missing required arguments",
      flags: MessageFlags.Ephemeral,
    });
  }

  const watch = await services.watchService.createWatch({
    name,
    userId: interaction.user.id,
    guildId: interaction.guildId,
    channelId: channel.id,
  });

  await services.watchConditionService.createWatchCondition({
    watchId: watch.id,
    type: type as WatchConditionType,
    targetUserId: user?.id ?? null,
    targetRoleId: role?.id ?? null,
    value: condition,
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
