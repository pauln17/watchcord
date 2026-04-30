import {
  ChannelType,
  ChatInputCommandInteraction,
  InteractionContextType,
  SlashCommandBuilder,
} from "discord.js";

import type { IServices } from "../../services";
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
    subcommand.setName("list").setDescription("List your watches"),
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
      .addStringOption((option) =>
        option
          .setName("scope")
          .setDescription("The scope of the watch")
          .addChoices(
            { name: "Guild", value: "GUILD" },
            { name: "Channel", value: "CHANNEL" },
          )
          .setRequired(true),
      )
      .addChannelOption((option) =>
        option
          .setName("channel")
          .setDescription("The channel to watch")
          .addChannelTypes(ChannelType.GuildText)
          .setRequired(false),
      )
      .addBooleanOption((option) =>
        option
          .setName("enabled")
          .setDescription("Whether the watch is enabled")
          .setRequired(false),
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
      .addStringOption((option) =>
        option
          .setName("scope")
          .setDescription("The scope of the watch")
          .addChoices(
            { name: "Guild", value: "GUILD" },
            { name: "Channel", value: "CHANNEL" },
          )
          .setRequired(false),
      )
      .addChannelOption((option) =>
        option
          .setName("channel")
          .setDescription("The channel to watch")
          .addChannelTypes(ChannelType.GuildText)
          .setRequired(false),
      )
      .addBooleanOption((option) =>
        option
          .setName("enabled")
          .setDescription("Whether the watch is enabled")
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
      return await interaction.editReply({
        content:
          "You have entered an unknown subcommand. Run `/cmds` to view available commands.",
      });
  }
}
