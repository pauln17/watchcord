import { ChatInputCommandInteraction, EmbedBuilder } from "discord.js";

import type { IServices } from "../../services";
import type { ConditionType } from "../../types";

const parseList = (list: string | null): string[] => {
  if (!list) return [];
  return list
    .split(",")
    .map((item) => item.trim())
    .filter((item) => item !== "");
};

export const addCondition = async (
  interaction: ChatInputCommandInteraction,
  services: IServices,
) => {
  const watchId = interaction.options.getString("watch-id", true);
  const name = interaction.options.getString("name", true);
  const type = interaction.options.getString("type", true) as ConditionType;
  const sensitive = interaction.options.getBoolean("sensitive") ?? false;
  const include = parseList(interaction.options.getString("include"));
  const exclude = parseList(interaction.options.getString("exclude"));
  const targetUsers = parseList(interaction.options.getString("target-users"));
  const targetRoles = parseList(interaction.options.getString("target-roles"));

  const watch = await services.watchService.getUserWatch(
    watchId,
    interaction.user.id,
  );

  if (!watch) {
    return await interaction.editReply({
      content: "Watch not found",
    });
  }

  const condition = await services.conditionService.createUserCondition(
    {
      name,
      watchId,
      type,
      sensitive,
      include,
      exclude,
      targetUsers,
      targetRoles,
    },
    watch.guildId,
    watch.channelId,
    watch.userId,
  );

  const notificationEmbed = new EmbedBuilder()
    .setColor("#5f58b6")
    .setTitle("Condition Created")
    .setDescription("Your condition has been created successfully")
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
