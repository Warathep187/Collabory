import { Router, Request, Response } from "express";
import Directory from "../models/directory";
import File from "../models/file";
import authorizedMiddleware from "../services/authorizedMiddleware";
import { onlyDirectoryOwnerProtection, onlyFileOwnerProtection } from "../services/protectionMiddleware";
import { deleteS3File } from "../services/s3-actions";

const router = Router();

router.delete("/directories/:directoryId/:teamId", authorizedMiddleware, onlyDirectoryOwnerProtection, async (req: Request, res: Response) => {
    try {
        const {directoryId} = req.params;

        if(!directoryId) {
            return res.status(400).send({
                errors: [
                    {message: "Invalid directory ID"}
                ]
            })
        }

        const directory = await Directory.findOne({_id: directoryId}).select("_id");
        if(!directory) {
            return res.status(404).send({
                errors: [
                    {message: "Directory not found"}
                ]
            })
        }

        const directoriesInsideSpecifiedDir = await Directory.countDocuments({inDirectory: directoryId});
        if(directoriesInsideSpecifiedDir > 0) {
            return res.status(400).send({
                errors: [
                    {message: "Delete directories that inside this directory first."}
                ]
            })
        }
        res.status(202).send();

        const files = await File.find({inDirectory: directoryId}).select("-_id source");
        await File.deleteMany({inDirectory: directoryId});
        await Directory.deleteOne({_id: directoryId});

        for(const file of files) {
            await deleteS3File(file.source.key);
        }
    }catch(e) {
        res.status(500).send({
            errors: [
                {message: "Something went wrong"}
            ]
        })
    }
});

router.delete("/files/:fileId/:teamId", authorizedMiddleware, onlyFileOwnerProtection, async (req: Request, res: Response) => {
    try {
        const {fileId} = req.params;

        if(!fileId) {
            return res.status(400).send({
                errors: [
                    {message: "Invalid file ID"}
                ]
            })
        }

        const file = await File.findOne({_id: fileId}).select("source");
        if(!file) {
            return res.status(404).send({
                errors: [
                    {message: "File not found"}
                ]
            })
        }

        res.status(204).send();

        await File.deleteOne({_id: fileId});
        await deleteS3File(file.source.key);
    }catch(e) {
        res.status(500).send({
            errors: [
                {message: "Something went wrong"}
            ]
        })
    }
})

export default router;