import { ChatInputCommandInteraction } from "discord.js";

export const removeWatch = async (interaction: ChatInputCommandInteraction) => {
  return await interaction.reply(`remove`);
};
