import type {
  Client,
  Collection,
  Interaction,
  RESTPostAPIApplicationCommandsJSONBody,
} from "discord.js";

import type { IServices } from "../services";
import type { Command } from "../types";
import { ValidationError } from "../util/error";
import type { ILogger } from "../util/logger";

export async function handleInteractionCreate(
  client: Client,
  interaction: Interaction,
  services: IServices,
  commands: Collection<string, Command>,
  logger: ILogger,
) {
  if (!interaction.isChatInputCommand()) return;

  const { commandName } = interaction;

  const command = commands.get(commandName);
  if (!command) return;

  try {
    await interaction.deferReply({ ephemeral: true });
    await command.execute(interaction, services);
  } catch (error) {
    if (error instanceof ValidationError) {
      await interaction.editReply({
        content: error.message,
      });
      return;
    }

    logger.error({
      message:
        error instanceof Error
          ? error.message
          : "An error occurred on interaction create event handler",
      error,
    });

    if (interaction.deferred) {
      await interaction.editReply({
        content: "Something went wrong while executing this command",
      });
    } else {
      await interaction.reply({
        content: "Something went wrong while executing this command",
      });
    }
  }
}
