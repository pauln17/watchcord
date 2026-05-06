import "dotenv/config";

import { REST, Routes } from "discord.js";

import { commandModules } from "./commands";
import { logger } from "./util/logger";

const rest = new REST({ version: "10" }).setToken(process.env.DISCORD_TOKEN!);

(async () => {
  const body = Object.values(commandModules).map((command) => command.data);

  try {
    await rest.put(Routes.applicationCommands(process.env.DISCORD_CLIENT_ID!), {
      body,
    });

    logger.info({
      message: "Global (/) commands synced.",
    });
  } catch (error) {
    logger.error({
      message: "Failed to sync global application commands.",
      error,
    });
  }
})();
