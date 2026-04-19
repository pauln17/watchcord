import { ChatInputCommandInteraction, SlashCommandBuilder } from "discord.js";

import { addWatch } from "./add";
import { editWatch } from "./edit";
import { listWatch } from "./list";
import { removeWatch } from "./remove";
import { viewWatch } from "./view";

export const data = new SlashCommandBuilder()
  .setName("watch")
  .setDescription("Manage your watches")
  .toJSON();

// List Subcommand

// View Subcommand

// Add Subcommand

// Edit Subcommand

// Remove Subcommand

export async function execute(interaction: ChatInputCommandInteraction) {
  const subcommand = interaction.options.getSubcommand();
  // TODO: Implement Interaction Responses
  switch (subcommand) {
    case "list":
      return await listWatch(interaction);
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
