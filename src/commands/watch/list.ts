import { ChatInputCommandInteraction } from "discord.js";

export const listWatch = async (interaction: ChatInputCommandInteraction) => {
  return await interaction.reply(`list`);
};
