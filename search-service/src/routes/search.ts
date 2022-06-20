import { Router, Request, Response } from "express";
import authorizedMiddleware from "../services/authorizedMiddleware";
import { onlyHostProtectionMiddleware } from "../services/protectionMiddleware";
import User from "../models/user";

const router = Router();

router.get(
    "/:teamId/invite/users",
    authorizedMiddleware,
    onlyHostProtectionMiddleware,
    async (req: Request, res: Response) => {
        try {
            let { key } = req.query;
            if (!key) {
                return res.send({
                    users: [],
                });
            }
            key = key.toString().trim();
            if (key === "") {
                return res.send({
                    users: [],
                });
            }
            const { teamId } = req.params;
            const users = await User.find({
                name: { $regex: key, $options: "i" },
                $and: [{ invitations: { $ne: teamId } }, { teams: { $ne: teamId } }],
            }).select("_id name profileImageUrl");
            res.send({
                users,
            });
        } catch (e) {
            res.status(500).send({
                errors: [{ message: "Something went wrong" }],
            });
        }
    }
);

router.get("/users", authorizedMiddleware, async (req: Request, res: Response) => {
    try {
        let { key } = req.query;
        if (!key) {
            return res.send({
                users: [],
            });
        }
        key = key.toString().trim();
        if (key === "") {
            return res.send({
                users: [],
            });
        }
        const { userId } = req.user;
        const users = await User.find({ _id: { $ne: userId }, name: { $regex: key, $options: "i" } }).select(
            "_id name profileImageUrl"
        );
        res.send({
            users,
        });
    } catch (e) {
        res.status(500).send({
            errors: [{ message: "Something went wrong" }],
        });
    }
});

export default router;
