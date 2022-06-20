import { Request, Response, Router } from "express";
import authorizedMiddleware from "../services/authorizedMiddleware";
import Team from "../models/team";
import { onlyHostProtection } from "../services/protectionMiddleware";
import { EditTeamInput } from "../types/validation";
import editTeamValidationMiddleware from "../validations/edit-team";
import Publisher from "../events/base-publisher";
import NatsEvents from "../events/events";
import { TeamEditedEvent, TeamImageEditedEvent } from "../types/publish-events";
import setRateLimitMiddleware from "../utils/rateLimit";
import imageUploader from "../services/multer-config";
import {uploadImageToS3, deleteS3Image} from "../services/s3-actions";
import fs from "fs";

const router = Router();

router.put(
    "/edit",
    setRateLimitMiddleware(10, 20, "Too many edit team. Please try again later"),
    authorizedMiddleware,
    onlyHostProtection,
    editTeamValidationMiddleware,
    async (req: Request, res: Response) => {
        try {
            const { teamId, name, description } = req.body as EditTeamInput;

            const editedTeam = await Team.findOneAndUpdate(
                { _id: teamId },
                { name, description, $inc: { _version: 1 } },
                { new: true }
            ).select("_version");

            const publisher = new Publisher<TeamEditedEvent>(NatsEvents.TeamEdited);
            await publisher.publish({
                _id: teamId,
                name,
                _version: editedTeam?._version!,
            });

            res.status(204).send();
        } catch (e) {
            res.status(500).send({
                errors: [{ message: "Something went wrong" }],
            });
        }
    }
);

router.put(
    "/edit/image",
    setRateLimitMiddleware(10, 15, "Too many upload image. Please try again later"),
    authorizedMiddleware,
    imageUploader.single("image"),
    onlyHostProtection,
    async (req: Request, res: Response) => {
        try {
            if(!req.file) {
                return res.status(400).send({
                    errors: [
                        {field: "image", message: "Team image must be provided"}
                    ]
                })
            }
            if(req.file?.size > (5 * 1024 * 1000)) {
                fs.unlinkSync(req.file?.path!);
                return res.status(400).send({
                    errors: [
                        {field: "image", message: "Image size must be less than 5mb"}
                    ]
                })
            }
            const team = await Team.findById(req.body.teamId).select("_id image _version");
            if(team!.image.key) {
                deleteS3Image(team!.image.key);
            }
            const uploadedImage = await uploadImageToS3(req.file?.path!, req.file?.mimetype);
            team!.image = uploadedImage;
            team!._version = team!._version + 1;
            await team!.save();

            const publisher = new Publisher<TeamImageEditedEvent>(NatsEvents.TeamImageEdited);
            await publisher.publish({
                _id: team!._id,
                imageUrl: uploadedImage.url,
                _version: team!._version
            })

            res.status(201).send({
                imageUrl: uploadedImage.url
            })

            fs.unlinkSync(req.file?.path!);
        } catch (e) {
            res.status(500).send({
                errors: [{ message: "Something went wrong" }],
            });
        }
    }
);

export default router;
