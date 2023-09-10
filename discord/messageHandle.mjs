import { Client, Events, GatewayIntentBits } from "discord.js";
import { config } from "../config.mjs";
import {dbConnection} from "../dbconnection.mjs";
import { helpHandler } from "./help.mjs";
import { downloadHandler } from "./downloadHandle.mjs";

/**
 * 
 * @param { Client } client 
 * @param { GatewayIntentBits.GuildMessages } message 
 * @param { String } messageContent
 */
export async function manageMessage(client, message, messageContent) {
    //check which command given and call to the function that handle the command request
    message.channel.sendTyping();
    
    if(messageContent.startsWith(".crush help")) {
        return helpHandler(client, message);
    }

    if(messageContent.startsWith(".crush download")) {
        return downloadHandler(client, message, messageContent);
    }
}