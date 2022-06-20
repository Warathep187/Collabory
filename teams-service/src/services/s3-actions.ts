import AWS from "aws-sdk";
import { v4 as uuidv4 } from "uuid";
import fs from "fs";

AWS.config.update({ region: "us-east-2" });

const s3 = new AWS.S3({ apiVersion: "2006-03-01" });

interface Image {
    key: string;
    url: string;
}

export const uploadImageToS3 = (path: string, mimetype: string): Promise<Image> => {
    return new Promise(async (resolve, reject) => {
        const imageContent = fs.readFileSync(path);
        s3.upload(
            {
                Bucket: process.env.AWS_S3_BUCKET!,
                Key: `team-images/${uuidv4()}.${mimetype.substring(mimetype.indexOf("/") + 1)}`,
                Body: imageContent,
            },
            (err, result) => {
                if (err) {
                    return reject(err);
                }
                resolve({
                    key: result.Key,
                    url: result.Location,
                });
            }
        );
    });
};

export const deleteS3Image = (key: string): Promise<void> => {
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
