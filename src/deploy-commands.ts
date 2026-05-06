import "dotenv/config";

import { REST, Routes } from "discord.js";

import { commandModules } from "./commands";
import { logger } from "./util/logger";

const rest = new REST({ version: "10" }).setToken(process.env.DISCORD_TOKEN!);

export const deployCommands = async (guildId: string) => {
  const commandsData = Object.values(commandModules).map(
    (command) => command.data,
  );

  try {
    logger.info({
      message: "Started refreshing guild (/) commands.",
    });

    await rest.put(
      Routes.applicationGuildCommands(process.env.DISCORD_CLIENT_ID!, guildId),
      { body: commandsData },
    );

    logger.info({
      message: "Guild (/) commands refreshed.",
    });
  } catch (error) {
    logger.error({
      message: "Failed to refresh guild application commands.",
      error,
    });
  }
};
