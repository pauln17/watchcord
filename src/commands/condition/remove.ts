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
      { name: "Name", value: condition.name },
      { name: "ID", value: `\`${condition.id}\`` },
      { name: "Type", value: condition.type },
      {
        name: "Case Sensitive",
        value: condition.sensitive ? "Enabled" : "Disabled",
      },
      ...(condition.include.length > 0
        ? [
            {
              name: `Include Terms (${condition.include.length})`,
              value: condition.include.join(", "),
            },
          ]
        : []),
      ...(condition.exclude.length > 0
        ? [
            {
              name: `Exclude Terms (${condition.exclude.length})`,
              value: condition.exclude.join(", "),
            },
          ]
        : []),
      ...(condition.targetUsers.length > 0
        ? [
            {
              name: `Target Users (${condition.targetUsers.length})`,
              value: condition.targetUsers.map((id) => `<@${id}>`).join(", "),
            },
          ]
        : []),
      ...(condition.targetRoles.length > 0
        ? [
            {
              name: `Target Roles (${condition.targetRoles.length})`,
              value: condition.targetRoles.map((id) => `<@&${id}>`).join(", "),
            },
          ]
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
