import {
  ChatInputCommandInteraction,
  EmbedBuilder,
  SlashCommandBuilder,
} from "discord.js";

export const data = new SlashCommandBuilder()
  .setName("cmds")
  .setDescription("View Watchcord commands")
  .toJSON();

export async function execute(interaction: ChatInputCommandInteraction) {
  const embed = new EmbedBuilder()
    .setColor("#5f58b6")
    .setTitle("Watchcord Commands")
    .setDescription(
      "Create a watch, add conditions, and Watchcord will DM you when a matching message appears.",
    )
    .addFields(
      {
        name: "Watches",
        value: [
          "`/watch add` - Create a watch for this server or a text channel",
          "`/watch list` - List your watches in this server",
          "`/watch view` - View a watch and its conditions",
          "`/watch edit` - Update a watch's name, scope, channel, or status",
          "`/watch remove` - Remove a watch",
        ].join("\n"),
      },
      {
        name: "Conditions",
        value: [
          "`/condition add` - Add a condition to a watch",
          "`/condition remove` - Remove a condition",
        ].join("\n"),
      },
    )
    .setFooter({
      text: "Use Discord's command picker to fill in each option",
      iconURL: interaction.client.user?.displayAvatarURL() ?? "",
    })
    .setTimestamp(new Date());

  return interaction.editReply({
    embeds: [embed],
  });
}
