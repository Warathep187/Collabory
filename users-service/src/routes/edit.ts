import { Router, Request, Response, NextFunction } from "express";
import authorizedMiddleware from "../services/authorizedMiddleware";
import User from "../models/user";
import { editProfileValidationMiddleware } from "../validations/edit-profile";
import { Publisher } from "../events/base-publisher";
import NatsEvents from "../events/events";
import imageUploader from "../services/multer-config";
import fs from "fs";
import { deleteS3Image, uploadImageToS3 } from "../services/s3-actions";
import { EditProfileEvent, EditProfileImageEvent } from "../types/publish-events";
import setRateLimitMiddleware from "../utils/rateLimit";
import { EditProfileInput } from "../types/validation";

const router = Router();

router.put(
    "/profile/edit",
    authorizedMiddleware,
    editProfileValidationMiddleware,
    async (req: Request, res: Response) => {
        try {
            const { userId } = req.user;
            const { name, bio } = req.body as EditProfileInput;
            const updated = await User.findOneAndUpdate(
                { _id: userId },
                { name, bio, $inc: { _version: 1 } },
                { new: true }
            );
            const publisher = new Publisher<EditProfileEvent>(NatsEvents.UserEdited);
            await publisher.publish({
                _id: userId,
                name,
                _version: updated?._version!,
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
    "/profile/edit/profile-image",
    setRateLimitMiddleware(5, 10, "Too many edit profile image. Please try again later."),
    authorizedMiddleware,
    imageUploader.single("image"),
    async (req: Request, res: Response) => {
        try {
            if(!req.file) {
                return res.status(400).send({
                    errors: [
                        {field: "image", message: "Profile image must be provided"}
                    ]
                })
            }
            if (req.file?.size! > 5 * 1000 * 1024) {
                fs.unlinkSync(req.file?.path!);
                return res.status(400).send({
                    errors: [{ field: "image", message: "Image size must be less than 5mb" }],
                });
            }
            const { userId } = req.user;
            const profileImage = await uploadImageToS3(req.file?.path!, req.file?.mimetype!);

            const user = await User.findById(userId).select("profileImage _version");

            if (user!.profileImage.key) {
                deleteS3Image(user!.profileImage.key);
            }
            user!.profileImage = profileImage;
            user!._version = user!._version + 1;
            await user!.save();

            res.status(201).send({
                profileImageUrl: profileImage.url,
            });

            const publisher = new Publisher<EditProfileImageEvent>(NatsEvents.UserImageEdited);
            await publisher.publish({
                _id: userId,
                profileImageUrl: profileImage.url,
                _version: user?._version!,
            });
            fs.unlinkSync(req.file?.path!);
        } catch (e) {
            res.status(500).send({
                errors: [{ message: "Something went  wrong" }],
            });
        }
    }
);

export default router;
