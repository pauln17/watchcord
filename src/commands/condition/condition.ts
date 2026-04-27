import {
  ChatInputCommandInteraction,
  InteractionContextType,
  MessageFlags,
  SlashCommandBuilder,
} from "discord.js";

import type { ExtendedClient } from "../../discord/ExtendedClient";
import { addCondition } from "./add";
import { removeCondition } from "./remove";

export const data = new SlashCommandBuilder()
  .setName("condition")
  .setDescription("Manage your conditions")
  .setContexts(InteractionContextType.Guild)
  // Add Subcommand
  .addSubcommand((subcommand) =>
    subcommand
      .setName("add")
      .setDescription("Add a new condition")
      .addStringOption((option) =>
        option
          .setName("watch-id")
          .setDescription("The ID of the watch to add the condition to")
          .setRequired(true),
      )
      .addStringOption((option) =>
        option
          .setName("name")
          .setDescription("The name of the condition")
          .setRequired(true),
      )
      .addStringOption((option) =>
        option
          .setName("type")
          .setDescription("The type of the condition")
          .addChoices(
            { name: "Term", value: "TERM" },
            { name: "Regex", value: "REGEX" },
          )
          .setRequired(false),
      )
      .addStringOption((option) =>
        option
          .setName("value")
          .setDescription("The value of the condition")
          .setRequired(false),
      )
      .addStringOption((option) =>
        option
          .setName("target-user-ids")
          .setDescription("The user IDs to target (id1, id2, id3, etc.)")
          .setRequired(false),
      )
      .addStringOption((option) =>
        option
          .setName("target-role-ids")
          .setDescription("The role IDs to target (id1, id2, id3, etc.)")
          .setRequired(false),
      ),
  )
  // Remove Subcommand
  .addSubcommand((subcommand) =>
    subcommand
      .setName("remove")
      .setDescription("Remove a condition by ID")
      .addStringOption((option) =>
        option
          .setName("id")
          .setDescription("The ID of the condition to remove")
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
    case "add":
      return await addCondition(interaction, services);
    case "remove":
      return await removeCondition(interaction, services);
    default:
      return await interaction.reply({
        content: "Invalid Subcommand",
        ephemeral: true,
      });
  }
}
