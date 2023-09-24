import { Client, Events, GatewayIntentBits } from "discord.js";
import { config } from "../config.mjs";
import {dbConnection} from "../dbconnection.mjs";
import { helpHandler } from "./help.mjs";
import { downloadHandler } from "./downloadHandle.mjs";
import { enlargeHandler } from "./enlargeHandle.mjs";
import crypto from "crypto";
import { createPaymentLink } from "../stripe/stripe_link.mjs";


export async function getPaymentMethods(client, message, messageContent) {
    const activeMethods = (await dbConnection("select * from packages where package_status = ? ", ["active" ])).rows;
    
}

//get and send payment URL to the discord server
export async function getPaymentUrl(client, message, messageContent) {
    //get current active payments
    const regexPayMatch = messageContent.match(/\.crush pay (\d+)/);
    if(regexPayMatch == null) {
        return message.reply("Invalid command received");
    }
    //choosed payment method
    const choosedPayMethod = parseInt(regexPayMatch[1]);

    //get all active payment methods
    const activeMethods = (await dbConnection("select * from packages where package_status = ? ", ["active" ])).rows;
    let selectedmethod = null;

    for(let i = 0; i < activeMethods.length; i++) { 
        const activeMethod = activeMethods[i];
        if(activeMethod.id == choosedPayMethod) {
            selectedmethod = activeMethod;
            break;
        }
    }
    
    if( selectedmethod == null) {
        return message.reply("Choosed method is incorrect");
    }
    

    //create a checkout link and save it then return to the server with link
    const localKey =  crypto.createHash('sha256').update(message.channelId + message.guildId + message.id + Date.now()).digest('hex');

    const result = await createPaymentLink(selectedmethod.stripe_price_id, localKey);
    if(result == null) {
        return message.reply("There was an error creating the payment link. Please contact the administrator");
    }

    //save payment link data in DB
    await dbConnection("insert into payments (local_key, payment_link, is_used, guild_id, link_create_date, link_data, package_name) values (?, ?, 0, ?, ?, ?, ?)", [
        localKey, result.url, message.guildId, new Date(), JSON.stringify(result), selectedmethod.package_name
    ]);

    //send link to the discord
    return message.reply("Here is the link for " + selectedmethod.package_name + " package." + result.url);

}