import { Router, Request, Response } from "express";
import { z } from "zod";
import reformatError from "../utils/reformat-error";
import AWS from "aws-sdk";
import createEmailParams from "../utils/createEmailParams";
import jwt from "jsonwebtoken";
import Auth from "../models/auth";
import { v4 } from "uuid";
import {ValidationResult} from "../types/validation";
import { hashPassword } from "../utils/hashing-actions";

const router = Router();

router.post("/password/reset/verify-email", async (req: Request, res: Response) => {
    try {
        const schema = z.string().trim().min(1, "Email must be provided").email("Email is invalid");
        const result = schema.safeParse(req.body.email as string);
        if(!result.success) {
            return res.status(400).send({
                errors: reformatError(result.error.issues)
            })
        }
        const user = await Auth.findOne({email: result.data}).select("email");
        if(!user) {
            return res.status(404).send({
                errors: [
                    {message: "Email does ot exist"}
                ]
            })
        }
        const resetPasswordCode = v4()
        const token = jwt.sign({
            resetPasswordCode
        }, process.env.JWT_RESET_PASSWORD!, {
            expiresIn: "10m"
        })
        user.resetPasswordCode = resetPasswordCode;
        const params = createEmailParams({
            email: user.email,
            subject: "Password resetting procedure",
            message: "Please click the following URL to reset your password. This URL is valid for 10 minutes.",
            url: `${process.env.CLIENT_URL!}/password/reset/${token}`,
        });
        const sendPromise = new AWS.SES({ apiVersion: "2010-12-01" }).sendEmail(params).promise();
        sendPromise
            .then(async() => {
                res.status(202).send({
                    message: "URL to reset password has sent to your email. This URL is valid for 10 minutes.",
                });
                await user.save();
            })
            .catch((e) => {
                res.status(400).send({
                    errors: [
                        {
                            message: `Could not sent email to ${req.body.email}`,
                        },
                    ],
                });
            });
    }catch(e) {
        res.status(500).send({
            errors: [
                {message: "Something went wrong"}
            ]
        })
    }
})

interface ResetPasswordInput {
    password: string;
    confirm: string;
    token: string;
}
router.put("/password/reset", (req: Request, res: Response) => {
    try {
        const schema = z.object({
            password: z.string().trim().min(8, "Password must be at least 8 characters."),
            confirm: z.string().trim().min(8, "Try to confirm your password again"),
            token: z.string().trim().regex(/^[\w-]*\.[\w-]*\.[\w-]*$/, "Invalid token")
        })
        const result = schema.safeParse(req.body as ResetPasswordInput) as ValidationResult<ResetPasswordInput>
        if(!result.success) {
            return res.status(400).send({
                errors: reformatError(result.error?.issues!)
            })
        }
        const {password, confirm, token} = result.data!;
        jwt.verify(token, process.env.JWT_RESET_PASSWORD!, async (err, result) => {
            if(err || !result) {
                return res.status(400).send({
                    errors: [
                        {message: "Token is invalid of expired."}
                    ]
                })
            }
            if(password !== confirm ) {
                return res.status(400).send({
                    errors: [
                        {field: "confirm", message: "Password does not match"}
                    ]
                })
            }
            const {resetPasswordCode} = result as {resetPasswordCode: string;};
            const user = await Auth.findOne({resetPasswordCode}).select("_id");
            if(!user) {
                return res.status(400).send({
                    errors: [
                        {message: "Reset password code is invalid. Please try again!"}
                    ]
                })
            }
            const hashedPassword = await hashPassword(password);
            user.password = hashedPassword;
            user.resetPasswordCode = "";
            await user.save();
            res.status(204).send()
        })
    }catch(e) {
        res.status(500).send({
            errors: [
                {message: "Something went wrong"}
            ]
        })
    }
})

export default router;