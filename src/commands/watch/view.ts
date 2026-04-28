import { ChatInputCommandInteraction, EmbedBuilder } from "discord.js";

import type { IServices } from "../../services";
import { titleCase } from "../../util/strings";

export const viewWatch = async (
  interaction: ChatInputCommandInteraction,
  services: IServices,
) => {
  const watchId = interaction.options.getString("id", true);

  const watch = await services.watchService.getUserWatch(
    watchId,
    interaction.user.id,
  );

  if (!watch) {
    return await interaction.editReply({
      content: "Watch not found",
    });
  }

  let conditions = "";
  watch.conditions.forEach((condition) => {
    conditions += [
      `Name: ${condition.name}`,
      `Type: ${condition.type ?? "N/A"}`,
      `Value: ${condition.value ?? "N/A"}`,
      condition.targetUserIds.length > 0 &&
        `User(s): ${condition.targetUserIds.map((id: string) => `<@${id}>`).join(", ")}`,
      condition.targetRoleIds.length > 0 &&
        `Role(s): ${condition.targetRoleIds.map((id: string) => `<@&${id}>`).join(", ")}`,
      "\n",
    ]
      .filter(Boolean)
      .join("\n");
  });

  const notificationEmbed = new EmbedBuilder()
    .setColor("#5f58b6")
    .setTitle(`Watch Details: ${watch.name}`)
    .addFields(
      { name: "Name", value: `${watch.name}` },
      { name: "ID", value: `\`${watch.id}\`` },
      { name: "Scope", value: `${titleCase(watch.scope)}` },
      { name: "Server", value: `${interaction.guild?.name}` },
      ...(watch.scope === "CHANNEL" && watch.channelId
        ? [{ name: "Channel", value: `<#${watch.channelId}>` }]
        : []),
      {
        name: `Conditions (${watch.conditions.length})`,
        value: conditions ? conditions : "Empty",
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
