const { SlashCommandBuilder, PermissionFlagsBits } = require("discord.js");
const WhitelistedChannel = require('../../../database/models/WhitelistedChannel');

module.exports = {
  data: new SlashCommandBuilder()
    .setName("listwhitelistedchannels")
    .setDescription("List all whitelisted channels (Admins only)")
    .setDefaultMemberPermissions(PermissionFlagsBits.Administrator),

  async execute(interaction) {
    try {
      // Fetch whitelisted channels for the guild using Sequelize
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
    } catch (error) {
      console.error("Error fetching whitelisted channels:", error);
      await interaction.reply({
        content: "An error occurred while fetching the whitelisted channels.",
        ephemeral: true,
      });
    }
  },
};
