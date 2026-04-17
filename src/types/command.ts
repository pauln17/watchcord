import type {
  ChatInputCommandInteraction,
  SlashCommandBuilder,
} from "discord.js";

export type CommandType = {
  data: SlashCommandBuilder;
  execute: (interaction: ChatInputCommandInteraction) => Promise<unknown>;
};
