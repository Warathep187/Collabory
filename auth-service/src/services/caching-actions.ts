import { resolve } from "path";
import {createClient} from "redis";
const client = createClient();

interface SignedUpUser {
    email: string;
    password: string;
}

export const connectToRedis = async (): Promise<void> => {
    return new Promise(async(resolve, reject) => {
        try {
            await client.connect();
            resolve();
        }catch(e) {
            reject(e);
        }
    })
}

export const saveSignedUpUserInCache = ({email, password}: SignedUpUser): Promise<void> => {
    return new Promise(async(resolve, reject) => {
        try {
            const isExisting = await client.exists(email);
            if(isExisting) {
                await client.del(email);
            }
            await client.setEx(email, 10 * 60, password);
            resolve();
        }catch(e) {
            reject(e);
        }
    })
}

export const getValueInCache = (key: string): Promise<string | null> => {
    return new Promise(async(resolve, reject) => {
        try {
            const value = await client.get(key);
            resolve(value);
        }catch(e) {
            reject(e);
        }
    })
}

export const deleteDataInCache = (key: string): Promise<void> => {
    return new Promise(async(resolve, reject) => {
        try {
            await client.del(key);
            resolve();
        }catch(e) {
            reject(e);
        }
    })
}