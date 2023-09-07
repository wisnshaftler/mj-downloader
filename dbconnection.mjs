import mysql from 'mysql2';
import { config } from './config.mjs';

console.log(config)

const pool = new mysql.createPool({
    host: config.dbhost,
    user: config.dbuser,
    database: config.dbdatabase,
    waitForConnections: true,
    connectionLimit: 20,
    maxIdle: 6000,
    queueLimit: 0
});
const promisePool = pool.promise();

async function dbConnection(query) {
    const [rows, fields] = await promisePool.query(query);
    return { rows, fields, query};
}

export default dbConnection;
