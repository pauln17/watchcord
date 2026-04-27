import {
  ChatInputCommandInteraction,
  EmbedBuilder,
  MessageFlags,
} from "discord.js";

import type { IServices } from "../../services";
import type { ConditionType } from "../../types";

export const addCondition = async (
  interaction: ChatInputCommandInteraction,
  services: IServices,
) => {
  const watchId = interaction.options.getString("watch-id", true);
  const name = interaction.options.getString("name", true);
  const type = (interaction.options.getString("type") as ConditionType) ?? null;
  const value = interaction.options.getString("value");
  const targetUserIds = interaction.options.getString("target-user-ids");
  const targetRoleIds = interaction.options.getString("target-role-ids");

  const watch = await services.watchService.getUserWatch(
    watchId,
    interaction.user.id,
  );
  if (!watch) {
    return await interaction.reply({
      content: "Watch not found",
      flags: MessageFlags.Ephemeral,
    });
  }

  const condition = await services.conditionService.createUserCondition({
    name,
    watchId,
    type,
    value,
    targetUserIds: targetUserIds
      ? targetUserIds.split(",").map((id: string) => id.trim())
      : [],
    targetRoleIds: targetRoleIds
      ? targetRoleIds.split(",").map((id: string) => id.trim())
      : [],
  });

  const notificationEmbed = new EmbedBuilder()
    .setColor("#5f58b6")
    .setTitle("Condition Created")
    .setDescription("Your condition has been created successfully")
    .addFields(
      { name: "Name", value: `${condition.name}` },
      { name: "ID", value: `\`${condition.id}\`` },
      { name: "Type", value: `${condition.type ?? "N/A"}` },
      { name: "Value", value: `${condition.value ?? "N/A"}` },
      {
        name: "Target User IDs",
        value:
          condition.targetUserIds.length > 0
            ? condition.targetUserIds.map((id: string) => `<@${id}>`).join(", ")
            : "None",
      },
      {
        name: "Target Role IDs",
        value:
          condition.targetRoleIds.length > 0
            ? condition.targetRoleIds
                .map((id: string) => `<@&${id}>`)
                .join(", ")
            : "None",
      },
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
