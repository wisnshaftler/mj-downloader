import * as dotenv from "dotenv";
dotenv.config();

const config = {
    dbhost: process.env.DB_HOST,
    dbuser: process.env.DB_USER,
    dbpass: process.env.DB_PASSWORD,
    dbdatabase: process.env.DB_DATABASE,
    discord_token: process.env.DISCORD_TOKEN,
    discord_application_id: process.env.DISCORD_APPLICATION_ID,
    discord_client_secret: process.env.DISCORD_CLIENT_SECRET
};

export { config}