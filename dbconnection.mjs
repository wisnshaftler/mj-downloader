import mysql from 'mysql2';
import { config } from './config.mjs';

const pool = new mysql.createPool({
    host: config.dbhost,
    user: config.dbuser,
    password: config.dbpass,
    database: config.dbdatabase,
    waitForConnections: true,
    connectionLimit: 20,
    maxIdle: 6000,
    queueLimit: 0
});
const promisePool = pool.promise();

async function dbConnection(query, values) {
    if(Array.isArray(values)) {
        const [rows, fields] = await promisePool.query(query, values);
        return { rows, fields, query};
    } 
    const [rows, fields] = await promisePool.query(query);
    return { rows, fields, query};
}

export  {dbConnection, pool};