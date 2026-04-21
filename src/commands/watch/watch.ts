import {
  ChatInputCommandInteraction,
  InteractionContextType,
  MessageFlags,
  SlashCommandBuilder,
} from "discord.js";

import type { ExtendedClient } from "../../discord/ExtendedClient";
import { addWatch } from "./add";
import { editWatch } from "./edit";
import { listWatch } from "./list";
import { removeWatch } from "./remove";
import { viewWatch } from "./view";

export const data = new SlashCommandBuilder()
  .setName("watch")
  .setDescription("Manage your watches")
  .setContexts(InteractionContextType.Guild)
  // List Subcommand
  .addSubcommand((subcommand) =>
    subcommand
      .setName("list")
      .setDescription("List your watches")
      .addChannelOption((option) =>
        option
          .setName("channel")
          .setDescription("List your watches by channel")
          .setRequired(false),
      ),
  )
  // View Subcommand
  .addSubcommand((subcommand) =>
    subcommand
      .setName("view")
      .setDescription("View watch details by ID")
      .addStringOption((option) =>
        option
          .setName("id")
          .setDescription("The ID of the watch to view")
          .setRequired(true),
      ),
  )
  // Add Subcommand
  .addSubcommand((subcommand) =>
    subcommand
      .setName("add")
      .setDescription("Add a new watch")
      .addStringOption((option) =>
        option
          .setName("name")
          .setDescription("The name of the watch")
          .setRequired(true),
      )
      .addChannelOption((option) =>
        option
          .setName("channel")
          .setDescription("The channel to watch")
          .setRequired(true),
      ),
  )
  // Edit Subcommand
  .addSubcommand((subcommand) =>
    subcommand
      .setName("edit")
      .setDescription("Edit a watch by ID")
      .addStringOption((option) =>
        option
          .setName("id")
          .setDescription("The ID of the watch to edit")
          .setRequired(true),
      )
      .addStringOption((option) =>
        option
          .setName("name")
          .setDescription("The name of the watch")
          .setRequired(false),
      )
      .addChannelOption((option) =>
        option
          .setName("channel")
          .setDescription("The channel to watch")
          .setRequired(false),
      ),
  )
  // Remove Subcommand
  .addSubcommand((subcommand) =>
    subcommand
      .setName("remove")
      .setDescription("Remove a watch by ID")
      .addStringOption((option) =>
        option
          .setName("id")
          .setDescription("The ID of the watch to remove")
          .setRequired(true),
      ),
  )
  .toJSON();

export async function execute(interaction: ChatInputCommandInteraction) {
  const subcommand = interaction.options.getSubcommand();
  if (!interaction.guild || !interaction.guildId) {
    return await interaction.reply({
      content: "Guild not found",
      flags: MessageFlags.Ephemeral,
    });
  }

  const services = (interaction.client as ExtendedClient).services;

  switch (subcommand) {
    case "list":
      return await listWatch(interaction, services);
    case "view":
      return await viewWatch(interaction, services);
    case "add":
      return await addWatch(interaction, services);
    case "edit":
      return await editWatch(interaction, services);
    case "remove":
      return await removeWatch(interaction, services);
    default:
      return await interaction.reply({
        content: "Invalid Subcommand",
        ephemeral: true,
      });
  }
}
