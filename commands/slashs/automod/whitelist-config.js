const { SlashCommandBuilder, PermissionFlagsBits } = require("discord.js");
const ForwardConfig = require('../../../database/models/ForwardConfig');

module.exports = {
  data: new SlashCommandBuilder()
    .setName("whitelist-config")
    .setDescription("Configure various settings for whitelist forwarding (Admins only)")
    .setDefaultMemberPermissions(PermissionFlagsBits.Administrator)
    .addSubcommand(subcommand =>
      subcommand
        .setName("enabled")
        .setDescription("Enable or disable forwarding")
        .addBooleanOption(option =>
          option
            .setName("value")
            .setDescription("Set to true to enable, false to disable")
            .setRequired(true)
        )
    )
    .addSubcommand(subcommand =>
      subcommand
        .setName("log-channel")
        .setDescription("Set the log channel for automod actions")
        .addChannelOption(option =>
          option
            .setName("channel")
            .setDescription("The log channel to set")
            .setRequired(true)
        )
    ),
  
  async execute(interaction) {
    const subcommand = interaction.options.getSubcommand();

    if (subcommand === "enabled") {
      const enabled = interaction.options.getBoolean("value");

      try {
        const [config, created] = await ForwardConfig.findOrCreate({
          where: { guild_id: interaction.guild.id },
          defaults: { forward_automod_enabled: enabled },
        });

        if (!created) {
          config.forward_automod_enabled = enabled;
          await config.save();
        }

        const statusMessage = enabled
          ? "AutoMod Forwarding has been enabled for this guild."
          : "AutoMod Forwarding has been disabled for this guild.";

        await interaction.reply({
          content: statusMessage,
          ephemeral: true,
        });
      } catch (error) {
        console.error("Error updating forwarding configuration:", error);
        await interaction.reply({
          content: "An error occurred while updating the forwarding configuration.",
          ephemeral: true,
        });
      }
    } else if (subcommand === "log-channel") {
      const logChannel = interaction.options.getChannel("channel");

      try {
        const [config, created] = await ForwardConfig.findOrCreate({
          where: { guild_id: interaction.guild.id },
          defaults: { log_channel_id: logChannel.id },
        });

        if (!created) {
          config.log_channel_id = logChannel.id;
          await config.save();
        }

        await interaction.reply({
          content: `Log channel has been set to <#${logChannel.id}>.`,
          ephemeral: true,
        });
      } catch (error) {
        console.error("Error setting the log channel:", error);
        await interaction.reply({
          content: "An error occurred while setting the log channel.",
          ephemeral: true,
        });
      }
    }
  },
};
