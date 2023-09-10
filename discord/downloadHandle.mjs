import { Client, Events, GatewayIntentBits } from "discord.js";
import { config } from "../config.mjs";
import {dbConnection} from "../dbconnection.mjs";
import { helpHandler } from "./help.mjs";
import { getMessageById } from "./getMsgById.mjs";
import { addDownloadTask } from "../image_downloader/image_downloader.mjs";

/**
 * 
 * @param {Client} client 
 * @param {GatewayIntentBits.GuildMessages} message 
 * @param {String} messageContent 
 */
export async function downloadHandler(client, message, messageContent) {
    const repliedUserId = message.mentions?.repliedUser?.id || message.author?.id;
    const reference = message.reference;

    if(repliedUserId == undefined || repliedUserId == null) {
        return message.reply("This is not send by MJ");
    }

    if(reference == null || reference == undefined) {
        return message.reply("This is not send by MJ");
    }

    if(repliedUserId != config.mj_user_id) {
        return message.reply("This is not sent by MJ");
    }

    //send the processing message to the discord server
    message.channel.send("Processing download");


    //get the message content and send it to downloader
    const replyMessageContent = await getMessageById(client, message, reference);

    //get image name and attachment main image link
    const attachments = replyMessageContent.attachments.first();

    //send to the downloader 
    addDownloadTask(client, message, replyMessageContent, attachments);
}

export async function emojiDownloadHandler(client, messageId, reaction) {
    //get MJ message content
    const replyMessageContent = await getMessageById(client, reaction.message, reaction);

    if(replyMessageContent.author.id != config.mj_user_id) {
        return 
    }
    
    reaction.message.reply("Processing download");

    //get image name and attachment main image link
    const attachments = replyMessageContent.attachments.first();

    //send to the downloader 
    addDownloadTask(client, reaction.message, replyMessageContent, attachments);
}