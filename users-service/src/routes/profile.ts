import { Router, Request, Response } from "express";
import authorizedMiddleware from "../services/authorizedMiddleware";
import User from "../models/user";

const router = Router();

router.get("/profile", authorizedMiddleware, async (req: Request, res: Response) => {
    try {
        const { userId } = req.user;
        const user = await User.findById(userId).select("-unreadMessage -unreadNotification -_version");
        if (!user) {
            req.session = null;
            return res.status(401).send({
                errors: [{ message: "Unauthorized" }],
            });
        }
        res.status(200).send({
            user
        });
    } catch (e) {
        res.status(500).send({
            errors: [{ message: "Something went wrong" }],
        });
    }
});

router.get("/nav-information", authorizedMiddleware, async (req: Request, res: Response) => {
    try {
        const { userId } = req.user;
        const user = await User.findById(userId).select("-email -bio -_version");
        if (!user) {
            req.session = null;
            return res.status(401).send({
                errors: [{ message: "Unauthorized" }],
            });
        }
        res.status(200).send({
            user
        });
    } catch (e) {
        res.status(500).send({
            errors: [{ message: "Something went wrong" }],
        });
    }
});

router.get("/profile/:id", authorizedMiddleware, async (req: Request, res: Response) => {
    try {
        const { id } = req.params;
        const { userId } = req.user;
        if (userId === id) {
            const user = await User.findById(userId).select("-unreadMessage -unreadNotification");
            return res.status(200).send({
                user
            });
        }
        const user = await User.findOne({ _id: id }).select("_id name profileImage bio");
        if (!user) {
            return res.status(404).send({
                errors: [{ message: "User not found" }],
            });
        }
        res.status(200).send({
            user,
        });
    } catch (e) {
        res.status(500).send({
            errors: [{ message: "Something went  wrong" }],
        });
    }
});

export default router;
