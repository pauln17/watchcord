import { CommandInteraction, SlashCommandBuilder } from "discord.js";

export const data = new SlashCommandBuilder()
  .setName("info")
  .setDescription("A detailed description of the bot");

export async function execute(interaction: CommandInteraction) {
  return interaction.reply(
    "Watchcord is a selective alerting bot for Discord that lets you watch specific channels for important messages, keywords, or patterns. It helps you stay on top of the things you care about without needing to constantly check every noisy server.",
  );
}
