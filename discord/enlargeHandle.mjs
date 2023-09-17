import { Client, Events, GatewayIntentBits } from "discord.js";
import { config } from "../config.mjs";
import { dbConnection } from "../dbconnection.mjs";
import { helpHandler } from "./help.mjs";
import { getMessageById } from "./getMsgById.mjs";
import { alreadyDownloaded } from "../utils/alreadyDownloaded.mjs";
import { addDownloadTask } from "../image_functions/image_downloader.mjs";
import { imageEnlarger } from "../image_functions/image_enlarger.mjs";
import { isRequestCountExceeded, updateRequestCount } from "../utils/server_package_manage.mjs";

let enlargerQueue = {};

export async function enlargeHandler(client, message, messageContent) {
    const repliedUserId = message.mentions?.repliedUser?.id || message.author?.id;
    const reference = message.reference;

    if (repliedUserId == undefined || repliedUserId == null) {
        return message.reply("This is not send by MJ");
    }

    if (reference == null || reference == undefined) {
        return message.reply("This is not send by MJ");
    }

    if (repliedUserId != config.mj_user_id) {
        return message.reply("This is not sent by MJ");
    }

    //check the query is correct or not
    const regexMatch = messageContent.match(/^\.crush large ([1-4]) (2x|4x|6x|8x)$/);

    if (!regexMatch || regexMatch.length != 3) {
        return message.reply("Command invalid");
    }

    //send the processing message to the discord server
    message.channel.send("Processing download");

    //get the message content and send it to downloader
    const replyMessageContent = await getMessageById(client, message, reference);

    //check images are already downloaded. if yes, then enlarge the images and send to the discord if not first download all the images and enlarge the image and send to the discord
    const isAlreadyDownloaded = await alreadyDownloaded(replyMessageContent.id);

    if (Array.isArray(isAlreadyDownloaded)) {
        console.log("await for downloading");
        return enlargeImage(client, message, replyMessageContent, messageContent, regexMatch, isAlreadyDownloaded[1])
    }

    //first download the all images
    enlargerQueue[replyMessageContent.id] = { client, message, replyMessageContent, messageContent, regexData: regexMatch };
    addDownloadTask(client, replyMessageContent, replyMessageContent, replyMessageContent.attachments.first());

}

export async function enlargeImage(client, message, replyMessageContent, messageContent, regexData, imageData) {
    const imageNumber = parseInt(regexData[1]);
    if (imageNumber > 4 && imageNumber < 1) {
        return message.channel.send("Image number is incorrect. Please check and try again");
    }

    const imageArray = imageData.download_imgs.split(",");
    if (imageArray.length < imageNumber) { return message.channel.send("There are no images in the MJ generated you given"); }

    const enlargeSize = regexData[2].replace("x", "");
    const requestedImage = regexData[2] + "_" + imageArray[imageNumber - 1];

    //check there are many requests
    let leftRequestCount;
    console.log(message.guildId)
    try {
        leftRequestCount = await isRequestCountExceeded(message.guildId);
        if (leftRequestCount[0] == false) {
            return message.reply("This server have issue, please contact the administrator");
        }

        if (leftRequestCount[1].request_count <= 0) {
            return message.reply("Your available requests count is over. Please buy more requests. Your last package is " + leftRequestCount[1].package);
        }
    } catch (e) {
        console.log("errpr", e.message)
        return message.reply("This server have issue, please contact the administrator");
    }
    //update requsst count
    await updateRequestCount(message.guildId, leftRequestCount[1].request_count - 1);

    //check already enlarged 
    let enlargedData = imageData.scale_up_img;
    if (enlargedData != null || enlargedData != "") {
        try {
            enlargedData = JSON.parse(enlargedData);

            //check there is image for requested size
            if (enlargedData.hasOwnProperty(regexData[2])) {
                for (let i = 0; i < enlargedData[regexData[2]].length; i++) {
                    const link = enlargedData[regexData[2]][i];

                    if (link == requestedImage) {
                        return replyMessageContent.reply("Download image from here: " + config.server_host + "/img/" + requestedImage)
                    }
                }
            }
        } catch (e) {
        }
    }

    //await for enlarging images
    const imageEnlarge = await imageEnlarger(imageArray[imageNumber - 1], enlargeSize);
    //check there are many requests
    try {
        leftRequestCount = await isRequestCountExceeded(message.guildId);
        if (leftRequestCount[0] == false) {
            return message.reply("This server have issue, please contact the administrator");
        }

        if (leftRequestCount[1].request_count <= 0) {
            return message.reply("Your available requests count is over. Please buy more requests. Your last package is " + leftRequestCount[1].package);
        }
    } catch (e) {
        console.log("usue 2", e.message)
        return message.reply("This server have issue, please contact the administrator");
    }
    //update requsst count
    await updateRequestCount(message.guildId, leftRequestCount[1].request_count - 1)

    if (imageEnlarge) {
        replyMessageContent.reply("Download image from here: " + config.server_host + "/img/" + requestedImage);
    }

    //update the image record with this 
    if (enlargedData == "" || enlargedData == null) {
        enlargedData = {};
    }

    if (enlargedData[regexData[2]] == null || enlargedData[regexData[2]] == undefined) {
        enlargedData[regexData[2]] = [];
    }

    enlargedData[regexData[2]].push(regexData[2] + "_" + imageArray[imageNumber - 1]);

    dbConnection("update download_images set scale_up_img = ? where message_id =?  ", [JSON.stringify(enlargedData), replyMessageContent.id])

    delete enlargerQueue[replyMessageContent.id];
}

export async function executeEnlargeQueue(messageId) {
    if (!enlargerQueue[messageId]) {
        return;
    }
    const { client, message, replyMessageContent, messageContent, regexData } = enlargerQueue[messageId];
    const isAlreadyDownloaded = await alreadyDownloaded(replyMessageContent.id);
    enlargeImage(client, message, replyMessageContent, messageContent, regexData, isAlreadyDownloaded[1]);
}