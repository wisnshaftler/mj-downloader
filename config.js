import * as dotenv from "dotenv";
dotenv.config();

const config = {
    bot_token: process.env.BOT_TOKEN,
};

export {config};