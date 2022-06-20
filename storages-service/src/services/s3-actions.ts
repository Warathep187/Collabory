import AWS from "aws-sdk";
import fs from "fs";
import {v4 as uuidv4} from "uuid";

AWS.config.update({
    region: "us-east-2"
})

const s3 = new AWS.S3({ apiVersion: "2006-03-01" });

interface File {
    key: string;
    url: string
}

export const uploadFileToS3 = (path: string, extension: string): Promise<File> => {
    return new Promise(async (resolve, reject) => {
        const fileContent = fs.readFileSync(path);
        s3.upload({
            Bucket: process.env.AWS_S3_BUCKET!,
            Key: `storage-files/${uuidv4()}${extension ? ("." + extension): ""}`,
            Body: fileContent,
        }, (err, result) => {
            if(err) {
                return reject(err);
            }
            resolve({
                key: result.Key,
                url: result.Location
            })
        })
    })
}

export const deleteS3File = (key: string): Promise<void> => {
    return new Promise(async (resolve, reject) => {
        s3.deleteObject(
            {
                Bucket: process.env.AWS_S3_BUCKET!,
                Key: key,
            },
            (err) => {
                if (err) {
                    return reject(err);
                }
                resolve();
            }
        );
    });
};
