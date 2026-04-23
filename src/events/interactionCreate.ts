import type { Interaction } from "discord.js";

import type { ExtendedClient } from "../discord/ExtendedClient";
import { logger } from "../util/logger";

export async function handleInteractionCreate(
  client: ExtendedClient,
  interaction: Interaction,
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
      message: "Error Occurred During Command Execution",
      error,
    });

    await interaction.reply({
      content: "Error Occurred During Command Execution",
      ephemeral: true,
    });
  }
}
