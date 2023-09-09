import { Client, Events, GatewayIntentBits } from "discord.js";
import { config } from "../config.mjs";
import dbConnection from "../dbconnection.mjs";
import { helpHandler } from "./help.mjs";

/**
 * 
 * @param {*} client 
 * @param {*} message 
 * @param {*} reference 
 * @returns {Promise object} error null
 */
export async function getMessageById(client, message, reference) {
    const messageId = reference.messageId;

    try {
        const messageContent = await message.channel.messages.fetch(messageId);
        return messageContent;
    } catch(e) {
        console.log(e)
        return null;
    }
}