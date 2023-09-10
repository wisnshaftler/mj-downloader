import { dbConnection } from "../dbconnection.mjs";
import { config } from "dotenv";

export async function alreadyDownloaded(messageId, message) {
    const dbResult = await dbConnection("Select * from download_images where message_id = ? order by id desc limit 1 ", [messageId]);

    if (dbResult.rows.length <= 0) return false;

    let generatedImages = dbResult.rows[0].download_imgs.split(",");
    const discordAttachment = dbResult.rows[0].discord_preview;

    //send data to discord channel
    let discordMessage = '** Download Images from here **';
    for (let imageLink of generatedImages) {
        let text = `
        ${config.server_host}/img/${imageLink}`;
        discordMessage += text;
    }
    discordMessage += `
        ${discordAttachment}`;

    message.reply(discordMessage);
    return true;
}