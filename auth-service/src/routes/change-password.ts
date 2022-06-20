import { Router, Request, Response } from "express";
import authorizedMiddleware from "../services/authorizedMiddleware";
import Auth from "../models/auth";
import { hashPassword } from "../utils/hashing-actions";
import { validationMiddleware } from "../validations/change-password-validator";
import { ChangePasswordInput } from "../types/validation";

const router = Router();

router.put("/password/change", authorizedMiddleware, validationMiddleware, async (req: Request, res: Response) => {
    try {
        const {userId} = req.user;
        const {password} = req.body as ChangePasswordInput;
        const hashedPassword = await hashPassword(password);
        await Auth.updateOne({_id: userId}, {$set: {
            password: hashedPassword
        }})
        res.status(204).send();
    }catch(e) {
        res.status(500).send({
            errors: [
                {message: "Something went wrong"}
            ]
        })
    }
})

export default router;