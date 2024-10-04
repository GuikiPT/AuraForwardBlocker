const { SlashCommandBuilder, PermissionFlagsBits } = require("discord.js");
const WhitelistedUser = require('../../../database/models/WhitelistedUser');

module.exports = {
  data: new SlashCommandBuilder()
    .setName("removewhitelistuser")
    .setDescription("Remove a user from the whitelist (Admins only)")
    .setDefaultMemberPermissions(PermissionFlagsBits.Administrator)
    .addUserOption(option =>
      option.setName("user")
        .setDescription("The user to remove from the whitelist")
        .setRequired(true)
    ),

  async execute(interaction) {
    const user = interaction.options.getUser("user");

    try {
      // Find and remove the user from the whitelist using Sequelize
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
  },
};
