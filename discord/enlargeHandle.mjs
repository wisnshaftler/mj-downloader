import { Client, Events, GatewayIntentBits } from "discord.js";
import { config } from "../config.mjs";
import {dbConnection} from "../dbconnection.mjs";
import { helpHandler } from "./help.mjs";
import { getMessageById } from "./getMsgById.mjs";
import { alreadyDownloaded } from "../utils/alreadyDownloaded.mjs";
import { addDownloadTask } from "../image_functions/image_downloader.mjs";

let enlargetQueue = {};

export async function enlargeHandler(client, message, messageContent) {
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

    //check the query is correct or not
    const regexMatch = messageContent.match(/^\.crush large ([1-4]) (2x|4x|6x|8x)$/);

    if(regexMatch && regexMatch.length != 3) {
        return message.reply("Command invalid");
    }

    //send the processing message to the discord server
    message.channel.send("Processing download");

    //get the message content and send it to downloader
    const replyMessageContent = await getMessageById(client, message, reference);

    //check images are already downloaded. if yes, then enlarge the images and send to the discord if not first download all the images and enlarge the image and send to the discord
    const isAlreadyDownloaded = await alreadyDownloaded(replyMessageContent.id);

    if(Array.isArray(isAlreadyDownloaded)) {
        //call to enlarger
        console.log('already downloaded')
    }

    //first download the all images
    enlargetQueue[replyMessageContent.id] = {client, message, messageContent};
    addDownloadTask(client, replyMessageContent, replyMessageContent, replyMessageContent.attachments.first());

}

export function executeEnlargeQueue(messageId) {
    console.log(messageId);
    console.log(enlargetQueue[messageId]);
}