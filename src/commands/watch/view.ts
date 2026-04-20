import { ChatInputCommandInteraction } from "discord.js";

import type { IServices } from "../../services/initializeServices";

export const viewWatch = async (
  interaction: ChatInputCommandInteraction,
  services: IServices,
) => {
  return await interaction.reply(`view`);
};
