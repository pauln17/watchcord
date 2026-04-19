import { ChatInputCommandInteraction } from "discord.js";

export const addWatch = async (interaction: ChatInputCommandInteraction) => {
  return await interaction.reply(`add`);
};
