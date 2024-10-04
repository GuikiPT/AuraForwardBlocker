const { SlashCommandBuilder, PermissionFlagsBits } = require("discord.js");
const WhitelistedChannel = require('../../../database/models/WhitelistedChannel');

module.exports = {
  data: new SlashCommandBuilder()
    .setName("removewhitelistchannel")
    .setDescription("Remove a channel from the whitelist (Admins only)")
    .setDefaultMemberPermissions(PermissionFlagsBits.Administrator)
    .addChannelOption(option =>
      option.setName("channel")
        .setDescription("The channel to remove from the whitelist")
        .setRequired(true)
    ),

  async execute(interaction) {
    const channel = interaction.options.getChannel("channel");

    try {
      // Find and remove the channel from the whitelist using Sequelize
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
  },
};
