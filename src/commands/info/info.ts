import {
  ChatInputCommandInteraction,
  EmbedBuilder,
  SlashCommandBuilder,
} from "discord.js";

export const data = new SlashCommandBuilder()
  .setName("info")
  .setDescription("Learn what Watchcord does")
  .toJSON();

export async function execute(interaction: ChatInputCommandInteraction) {
  const embed = new EmbedBuilder()
    .setColor("#5f58b6")
    .setTitle("Watchcord")
    .setDescription(
      "Watchcord is a selective alerting bot for Discord. Create personal watches for a server or channel, add matching conditions, and get a private DM when a message matches what you care about.",
    )
    .addFields(
      {
        name: "Watches",
        value:
          "A watch controls where Watchcord listens. Use a server watch for the whole server or a channel watch for one text channel.",
      },
      {
        name: "Conditions",
        value:
          "A condition controls when a watch triggers. Match any message, match terms, exclude noisy terms, or limit matches to specific users and roles.",
      },
      {
        name: "Notifications",
        value:
          "When a message matches, Watchcord sends you a DM with the watch, matched conditions, message author, message link, and preview.",
      },
    )
    .setFooter({
      text: "Run /cmds to see available commands",
      iconURL: interaction.client.user?.displayAvatarURL() ?? "",
    })
    .setTimestamp(new Date());

  return interaction.editReply({
    embeds: [embed],
  });
}
