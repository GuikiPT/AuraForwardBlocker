const Discord = require('discord.js');
const colors = require('colors/safe');

const WhitelistedChannel = require('../../database/models/WhitelistedChannel');
const WhitelistedUser = require('../../database/models/WhitelistedUser');

module.exports = {
  name: Discord.Events.Raw,
  once: false,
  async execute(client, packet) {
    if (packet.t === "MESSAGE_CREATE") {
      const messageData = packet.d;

      if (messageData.message_reference && messageData.message_snapshots) {
        console.log(colors.yellow('This message contains forwarded content.'));

        const guildId = messageData.guild_id;
        const channelId = messageData.channel_id;
        const userId = messageData.author.id;

        try {
          const whitelistedChannel = await WhitelistedChannel.findOne({
            where: { guild_id: guildId, channel_id: channelId }
          });

          const whitelistedUser = await WhitelistedUser.findOne({
            where: { guild_id: guildId, user_id: userId }
          });

          if (!whitelistedChannel && !whitelistedUser) {
            const channel = await client.channels.fetch(channelId);
            const message = await channel.messages.fetch(messageData.id);

            await message.delete();

            try {
              const user = await client.users.fetch(userId);
              await user.send(`Your forwarded message in channel <#${channelId}> was deleted because neither the channel nor your user is whitelisted.`);
              console.log(colors.green(`Sent a DM to user ${userId}.`));
            } catch (dmError) {
              console.log(colors.red(`Failed to send a DM to user ${userId}. Sending message to the channel instead.`));
              await channel.send(`<@${userId}>, your forwarded message was deleted because neither the channel nor your user is whitelisted.`);
            }

            console.log(colors.red(`Deleted a forwarded message from user ${userId} in non-whitelisted channel ${channelId}.`));
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
