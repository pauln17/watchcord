import type { Interaction } from "discord.js";

import type { ExtendedClient } from "../discord/ExtendedClient";
import type { ILogger } from "../util/logger";

export async function handleInteractionCreate(
  client: ExtendedClient,
  interaction: Interaction,
  logger: ILogger,
) {
  if (!interaction.isChatInputCommand()) {
    return;
  }

  const { commandName } = interaction;
  const command = client.commands.get(commandName);
  if (!command) {
    return;
  }

  try {
    await command.execute(interaction);
  } catch (error) {
    logger.error({
      message: `Error occurred during command execution`,
      error,
    });

    await interaction.reply({
      content: `Error occurred during command execution`,
      ephemeral: true,
    });
  }
}
