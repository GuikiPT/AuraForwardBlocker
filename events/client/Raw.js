const Discord = require('discord.js');
const colors = require('colors/safe');

const WhitelistedChannel = require('../../database/models/WhitelistedChannel');
const WhitelistedUser = require('../../database/models/WhitelistedUser');
const WhitelistedRole = require('../../database/models/WhitelistedRole');
const ForwardConfig = require('../../database/models/ForwardConfig');

module.exports = {
  name: Discord.Events.Raw,
  once: false,
  async execute(client, packet) {
    if (packet.t === "MESSAGE_CREATE") {
      const messageData = packet.d;

      if (messageData.message_reference && messageData.message_snapshots && messageData.message_snapshots.length > 0) {
        console.log(colors.yellow('This message contains forwarded content.'));

        const guildId = messageData.guild_id;
        const channelId = messageData.channel_id;
        const userId = messageData.author.id;

        try {
          let forwardConfig = await ForwardConfig.findOne({
            where: { guild_id: guildId },
          });

          if (!forwardConfig) {
            forwardConfig = await ForwardConfig.create({
              guild_id: guildId,
              forward_automod_enabled: true,
            });
            console.log(colors.green(`Created default forward configuration for guild ${guildId} with forwarding enabled.`));
          }

          if (!forwardConfig.forward_automod_enabled) {
            console.log(colors.red(`Forwarding is disabled for guild ${guildId}, no action taken.`));
            return;
          }

          const whitelistedChannel = await WhitelistedChannel.findOne({
            where: { guild_id: guildId, channel_id: channelId }
          });

          const whitelistedUser = await WhitelistedUser.findOne({
            where: { guild_id: guildId, user_id: userId }
          });

          const member = await client.guilds.cache.get(guildId).members.fetch(userId);

          const whitelistedRoles = await WhitelistedRole.findAll({
            where: { guild_id: guildId }
          });

          const hasWhitelistedRole = whitelistedRoles.some(role =>
            member.roles.cache.has(role.role_id)
          );

          if (!whitelistedChannel && !whitelistedUser && !hasWhitelistedRole) {
            const channel = await client.channels.fetch(channelId);
            const message = await channel.messages.fetch(messageData.id);

            await message.delete();

            try {
              const user = await client.users.fetch(userId);
              await user.send(`Your forwarded message in channel <#${channelId}> was deleted because neither the channel, your user, nor your roles are whitelisted.`);
              console.log(colors.green(`Sent a DM to user ${userId}.`));
            } catch (dmError) {
              console.log(colors.red(`Failed to send a DM to user ${userId}. Sending message to the channel instead.`));
              await channel.send(`<@${userId}>, your forwarded message was deleted because neither the channel, your user, nor your roles are whitelisted.`);
            }

            console.log(colors.red(`Deleted a forwarded message from user ${userId} in non-whitelisted channel ${channelId}.`));

            if (forwardConfig.log_channel_id) {
              try {
                const logChannel = await client.channels.fetch(forwardConfig.log_channel_id);

                if (logChannel && logChannel.isTextBased()) {
                  const snapshotMessage = messageData.message_snapshots[0].message;

                  const logEmbed = new Discord.EmbedBuilder()
                    .setTitle("Auto-moderated Forwarded Message")
                    .setColor("#FF0000")
                    .addFields(
                      { name: "User", value: `<@${userId}>`, inline: true },
                      { name: "Channel", value: `<#${channelId}>`, inline: true },
                      { name: "Reason", value: "Neither the channel, user, nor roles are whitelisted.", inline: false }
                    )
                    .setTimestamp();

                  if (snapshotMessage.content) {
                    logEmbed.addFields({ name: "Content", value: snapshotMessage.content });
                  }

                  if (snapshotMessage.mentions && snapshotMessage.mentions.length > 0) {
                    const mentionList = snapshotMessage.mentions.map(mention => `<@${mention.id}>`).join(", ");
                    logEmbed.addFields({ name: "Mentions", value: mentionList });
                  }

                  logEmbed.addFields(
                    { name: "Embeds", value: `${snapshotMessage.embeds.length}`, inline: true },
                    { name: "Components", value: `${snapshotMessage.components.length}`, inline: true },
                    { name: "Attachments", value: `${Object.keys(snapshotMessage.attachments).length}`, inline: true }
                  );

                  const logMessage = await logChannel.send({ embeds: [logEmbed] });

                  if (snapshotMessage.embeds && snapshotMessage.embeds.length > 0) {
                    for (const embed of snapshotMessage.embeds) {
                      const richEmbed = new Discord.EmbedBuilder(embed);
                      await logChannel.send({ embeds: [richEmbed], reply: { messageReference: logMessage.id } });
                    }
                  }

                  if (snapshotMessage.components && snapshotMessage.components.length > 0) {
                    const components = snapshotMessage.components.map(component => new Discord.ActionRowBuilder(component));
                    await logChannel.send({ components, reply: { messageReference: logMessage.id } });
                  }

                  // TODO: External images from other users is not working correctly.

                  if (snapshotMessage.attachments && Object.keys(snapshotMessage.attachments).length > 0) {
                    for (const attachmentKey in snapshotMessage.attachments) {
                      const attachment = snapshotMessage.attachments[attachmentKey];
                  
                      if (attachment.content_type.startsWith('image')) {
                        try {
                          await logChannel.send({ content: attachment.url, reply: { messageReference: logMessage.id } });
                        } catch (fetchError) {
                          console.error(colors.red(`Failed to send image URL ${attachment.url}:`), fetchError);
                        }
                      } else {
                        try {
                          await logChannel.send({ files: [{ attachment: attachment.url, name: attachment.filename }], reply: { messageReference: logMessage.id } });
                        } catch (fetchError) {
                          console.error(colors.red(`Failed to send non-image file ${attachment.url}:`), fetchError);
                        }
                      }
                    }
                  }
                  

                  console.log(colors.green(`Logged auto-moderation action in channel ${forwardConfig.log_channel_id}.`));
                } else {
                  console.log(colors.red(`Log channel ${forwardConfig.log_channel_id} is invalid or no longer exists.`));
                }
              } catch (logChannelError) {
                console.error(colors.red(`Failed to fetch or send message to log channel ${forwardConfig.log_channel_id}:`), logChannelError);
              }
            }
          } else {
            console.log(colors.green(`Message allowed: ${messageData.id}`));
          }
        } catch (error) {
          console.error(colors.red('Error checking whitelist or deleting message:'), error.stack);
        }
      }
    }
  },
};
