import * as dotenv from "dotenv";
dotenv.config();

const config = {
    dbhost: process.env.DB_HOST,
    dbuser: process.env.DB_USER,
    dbpass: process.env.DB_PASSWORD,
    dbdatabase: process.env.DB_DATABASE,
    discord_token: process.env.DISCORD_TOKEN,
    discord_application_id: process.env.DISCORD_APPLICATION_ID,
    discord_client_secret: process.env.DISCORD_CLIENT_SECRET,
    mj_user_id: "936929561302675456",
    server_port: process.env.SERVER_PORT,
    server_max_download_concurrency: parseInt(process.env.MAX_DOWNLOAD_CONCURRENCY) || 4,
    server_host: process.env.SERVER_HOST
};

export { config}