import { Client, Events, GatewayIntentBits } from "discord.js";
import { config } from "../config.mjs";
import { dbConnection } from "../dbconnection.mjs";

export async function adminCreatePakcage(client, message, messageContent) {
    const messageAuthorId = String(message.author.id);
    const adminUserId = String(config.admin_user_id);

    if (messageAuthorId != adminUserId) {
        return message.reply("What are you doing creeping nature?");
    }

    const regexMsg = messageContent.match(/\{(.*?)\}/g);

    if (regexMsg.length != 5) {
        return message.reply("Invalid message. Please check and retry.");
    }

    for (let i = 0; i < regexMsg.length; i++) {
        const currentOne = regexMsg[i].replace(/[{}]/g, '');
        regexMsg[i] = currentOne;
    }

    try {
        const packageName = regexMsg[0];
        const packagePrice = parseFloat(regexMsg[1]);
        const packageMaxReqCount = parseInt(regexMsg[2]);
        const packageStripePriceId = regexMsg[3];
        const packageStatus = regexMsg[4];

        if (packageStatus != "active" && packageStatus != "inactive") {
            return message.reply("Package status is invalid");
        }

        if (packagePrice <= 0 || packageMaxReqCount <= 0 || isNaN(packageMaxReqCount) || isNaN(packagePrice)) {
            return message.reply("Package price or request count is invalid. Should be positive number.");
        }

        if (packageStripePriceId == "") {
            return message.reply("Package stripe price id is invalid.");
        }

        if (packageName == "" || packageName == null || packageName.length == 0 || packageName == undefined) {
            return message.reply("Package name is invalid. ");
        }

        await dbConnection("insert into packages (package_name, package_price, package_max_req, stripe_price_id, package_status) values(?, ?, ?, ?, ?) ", [packageName, packagePrice, packageMaxReqCount, packageStripePriceId, packageStatus]);
        return message.reply("Created new package");

    } catch (e) {
        console.log(e.message)
        return message.reply("Something went wrong. Please try again later.");
    }
}


export async function adminUpdatePackage(client, message, messageContent) {
    const messageAuthorId = String(message.author.id);
    const adminUserId = String(config.admin_user_id);

    if (messageAuthorId != adminUserId) {
        return message.reply("What are you doing creeping nature?");
    }

    const regexMsg = messageContent.match(/\{(.*?)\}/g);
    if (regexMsg.length != 6) {
        return message.reply("Invalid message. Please check and retry.");
    }

    for (let i = 0; i < regexMsg.length; i++) {
        const currentOne = regexMsg[i].replace(/[{}]/g, '');
        regexMsg[i] = currentOne;
    }

    try {
        const packageName = regexMsg[0];
        const packagePrice = parseFloat(regexMsg[1]);
        const packageMaxReqCount = parseInt(regexMsg[2]);
        const packageStripePriceId = regexMsg[3];
        const packageStatus = regexMsg[4];
        const packageId = regexMsg[5];

        if (packageStatus != "active" && packageStatus != "inactive") {
            return message.reply("Package status is invalid");
        }

        if (packagePrice <= 0 || packageMaxReqCount <= 0 || isNaN(packageMaxReqCount) || isNaN(packagePrice)) {
            return message.reply("Package price or request count is invalid. Should be positive number.");
        }

        if (packageStripePriceId == "") {
            return message.reply("Package stripe price id is invalid.");
        }

        if (packageName == "" || packageName == null || packageName.length == 0 || packageName == undefined) {
            return message.reply("Package name is invalid. ");
        }

        if(packageId == ""  || packageId == null || packageId == undefined || packageId.length == 0) {
            return message.reply("Package id is invalid. ");
        }

        await dbConnection("update packages set package_name = ?, package_price = ?, package_max_req = ?, stripe_price_id = ? , package_status = ? where id = ? ", 
        [packageName, packagePrice, packageMaxReqCount, packageStripePriceId, packageStatus, packageId]);
        return message.reply("Update the package ");

    } catch (e) {
        console.log(e.message)
        return message.reply("Something went wrong. Please try again later.");
    }

}

export async function adminChangePackageStatus(client, message, messageContent) {
    const messageAuthorId = String(message.author.id);
    const adminUserId = String(config.admin_user_id);

    if (messageAuthorId != adminUserId) {
        return message.reply("What are you doing creeping nature?");
    }

    const regexMsg = messageContent.match(/\{(.*?)\}/g);
    if (regexMsg.length != 2) {
        return message.reply("Invalid message. Please check and retry.");
    }

    for (let i = 0; i < regexMsg.length; i++) {
        const currentOne = regexMsg[i].replace(/[{}]/g, '');
        regexMsg[i] = currentOne;
    }

    try {
        const id = regexMsg[0];
        const status = regexMsg[1].trim();

        if(id == undefined || id == null || id.length == 0) {
           return message.reply("ID is invalid");
        }

        if(status == undefined || status == null || status.length == 0 || (status != "active" && status != "inactive")) {
           return message.reply("Status is invalid. It shoud be active or inactive.");
        }
        
        await dbConnection("update packages set package_status = ? where id = ?",[ status, id ]);

        message.reply("Package updated successfully");
    } catch(e) {
        console.log(e.message);
        return  message.reply("Something went wrong. Please try again later");
    }
}