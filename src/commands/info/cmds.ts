import { CommandInteraction, SlashCommandBuilder } from "discord.js";

export const data = new SlashCommandBuilder()
  .setName("cmds")
  .setDescription("A list of all the commands available");

export async function execute(interaction: CommandInteraction) {
  return interaction.reply("Here is a list of all the commands available:");
}
