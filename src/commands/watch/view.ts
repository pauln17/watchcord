import { ChatInputCommandInteraction } from "discord.js";

export const viewWatch = async (interaction: ChatInputCommandInteraction) => {
  return await interaction.reply(`view`);
};
