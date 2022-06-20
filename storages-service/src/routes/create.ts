import { Router, Request, Response } from "express";
import authorizedMiddleware from "../services/authorizedMiddleware";
import { onlyMemberProtection } from "../services/protectionMiddleware";
import createDirectoryValidationMiddleware from "../validations/create-dir";
import createFileValidationMiddleware from "../validations/create-file";
import { DirectoryInput } from "../types/validation";
import Directory from "../models/directory";
import File from "../models/file";
import filesUploader from "../utils/multer-config";
import { uploadFileToS3 } from "../services/s3-actions";
import fs from "fs";

const router = Router();

router.post(
    "/directories/create",
    authorizedMiddleware,
    onlyMemberProtection,
    createDirectoryValidationMiddleware,
    async (req: Request, res: Response) => {
        try {
            const { userId } = req.user;
            const { name, teamId, directoryId } = req.body as DirectoryInput;

            if(teamId !== directoryId) {
                const dir = await Directory.findOne({_id: directoryId}).select("_id");
                if(!dir) {
                    return res.status(404).send({
                        errors: [
                            {message: "Directory not found"}
                        ]
                    })
                }
            }

            const isDuplicateName = await Directory.findOne({ inDirectory: directoryId, name }).select("_id");
            if (isDuplicateName) {
                return res.status(409).send({
                    errors: [{ field: "name", message: "Directory name is duplicated" }],
                });
            }
            const newDir = new Directory({
                name,
                teamId,
                inDirectory: directoryId,
                createdBy: userId,
                createdAt: new Date(),
            });
            await newDir.save();

            const dir = await Directory.findById(newDir._id).populate("createdBy", "_id name");

            res.status(201).send({
                directory: dir,
            });
        } catch (e) {
            res.status(500).send({
                errors: [{ message: "Something went wrong" }],
            });
        }
    }
);

router.post(
    "/files/create",
    authorizedMiddleware,
    filesUploader.single("file"),
    onlyMemberProtection,
    createFileValidationMiddleware,
    async (req: Request, res: Response) => {
        try {
            const { userId } = req.user;
            const { teamId, directoryId } = req.body as DirectoryInput;

            if (!req.file) {
                return res.status(400).send({
                    errors: [{ field: "file", message: "File must be provided" }],
                });
            }

            if(teamId !== directoryId) {
                const dir = await Directory.findOne({_id: directoryId}).select("_id");
                if(!dir) {
                    return res.status(404).send({
                        errors: [
                            {message: "Directory not found"}
                        ]
                    })
                }
            }

            const splitted = req.file?.originalname.split(".");
            const extension = splitted[splitted.length - 1];
            const uploadedFile = await uploadFileToS3(req.file?.path, extension);

            const newFile = new File({
                name: req.file?.originalname,
                teamId,
                inDirectory: directoryId,
                source: uploadedFile,
                createdBy: userId,
                createdAt: new Date(),
            });
            await newFile.save();

            const file = await File.findById(newFile._id).populate("createdBy", "_id name");

            res.send({
                newFile: file
            });

            fs.unlinkSync(req.file?.path!);
        } catch (e) {
            res.status(500).send({
                errors: [{ message: "Something went wrong" }],
            });
        }
    }
);
export default router;
