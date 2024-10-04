const { SlashCommandBuilder, PermissionFlagsBits } = require("discord.js");
const WhitelistedUser = require('../../../database/models/WhitelistedUser');

module.exports = {
  data: new SlashCommandBuilder()
    .setName("listwhitelistedusers")
    .setDescription("List all whitelisted users (Admins only)")
    .setDefaultMemberPermissions(PermissionFlagsBits.Administrator),

  async execute(interaction) {
    try {
      // Fetch whitelisted users for the guild using Sequelize
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
    } catch (error) {
      console.error("Error fetching whitelisted users:", error);
      await interaction.reply({
        content: "An error occurred while fetching the whitelisted users.",
        ephemeral: true,
      });
    }
  },
};
