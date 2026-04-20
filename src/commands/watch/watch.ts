import {
  ChatInputCommandInteraction,
  InteractionContextType,
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
      )
      .addStringOption((option) =>
        option
          .setName("type")
          .setDescription("The type of the watch")
          .setRequired(true)
          .addChoices(
            { name: "Term", value: "TERM" },
            { name: "Regex", value: "REGEX" },
          ),
      )
      .addStringOption((option) =>
        option
          .setName("condition")
          .setDescription("The condition to watch")
          .setRequired(true),
      )
      .addUserOption((option) =>
        option
          .setName("user")
          .setDescription("The user to watch")
          .setRequired(false),
      )
      .addRoleOption((option) =>
        option
          .setName("role")
          .setDescription("The role to watch")
          .setRequired(false),
      ),
  )
  .toJSON();

// Edit Subcommand

// Remove Subcommand

export async function execute(interaction: ChatInputCommandInteraction) {
  const subcommand = interaction.options.getSubcommand();
  const services = (interaction.client as ExtendedClient).services;
  // TODO: Implement Interaction Responses
  switch (subcommand) {
    case "list":
      return await listWatch(interaction, services);
    case "view":
      return await viewWatch(interaction);
    case "add":
      return await addWatch(interaction, services);
    case "edit":
      return await editWatch(interaction);
    case "remove":
      return await removeWatch(interaction);
    default:
      return await interaction.reply({
        content: "Invalid Subcommand",
        ephemeral: true,
      });
  }
}
