import "dotenv/config";

import { Client, Collection, GatewayIntentBits } from "discord.js";

import { commands } from "../commands";
import { handleInteractionCreate } from "../events/interactionCreate";
import { handleMessageCreate } from "../events/messageCreate";
import type { RedisClientType } from "../lib/redis";
import type { IServices } from "../services";
import type { Command } from "../types";
import type { ILogger } from "../util/logger";

export class ExtendedClient extends Client {
  commands: Collection<string, Command> = new Collection();
  services: IServices;
  redis: RedisClientType;
  logger: ILogger;

  constructor(services: IServices, redis: RedisClientType, logger: ILogger) {
    super({
      intents: [
        GatewayIntentBits.Guilds,
        GatewayIntentBits.GuildMessages,
        GatewayIntentBits.MessageContent,
      ],
    });

    this.services = services;
    this.redis = redis;
    this.logger = logger;
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
      await handleInteractionCreate(this, interaction, this.logger);
    });

    this.on("messageCreate", async (message) => {
      await handleMessageCreate(this, message, this.logger);
    });
  }
}
