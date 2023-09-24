import { Client, Events, GatewayIntentBits } from "discord.js";
import { config } from "../config.mjs";
import {dbConnection} from "../dbconnection.mjs";

/**
 * 
 * @param {Client} client 
 * @param { GatewayIntentBits.GuildMessages } message 
 */
export async function helpHandler(client, message){
    let helpContent = 
    `**Thank you for using MJ Crush!**
    
    *When send command to bot, please start with .crush*
    
    **Here is all the commands that you can use**

    - \`.crush help \`
        - _to get help from the bot_
- \`.crush download \`
        - _Basic command to download images. Please send this command as reply to the MJ image generated message._
- \`.crush large 1 4x\`
        - _enlarge the 1st image by 4 times. The first number (in this case 1) is the image number and the size of the image mensioned by number that in before x
        (in this case 4). You can use 2x 4x 6x 8x as your plan._
- '👇' 
    - _This is the easy way to download images. Add "point down" emoji to the MJ image message and then bot will download the image_

-  \`.crush d \`
    - _Same as download_

-  \`.crush packages \`
    - _Shows available packages_   

-   \`.crush pay 1
    - _Buy the package. In the example 1 is the package id. When you use .crush packages command you can find all the packages and their IDs. Use this command for get the unique payment link for your account.
    `;

    message.channel.send(helpContent);
}