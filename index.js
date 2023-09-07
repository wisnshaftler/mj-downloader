import { Client, Events, GatewayIntentBits } from "discord.js";
import { config } from "./config.mjs";
import dbConnection from "./dbconnection.mjs";

//start bot and listen to events
const client = new Client({ intents: [GatewayIntentBits.Guilds, GatewayIntentBits.GuildMessages, GatewayIntentBits.GuildMessageTyping, ,] });

client.on("ready", () => {
    console.log("Bot is up and running");
});

//save in database when install to new server
client.on("guildCreate", (guild) => {
    console.log(guild);
    dbConnection("insert into disocrd_servers (guild_id) values('" + guild.id + "') ");

    const channel = guild.systemChannel || guild.channels.cache.find((ch)=> ch.type === "text");

    if(channel) {
        channel.send("Hey now you can download Midjourney images and more. To view all things that can you do, please send .crush help");
    };
});

client.on("guildIntegrationsUpdate", (guild) => {
    console.log(JSON.stringify(guild))
});
client.login(config.discord_token);