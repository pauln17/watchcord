import "dotenv/config";

import { Client, Collection, GatewayIntentBits } from "discord.js";

import { commands } from "../commands";
import { handleInteractionCreate } from "../events/interactionCreate";
import { handleMessageCreate } from "../events/messageCreate";
import type { RedisClientType } from "../lib/redis";
import type { IServices } from "../services/initializeServices";
import type { CommandType } from "../types/command";

export class ExtendedClient extends Client {
  commands: Collection<string, CommandType> = new Collection();
  services: IServices;
  redis: RedisClientType;

  constructor(services: IServices, redis: RedisClientType) {
    super({
      intents: [
        GatewayIntentBits.Guilds,
        GatewayIntentBits.GuildMessages,
        GatewayIntentBits.MessageContent,
      ],
    });

    this.services = services;
    this.redis = redis;
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
      await handleInteractionCreate(this, interaction);
    });

    this.on("messageCreate", async (message) => {
      await handleMessageCreate(this, message);
    });
  }
}
