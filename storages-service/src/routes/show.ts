import { Router, Request, Response } from "express";
import authorizedMiddleware from "../services/authorizedMiddleware";
import { onlyMemberProtection } from "../services/protectionMiddleware";
import Directory from "../models/directory";
import File from "../models/file";

const router = Router();

router.get(
    "/directories/:directoryId/:teamId",
    authorizedMiddleware,
    onlyMemberProtection,
    async (req: Request, res: Response) => {
        try {
            const { directoryId, teamId } = req.params;
            if (!directoryId) {
                return res.status(404).send({
                    errors: [{ message: "Directory not found" }],
                });
            }
            if(directoryId !== teamId) {
                const directory = await Directory.findById(directoryId).select("_id");
                if(!directory) {
                    return res.status(404).send({
                        errors: [
                            {message: "Directory not found"}
                        ]
                    })
                }
            }
            
            const directories = await Directory.find({ teamId, inDirectory: directoryId })
                .populate("createdBy", "_id name")
                .sort({ createdAt: -1 });
            const files = await File.find({ teamId, inDirectory: directoryId }).populate("createdBy", "_id name").sort({
                createdAt: -1,
            });

            res.send({
                directories,
                files,
            });
        } catch (e) {
            res.status(500).send({
                errors: [{ message: "Something went wrong" }],
            });
        }
    }
);

export default router;
