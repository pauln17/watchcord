import "dotenv/config";

import { Client, Collection, GatewayIntentBits } from "discord.js";

import { commands } from "../commands";
import type { IServices } from "../services/initializeServices";
import type { CommandType } from "../types/command";
import { logger } from "../util/logger";

export class ExtendedClient extends Client {
  commands: Collection<string, CommandType> = new Collection();
  services: IServices;

  constructor(services: IServices) {
    super({
      intents: [
        GatewayIntentBits.Guilds,
        GatewayIntentBits.GuildMessages,
        GatewayIntentBits.DirectMessages,
      ],
    });

    this.services = services;
    this.init();
  }

  init() {
    this.registerCommands();
    this.registerEvents();
    this.login(process.env.DISCORD_TOKEN);
  }

  registerCommands() {
    Object.values(commands).forEach((command) => {
      this.commands.set(command.data.name, command);
    });
  }

  registerEvents() {
    this.on("interactionCreate", async (interaction) => {
      if (interaction.isChatInputCommand()) {
        const { commandName } = interaction;
        const command = this.commands.get(commandName);

        if (command) {
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
      }
      return;
    });
  }
}
