import {
  ChatInputCommandInteraction,
  InteractionContextType,
  SlashCommandBuilder,
} from "discord.js";

import { CONDITION_LIMITS, MAX_NAME_LENGTH, MIN_INPUT_LENGTH } from "../../constants";
import type { IServices } from "../../services";
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
          .setMinLength(MIN_INPUT_LENGTH)
          .setMaxLength(MAX_NAME_LENGTH)
          .setRequired(true),
      )
      .addStringOption((option) =>
        option
          .setName("type")
          .setDescription("The type of the condition")
          .addChoices(
            { name: "Any", value: "ANY" },
            { name: "Term", value: "TERM" },
          )
          .setRequired(true),
      )
      .addStringOption((option) =>
        option
          .setName("include")
          .setDescription(
            `The terms to include (term1, term2, term3, etc.) max ${CONDITION_LIMITS.MAX_INCLUDE_TERMS} terms`,
          )
          .setMinLength(MIN_INPUT_LENGTH)
          .setMaxLength(CONDITION_LIMITS.MAX_INPUT_LENGTH)
          .setRequired(false),
      )
      .addStringOption((option) =>
        option
          .setName("exclude")
          .setDescription(
            `The terms to exclude (term1, term2, term3, etc.) max ${CONDITION_LIMITS.MAX_EXCLUDE_TERMS} terms`,
          )
          .setMinLength(MIN_INPUT_LENGTH)
          .setMaxLength(CONDITION_LIMITS.MAX_INPUT_LENGTH)
          .setRequired(false),
      )
      .addBooleanOption((option) =>
        option
          .setName("sensitive")
          .setDescription("Whether the condition matches case-sensitively")
          .setRequired(false),
      )
      .addStringOption((option) =>
        option
          .setName("target-users")
          .setDescription(
            `The users to target (id1, id2, id3, etc.) max ${CONDITION_LIMITS.MAX_TARGET_USERS} users`,
          )
          .setMinLength(MIN_INPUT_LENGTH)
          .setMaxLength(CONDITION_LIMITS.MAX_INPUT_LENGTH)
          .setRequired(false),
      )
      .addStringOption((option) =>
        option
          .setName("target-roles")
          .setDescription(
            `The roles to target (id1, id2, id3, etc.) max ${CONDITION_LIMITS.MAX_TARGET_ROLES} roles`,
          )
          .setMinLength(MIN_INPUT_LENGTH)
          .setMaxLength(CONDITION_LIMITS.MAX_INPUT_LENGTH)
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

export async function execute(
  interaction: ChatInputCommandInteraction,
  services: IServices,
) {
  const subcommand = interaction.options.getSubcommand();
  if (!interaction.guild || !interaction.guildId) {
    return await interaction.editReply({
      content: "These commands can only be used in a server",
    });
  }

  switch (subcommand) {
    case "add":
      return await addCondition(interaction, services);
    case "remove":
      return await removeCondition(interaction, services);
    default:
      return await interaction.editReply({
        content:
          "You have entered an unknown subcommand. Run `/cmds` to view available commands.",
      });
  }
}
