const { SlashCommandBuilder, PermissionFlagsBits } = require("discord.js");
const WhitelistedUser = require('../../../database/models/WhitelistedUser');

module.exports = {
  data: new SlashCommandBuilder()
    .setName("whitelistuser")
    .setDescription("Whitelist a user for forwarding messages (Admins only)")
    .setDefaultMemberPermissions(PermissionFlagsBits.Administrator)
    .addUserOption(option =>
      option.setName("user")
        .setDescription("The user to whitelist")
        .setRequired(true)
    ),

  async execute(interaction) {
    const user = interaction.options.getUser("user");

    try {
      // Check if the user is already whitelisted
      const existingUser = await WhitelistedUser.findOne({
        where: { guild_id: interaction.guild.id, user_id: user.id },
      });

      if (existingUser) {
        return interaction.reply({
          content: `User ${user.tag} is already whitelisted.`,
          ephemeral: true,
        });
      }

      // Whitelist the user
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
  },
};
