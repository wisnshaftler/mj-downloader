import puppeteer from "puppeteer";
import { config } from "../config.mjs";
import fs from "fs";
import crypto from "crypto";
import { dbConnection, pool } from "../dbconnection.mjs";
import axios from "axios";
import { executeEnlargeQueue } from "../discord/enlargeHandle.mjs";

const waitingList = [];
const runningTasks = new Set();

export function    addDownloadTask(client, message, mjMessage, attachment) {
    const uniqueId = crypto.createHash('sha256').update(message.channelId + message.guildId + message.id + attachment.id + Date.now()).digest('hex');
    waitingList.push({ client, message, mjMessage, attachment, uniqueId });
    return true;
}

const awaiter = async (waitMs) => new Promise(resolve => { setTimeout(() => { resolve() }, waitMs || 3000) });

async function executeTask() {
    let taskData = null;
    
    if (waitingList.length <= 0) {
        await awaiter(100);
        return executeTask();
    }

    for (let task of waitingList) {
        if (runningTasks.has(task.uniqueId) == false) {
            runningTasks.add(task.uniqueId);
            taskData = task;
            waitingList.shift();
            break;
        }
    }

    // create CDN links for MJ
    const urlUniqueId = taskData.attachment.url.split("_").at(-1).replace(".png", "");

    const imageURLS = [];
    for (let i = 0; i < 4; i++) {
        const url = `https://cdn.midjourney.com/${urlUniqueId}/0_${i}.png`
        imageURLS.push(url);
    }

    //call to downloader each item 
    const generatedImages = [];
    for (let i = 0; i < imageURLS.length; i++) {
        const url = imageURLS[i];
        const downloadImage = await imageDownloader(url, taskData.uniqueId + "0_" + i + ".png");
        if (downloadImage) {
            generatedImages.push(taskData.uniqueId + "0_" + i + ".png");
        }
    }

    let imagePrompt = taskData.mjMessage.content.match(/\*\*(.*?)\*\*/);
    if (imagePrompt == null) {
        imagePrompt = "";
    } else {
        imagePrompt = imagePrompt[1];
    }

    //send data to discord channel
    let discordMessage = '** Download Images from here **';
    for (let imageLink of generatedImages) {
        let text = `
        ${config.server_host}/img/${imageLink}`;
        discordMessage += text;
    }
    discordMessage += `
        ${taskData.attachment.url}`;

    taskData.mjMessage.reply(discordMessage);
    runningTasks.delete(taskData.uniqueId);

    //save data in database and reponse to the message with downloadable links
    const sql = `insert into download_images (message_id, prompt, url_unique_id, local_img_key, download_imgs, discord_preview, guild_id) values(?, ?, ?, ?, ?, ?, ? ) `;
    dbConnection(sql, [taskData.mjMessage.id, imagePrompt, urlUniqueId, taskData.uniqueId, generatedImages.join(","), taskData.attachment.url, taskData.message.guildId.toString()]).then( () =>{    
        executeEnlargeQueue(taskData.mjMessage.id);
    });

}

export function createExecutors() {
    for (let i = 0; i < config.server_max_download_concurrency; i++) {
        executeTask();
    }
}

createExecutors();

// export async function imageDownloader(imageLink, fileName) {
//     let response = "";
//     try {
//         response = await axios.get(imageLink, {  responseType: 'arraybuffer' });
//         await new Promise((resolve, reject) => { 
            
//             fs.writeFile("./public/img/" +fileName, response.data, (err) => {
//                 if (err) {
//                     console.log(err);
//                     reject(null);
//                 }
//                 resolve(true)
//             });
//         });
//         return true;
//     } catch (e) {
//         console.log(e.message);
//         return null;
//     }
// }

export async function imageDownloader(imageLink, fileName) {
    //create browser in puppeteer
    const browser = await puppeteer.launch({
        executablePath: "/usr/bin/chromium-browser",
        headless: 'new',
        args: [
            '--disable-web-security',
            '--disable-features=IsolateOrigins',
            '--disable-site-isolation-trials',
            '--no-sandbox',
            '--disable-setuid-sandbox'
        ]
    });

    const page = await browser.newPage();
    await page.goto(`${config.server_host}?img=${imageLink}`);
    console.log(imageLink);

    let base64Data = await page.evaluate((imageLink) => {
        return new Promise((resolve, reject) => {
            const img = document.querySelector('img');
            try {
                var canvas = document.createElement('canvas');
                var context = canvas.getContext('2d');

                // Set the canvas dimensions to match the image
                canvas.width = img.width;
                canvas.height = img.height;

                // Draw the image onto the canvas
                context.drawImage(img, 0, 0);

                // Get the base64-encoded data from the canvas
                const base64Data = canvas.toDataURL('image/png');

                resolve(base64Data);
            } catch (e) {
                console.log(e.message);
                resolve("")
            }
        })
    }, imageLink);

    base64Data = base64Data.replace(/^data:image\/png;base64,/, "");

    await page.close();
    await browser.close();

    //if cant download file retunr
    if (base64Data == "") {
        return null;
    }

    //save file in image
    try {
        await new Promise((resolve, reject) => {
            fs.writeFile("./public/img/" + fileName , base64Data, "base64", (error) => {
                if (error) {
                    console.log(error);
                    reject (null);
                }
                resolve(true);
            })
        })
        return true;
    } catch (e) {
        console.error(e);
        return null
    }
}

