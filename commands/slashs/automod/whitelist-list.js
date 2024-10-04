const { SlashCommandBuilder, PermissionFlagsBits } = require("discord.js");
const WhitelistedUser = require('../../../database/models/WhitelistedUser');
const WhitelistedChannel = require('../../../database/models/WhitelistedChannel');
const WhitelistedRole = require('../../../database/models/WhitelistedRole');

module.exports = {
  data: new SlashCommandBuilder()
    .setName("whitelist-list")
    .setDescription("List whitelisted users, channels, or roles (Admins only)")
    .setDefaultMemberPermissions(PermissionFlagsBits.Administrator)
    .addSubcommand(subcommand =>
      subcommand
        .setName("channels")
        .setDescription("List all whitelisted channels")
    )
    .addSubcommand(subcommand =>
      subcommand
        .setName("users")
        .setDescription("List all whitelisted users")
    )
    .addSubcommand(subcommand =>
      subcommand
        .setName("roles")
        .setDescription("List all whitelisted roles")
    ),

  async execute(interaction) {
    const subcommand = interaction.options.getSubcommand();

    try {
      if (subcommand === "channels") {
        const channels = await WhitelistedChannel.findAll({
          where: { guild_id: interaction.guild.id },
        });

        if (channels.length === 0) {
          return interaction.reply({
            content: "No channels are currently whitelisted.",
            ephemeral: true,
          });
        }

        const channelList = channels.map(channel => `<#${channel.channel_id}>`).join(", ");
        await interaction.reply({
          content: `Whitelisted Channels: ${channelList}`,
          ephemeral: true,
        });

      } else if (subcommand === "users") {
        const users = await WhitelistedUser.findAll({
          where: { guild_id: interaction.guild.id },
        });

        if (users.length === 0) {
          return interaction.reply({
            content: "No users are currently whitelisted.",
            ephemeral: true,
          });
        }

        const userList = users.map(user => `<@${user.user_id}>`).join(", ");
        await interaction.reply({
          content: `Whitelisted Users: ${userList}`,
          ephemeral: true,
        });

      } else if (subcommand === "roles") {
        const roles = await WhitelistedRole.findAll({
          where: { guild_id: interaction.guild.id },
        });

        if (roles.length === 0) {
          return interaction.reply({
            content: "No roles are currently whitelisted.",
            ephemeral: true,
          });
        }

        const roleList = roles.map(role => `<@&${role.role_id}>`).join(", ");
        await interaction.reply({
          content: `Whitelisted Roles: ${roleList}`,
          ephemeral: true,
        });
      }
    } catch (error) {
      console.error("Error fetching whitelisted data:", error);
      await interaction.reply({
        content: "An error occurred while fetching the whitelisted data.",
        ephemeral: true,
      });
    }
  },
};
