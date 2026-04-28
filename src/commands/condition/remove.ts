import { ChatInputCommandInteraction, EmbedBuilder } from "discord.js";

import type { IServices } from "../../services";

export const removeCondition = async (
  interaction: ChatInputCommandInteraction,
  services: IServices,
) => {
  const conditionId = interaction.options.getString("id", true);

  const condition = await services.conditionService.deleteUserCondition(
    conditionId,
    interaction.user.id,
  );

  if (!condition) {
    return await interaction.editReply({
      content: "Condition not found",
    });
  }

  const notificationEmbed = new EmbedBuilder()
    .setColor("#5f58b6")
    .setTitle("Condition Removed")
    .setDescription("Your condition has been removed successfully.")
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

  return await interaction.editReply({
    embeds: [notificationEmbed],
  });
};
