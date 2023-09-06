import * as dotenv from "dotenv";
dotenv.config();

const config = {
    bot_token: process.env.BOT_TOKEN,
    dbhost: process.env.DB_HOST,
    dbuser: process.env.DB_USER,
    dbpass: process.env.DB_PASSWORD,
    dbdatabase: process.env.DB_DATABASE,
    
};

export {config};