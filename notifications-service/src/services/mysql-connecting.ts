import mysql from "mysql2/promise";
import {USER_SCHEMA} from "../schemas/users";
import {TEAM_SCHEMA} from "../schemas/teams";
import {NOTIFICATION_SCHEMA} from "../schemas/notifications";


export let connection: mysql.Connection;

export const connectToMysql = (): Promise<void> => {
    return new Promise(async (resolve, reject) => {
        try {
            connection = await mysql.createConnection({
                host: process.env.MYSQL_HOST,
                user: process.env.MYSQL_USER,
                password: process.env.MYSQL_PASSWORD,
                database: process.env.MYSQL_DATABASE,
            });
            console.log("Mysql is connected");
            await connection.execute(`CREATE TABLE IF NOT EXISTS ${USER_SCHEMA}`);
            await connection.execute(`CREATE TABLE IF NOT EXISTS ${TEAM_SCHEMA}`);
            await connection.execute(`CREATE TABLE IF NOT EXISTS ${NOTIFICATION_SCHEMA}`);
            resolve();
        } catch (e) {
            reject(e);
        }
    });
};
