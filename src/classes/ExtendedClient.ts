import "dotenv/config";

import { Client, Collection, GatewayIntentBits } from "discord.js";

import { commands } from "../commands";
import type { CommandType } from "../types/command";

export class ExtendedClient extends Client {
  commands: Collection<string, CommandType> = new Collection();

  constructor() {
    super({
      intents: [
        GatewayIntentBits.Guilds,
        GatewayIntentBits.GuildMessages,
        GatewayIntentBits.DirectMessages,
      ],
    });
  }

  start() {
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
      if (!interaction.isChatInputCommand()) {
        return;
      }

      const { commandName } = interaction;
      const command = this.commands.get(commandName);

      if (command) {
        try {
          await command.execute(interaction);
        } catch (error) {
          console.error(error);
          await interaction.reply({
            content: "Error Occurred During Command Execution",
            ephemeral: true,
          });
        }
      }
    });
  }
}
