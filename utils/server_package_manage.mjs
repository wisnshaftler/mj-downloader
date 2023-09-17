import { config } from "../config.mjs";
import {dbConnection} from "../dbconnection.mjs";

export async function isRequestCountExceeded(guild_id) {
    const dbResult = await dbConnection("select package, request_count from disocrd_servers where guild_id = ?", [guild_id]);
    if(dbResult.rows.length <= 0) {
        return [false, null];
    }

    if(dbResult.rows[0].requestCount <= 0) {
        return [false, dbResult.rows[0]];
    }

    return [true, dbResult.rows[0]];
}


export async function updateRequestCount(guild_id, requestCount) {
    dbConnection("update discord_servers set request_count = ? where guild_id = ?", [requestCount, guild_id]);
}