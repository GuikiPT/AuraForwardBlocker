const { SlashCommandBuilder, PermissionFlagsBits } = require("discord.js");
const WhitelistedChannel = require('../../../database/models/WhitelistedChannel');

module.exports = {
  data: new SlashCommandBuilder()
    .setName("whitelistchannel")
    .setDescription("Whitelist a channel for forwarding messages (Admins only)")
    .setDefaultMemberPermissions(PermissionFlagsBits.Administrator)
    .addChannelOption(option =>
      option.setName("channel")
        .setDescription("The channel to whitelist")
        .setRequired(true)
    ),

  async execute(interaction) {
    const channel = interaction.options.getChannel("channel");

    try {
      // Check if the channel is already whitelisted
      const existingChannel = await WhitelistedChannel.findOne({
        where: { guild_id: interaction.guild.id, channel_id: channel.id },
      });

      if (existingChannel) {
        return interaction.reply({
          content: `Channel ${channel.name} is already whitelisted.`,
          ephemeral: true,
        });
      }

      // Whitelist the channel
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
  },
};
