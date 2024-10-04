const { SlashCommandBuilder, PermissionFlagsBits } = require("discord.js");
const WhitelistedUser = require('../../../database/models/WhitelistedUser');
const WhitelistedChannel = require('../../../database/models/WhitelistedChannel');
const WhitelistedRole = require('../../../database/models/WhitelistedRole');

module.exports = {
  data: new SlashCommandBuilder()
    .setName("whitelist-add")
    .setDescription("Whitelist a user, channel, or role for forwarding messages (Admins only)")
    .setDefaultMemberPermissions(PermissionFlagsBits.Administrator)
    .addSubcommand(subcommand =>
      subcommand
        .setName("user")
        .setDescription("Whitelist a user")
        .addUserOption(option =>
          option.setName("user")
            .setDescription("The user to whitelist")
            .setRequired(true)
        )
    )
    .addSubcommand(subcommand =>
      subcommand
        .setName("channel")
        .setDescription("Whitelist a channel")
        .addChannelOption(option =>
          option.setName("channel")
            .setDescription("The channel to whitelist")
            .setRequired(true)
        )
    )
    .addSubcommand(subcommand =>
      subcommand
        .setName("role")
        .setDescription("Whitelist a role")
        .addRoleOption(option =>
          option.setName("role")
            .setDescription("The role to whitelist")
            .setRequired(true)
        )
    ),

  async execute(interaction) {
    const subcommand = interaction.options.getSubcommand();

    if (subcommand === "user") {
      const user = interaction.options.getUser("user");

      try {
        const existingUser = await WhitelistedUser.findOne({
          where: { guild_id: interaction.guild.id, user_id: user.id },
        });

        if (existingUser) {
          return interaction.reply({
            content: `User ${user.tag} is already whitelisted.`,
            ephemeral: true,
          });
        }

        await WhitelistedUser.create({
          guild_id: interaction.guild.id,
          user_id: user.id,
        });

        await interaction.reply({
          content: `User ${user.tag} has been successfully whitelisted.`,
          ephemeral: true,
        });
      } catch (error) {
        console.error("Error adding user to whitelist:", error);
        await interaction.reply({
          content: "An error occurred while whitelisting the user.",
          ephemeral: true,
        });
      }

    } else if (subcommand === "channel") {
      const channel = interaction.options.getChannel("channel");

      try {
        const existingChannel = await WhitelistedChannel.findOne({
          where: { guild_id: interaction.guild.id, channel_id: channel.id },
        });

        if (existingChannel) {
          return interaction.reply({
            content: `Channel ${channel.name} is already whitelisted.`,
            ephemeral: true,
          });
        }

        await WhitelistedChannel.create({
          guild_id: interaction.guild.id,
          channel_id: channel.id,
        });

        await interaction.reply({
          content: `Channel ${channel.name} has been successfully whitelisted.`,
          ephemeral: true,
        });
      } catch (error) {
        console.error("Error adding channel to whitelist:", error);
        await interaction.reply({
          content: "An error occurred while whitelisting the channel.",
          ephemeral: true,
        });
      }

    } else if (subcommand === "role") {
      const role = interaction.options.getRole("role");

      try {
        const existingRole = await WhitelistedRole.findOne({
          where: { guild_id: interaction.guild.id, role_id: role.id },
        });

        if (existingRole) {
          return interaction.reply({
            content: `Role ${role.name} is already whitelisted.`,
            ephemeral: true,
          });
        }

        await WhitelistedRole.create({
          guild_id: interaction.guild.id,
          role_id: role.id,
        });

        await interaction.reply({
          content: `Role ${role.name} has been successfully whitelisted.`,
          ephemeral: true,
        });
      } catch (error) {
        console.error("Error adding role to whitelist:", error);
        await interaction.reply({
          content: "An error occurred while whitelisting the role.",
          ephemeral: true,
        });
      }
    }
  },
};
