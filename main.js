const Discord = require("discord.js");
require("dotenv").config();

const client = new Discord.Client({
  intents: [
    Discord.GatewayIntentBits.AutoModerationConfiguration,
    Discord.GatewayIntentBits.AutoModerationExecution,
    Discord.GatewayIntentBits.DirectMessageReactions,
    Discord.GatewayIntentBits.DirectMessages,
    Discord.GatewayIntentBits.GuildEmojisAndStickers,
    Discord.GatewayIntentBits.GuildIntegrations,
    Discord.GatewayIntentBits.GuildInvites,
    Discord.GatewayIntentBits.GuildMembers,
    Discord.GatewayIntentBits.GuildMessageReactions,
    Discord.GatewayIntentBits.GuildMessages,
    Discord.GatewayIntentBits.GuildModeration,
    Discord.GatewayIntentBits.GuildPresences,
    Discord.GatewayIntentBits.GuildScheduledEvents,
    Discord.GatewayIntentBits.GuildVoiceStates,
    Discord.GatewayIntentBits.GuildWebhooks,
    Discord.GatewayIntentBits.Guilds,
    Discord.GatewayIntentBits.MessageContent,
  ],
  partials: [
    Discord.Partials.Channel,
    Discord.Partials.GuildMember,
    Discord.Partials.GuildScheduledEvent,
    Discord.Partials.Message,
    Discord.Partials.Reaction,
    Discord.Partials.ThreadMember,
    Discord.Partials.User,
  ],
});

client.once(Discord.Events.ClientReady, async (c) => {
  console.log("Ready and logged as " + c.user.username);
});

client.on("raw", async (packet) => {
  if (packet.t === "MESSAGE_CREATE") {
    const messageData = packet.d;

    if (messageData.message_reference) {
      console.log("This message is replying to another message.");

      if (messageData.message_snapshots) {
        console.log("This message contains forwarded content:");
        console.log(messageData.message_snapshots[0].message.embeds[0]);
      }
    }
  }
});

client.login(process.env.DiscordToken);
