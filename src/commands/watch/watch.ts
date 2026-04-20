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
  .toJSON();
// View Subcommand

// Add Subcommand

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
      return await addWatch(interaction);
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
