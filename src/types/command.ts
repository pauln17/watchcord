import type {
  ChatInputCommandInteraction,
  RESTPostAPIApplicationCommandsJSONBody,
} from "discord.js";

export type CommandType = {
  data: RESTPostAPIApplicationCommandsJSONBody;
  execute: (interaction: ChatInputCommandInteraction) => Promise<unknown>;
};
