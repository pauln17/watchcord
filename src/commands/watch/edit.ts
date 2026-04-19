import { ChatInputCommandInteraction } from "discord.js";

export const editWatch = async (interaction: ChatInputCommandInteraction) => {
  return await interaction.reply(`edit`);
};
