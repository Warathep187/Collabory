import { Request, Response, Router } from "express";
import authorizedMiddleware from "../services/authorizedMiddleware";
import createTeamValidationMiddleware from "../validations/create-team";
import setRateLimitMiddleware from "../utils/rateLimit";
import { CreateTeamInput } from "../types/validation";
import imageUploader from "../services/multer-config";
import fs from "fs";
import { uploadImageToS3 } from "../services/s3-actions";
import Team from "../models/team";
import Publisher from "../events/base-publisher";
import NatsEvents from "../events/events";
import { TeamCreatedEvent } from "../types/publish-events";

const router = Router();

router.post(
    "/create",
    setRateLimitMiddleware(10, 15, "Too many create team. Please try again later."),
    authorizedMiddleware,
    imageUploader.single("image"),
    createTeamValidationMiddleware,
    async (req: Request, res: Response) => {
        try {
            const { userId } = req.user;
            const { name, description } = req.body as CreateTeamInput;
            if (!req.file) {
                return res.status(400).send({
                    errors: [{ field: "image", message: "Cover image must be provided" }],
                });
            }
            if (req.file?.size! > 5 * 1000 * 1024) {
                fs.unlinkSync(req.file?.path!);
                return res.status(400).send({
                    errors: [{ field: "image", message: "Image size must be less than 5mb" }],
                });
            }
            const uploadedImage = await uploadImageToS3(req.file?.path!, req.file?.mimetype!);
            const newTeam = new Team({
                hostId: userId,
                name,
                description,
                image: uploadedImage,
                members: [userId],
                createdAt: new Date(),
            });
            await newTeam.save();

            const publisher = new Publisher<TeamCreatedEvent>(NatsEvents.TeamCreated);
            await publisher.publish({
                _id: newTeam._id,
                name: newTeam.name,
                imageUrl: uploadedImage.url,
                hostId: userId
            });

            res.status(201).send({
                team: newTeam,
            });

            fs.unlinkSync(req.file?.path!);
        } catch (e) {
            res.status(500).send({
                errors: {
                    message: "Something went wrong",
                },
            });
        }
    }
);

export default router;
