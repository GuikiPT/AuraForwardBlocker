const { SlashCommandBuilder, PermissionFlagsBits } = require("discord.js");
const WhitelistedUser = require('../../../database/models/WhitelistedUser');
const WhitelistedChannel = require('../../../database/models/WhitelistedChannel');
const WhitelistedRole = require('../../../database/models/WhitelistedRole');

module.exports = {
  data: new SlashCommandBuilder()
    .setName("whitelist-remove")
    .setDescription("Remove a user, channel, or role from the whitelist (Admins only)")
    .setDefaultMemberPermissions(PermissionFlagsBits.Administrator)
    .addSubcommand(subcommand =>
      subcommand
        .setName("user")
        .setDescription("Remove a user from the whitelist")
        .addUserOption(option =>
          option.setName("user")
            .setDescription("The user to remove from the whitelist")
            .setRequired(true)
        )
    )
    .addSubcommand(subcommand =>
      subcommand
        .setName("channel")
        .setDescription("Remove a channel from the whitelist")
        .addChannelOption(option =>
          option.setName("channel")
            .setDescription("The channel to remove from the whitelist")
            .setRequired(true)
        )
    )
    .addSubcommand(subcommand =>
      subcommand
        .setName("role")
        .setDescription("Remove a role from the whitelist")
        .addRoleOption(option =>
          option.setName("role")
            .setDescription("The role to remove from the whitelist")
            .setRequired(true)
        )
    ),

  async execute(interaction) {
    const subcommand = interaction.options.getSubcommand();

    if (subcommand === "user") {
      const user = interaction.options.getUser("user");

      try {
        const whitelistedUser = await WhitelistedUser.findOne({
          where: { guild_id: interaction.guild.id, user_id: user.id },
        });

        if (!whitelistedUser) {
          return interaction.reply({
            content: `User ${user.tag} is not whitelisted.`,
            ephemeral: true,
          });
        }

        await whitelistedUser.destroy();

        await interaction.reply({
          content: `User ${user.tag} has been removed from the whitelist.`,
          ephemeral: true,
        });
      } catch (error) {
        console.error("Error removing user from whitelist:", error);
        await interaction.reply({
          content: "An error occurred while removing the user from the whitelist.",
          ephemeral: true,
        });
      }

    } else if (subcommand === "channel") {
      const channel = interaction.options.getChannel("channel");

      try {
        const whitelistedChannel = await WhitelistedChannel.findOne({
          where: { guild_id: interaction.guild.id, channel_id: channel.id },
        });

        if (!whitelistedChannel) {
          return interaction.reply({
            content: `Channel ${channel.name} is not whitelisted.`,
            ephemeral: true,
          });
        }

        await whitelistedChannel.destroy();

        await interaction.reply({
          content: `Channel ${channel.name} has been removed from the whitelist.`,
          ephemeral: true,
        });
      } catch (error) {
        console.error("Error removing channel from whitelist:", error);
        await interaction.reply({
          content: "An error occurred while removing the channel from the whitelist.",
          ephemeral: true,
        });
      }

    } else if (subcommand === "role") {
      const role = interaction.options.getRole("role");

      try {
        const whitelistedRole = await WhitelistedRole.findOne({
          where: { guild_id: interaction.guild.id, role_id: role.id },
        });

        if (!whitelistedRole) {
          return interaction.reply({
            content: `Role ${role.name} is not whitelisted.`,
            ephemeral: true,
          });
        }

        await whitelistedRole.destroy();

        await interaction.reply({
          content: `Role ${role.name} has been removed from the whitelist.`,
          ephemeral: true,
        });
      } catch (error) {
        console.error("Error removing role from whitelist:", error);
        await interaction.reply({
          content: "An error occurred while removing the role from the whitelist.",
          ephemeral: true,
        });
      }
    }
  },
};
