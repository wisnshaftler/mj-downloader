import { Client, Events, GatewayIntentBits } from "discord.js";
import { config } from "../config.mjs";
import { dbConnection } from "../dbconnection.mjs";

export async function adminCreatePakcage(client, message, messageContent) {
    const messageAuthorId = String(message.author.id);
    const adminUserId = String(config.admin_user_id);

    if(messageAuthorId != adminUserId) {
        return message.reply("What are you doing creeping nature?");
    }
    console.log(message.author.id);
    console.log(config.admin_user_id);
}