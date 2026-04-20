import { ChatInputCommandInteraction } from "discord.js";

import type { IServices } from "../../services/initializeServices";

export const editWatch = async (
  interaction: ChatInputCommandInteraction,
  services: IServices,
) => {
  return await interaction.reply(`edit`);
};
