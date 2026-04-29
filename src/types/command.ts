import type {
  ChatInputCommandInteraction,
  RESTPostAPIApplicationCommandsJSONBody,
} from "discord.js";

import type { IServices } from "../services";

export type Command = {
  data: RESTPostAPIApplicationCommandsJSONBody;
  execute: (
    interaction: ChatInputCommandInteraction,
    services: IServices,
  ) => Promise<unknown>;
};
