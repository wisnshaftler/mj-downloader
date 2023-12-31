import { Client, Events, GatewayIntentBits, Partials} from "discord.js";
import { config } from "./config.mjs";
import {dbConnection} from "./dbconnection.mjs";
import { manageMessage } from "./discord/messageHandle.mjs";
import express from "express";
import cors from "cors";
import { emojiDownloadHandler } from "./discord/downloadHandle.mjs";
import { stripeRouter } from "./stripe/stripe_listening.mjs";


//start bot and listen to events
const client = new Client({ intents: [GatewayIntentBits.Guilds, GatewayIntentBits.GuildMessages, GatewayIntentBits.GuildMessageTyping, GatewayIntentBits.MessageContent, GatewayIntentBits.GuildMessageReactions, GatewayIntentBits.DirectMessageReactions],
partials: [Partials.Message, Partials.Channel, Partials.Reaction] });

client.on("ready", () => {
    console.log("Bot is up and running");
});

//save in database when install to new server
client.on("guildCreate", (guild) => {
    console.log(guild);

    // insert in to database or update the table
    dbConnection("insert into discord_servers (guild_id, status) values('" + guild.id + "', 'active') on duplicate key update status='active' ").then(() => {
    });

    const channel = guild.systemChannel || guild.channels.cache.find((ch)=> ch.type === "text");

    if(channel) {
        channel.send("Hey now you can download Midjourney images and more. To view all things that can you do, please send .crush help");
    };
});

client.on("guildIntegrationsUpdate", (guild) => {
    console.log(JSON.stringify(guild))
});


client.on("guildDelete", (guild) => {
    dbConnection("update discord_servers  set status = 'inactive'  where guild_id = ('" + guild.id + "') ");

});


//read message and send to manage message
client.on("messageCreate", (message)=>{
    if( message.author.id == client.user.id) return;

    const messageContent =  message.content.toLocaleLowerCase().trim();
    if(messageContent.startsWith(".crush")) {
        return manageMessage(client, message, messageContent);
    }
    return ;
})

client.on("messageReactionAdd", (reaction, user)=>{
    //console.log(reaction);
    if(reaction.emoji.name == '👇') {
        return emojiDownloadHandler(client, reaction.message.id, reaction);
    }
});


client.login(config.discord_token);

//start express server for serving
const server = express();
server.use(cors());
server.use(express.json());
server.use(express.static("public"));
server.use("/webhooks/stripe", stripeRouter );

server.listen(config.server_port, function(){
    console.log("Server is up and running on port ", config.server_port);
})