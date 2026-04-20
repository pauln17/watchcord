import "dotenv/config";

import { REST, Routes } from "discord.js";

import { commands } from "./commands";
import { logger } from "./util/logger";

const rest = new REST({ version: "10" }).setToken(process.env.DISCORD_TOKEN!);

(async () => {
  const commandsData = Object.values(commands).map((command) => command.data);

  try {
    logger.info({
      message: "Started Refreshing Application (/) Commands.",
    });

    // Production -- Deploy To Global Commands (May Take Up To 1 Hour To Show In Every Client)
    // await rest.put(Routes.applicationCommands(process.env.DISCORD_CLIENT_ID!), {
    //   body: commandsData,
    // });

    // Development -- Deploy To Test Server Instantly
    await rest.put(
      Routes.applicationGuildCommands(
        process.env.DISCORD_CLIENT_ID!,
        process.env.DISCORD_GUILD_ID!,
      ),
      {
        body: commandsData,
      },
    );

    logger.info({
      message: "Successfully Refreshed Application (/) Commands.",
    });
  } catch (error) {
    logger.error({
      message: "Failed to refresh application commands.",
      error,
    });
  }
})();
