import type { Interaction } from "discord.js";

import type { ExtendedClient } from "../discord/ExtendedClient";
import { ValidationError } from "../errors/ValidationError";
import type { ILogger } from "../util/logger";

export async function handleInteractionCreate(
  client: ExtendedClient,
  interaction: Interaction,
  logger: ILogger,
) {
  if (!interaction.isChatInputCommand()) return;

  const { commandName } = interaction;

  const command = client.commands.get(commandName);
  if (!command) return;

  try {
    await command.execute(interaction);
  } catch (error) {
    if (error instanceof ValidationError) {
      await interaction.reply({
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

    await interaction.reply({
      content: "Something went wrong while executing this command",
    });
  }
}
