import { Router, Request, Response } from "express";
import { validationMiddleware } from "../validations/signup-validator";
import { SignupInput } from "../types/validation";
import setRateLimitMiddleware from "../utils/rateLimit";
import AWS from "aws-sdk";
import createEmailParams from "../utils/createEmailParams";
import jwt from "jsonwebtoken";
import { saveSignedUpUserInCache } from "../services/caching-actions";
import Auth from "../models/auth";

AWS.config.update({
    region: "us-east-1",
});

const router = Router();

router.post(
    "/signup",
    setRateLimitMiddleware(10, 15, "Too many signup request."),
    validationMiddleware,
    async (req: Request, res: Response) => {
        const { email, password } = req.body as SignupInput;
            await saveSignedUpUserInCache({
                email,
                password,
            });
            const token = jwt.sign(
                {
                    email,
                },
                process.env.JWT_EMAIL_VERIFICATION!,
                {
                    expiresIn: "10m",
                }
            );
            console.log(token);
            res.send();
    //     try {
    //         const { email, password } = req.body as SignupInput;
    //         const isEmailExisting = await Auth.findOne({ email });
    //         if (isEmailExisting) {
    //             return res.status(400).send({
    //                 errors: [{ message: "Email has already used" }],
    //             });
    //         }
    //         await saveSignedUpUserInCache({
    //             email,
    //             password,
    //         });
    //         const token = jwt.sign(
    //             {
    //                 email,
    //             },
    //             process.env.JWT_EMAIL_VERIFICATION!,
    //             {
    //                 expiresIn: "10m",
    //             }
    //         );
    //         console.log(token);
    //         const params = createEmailParams({
    //             email,
    //             subject: "Email verification",
    //             message: "Please click the following URL to verify your email. This URL is valid for 10 minutes.",
    //             url: `${process.env.CLIENT_URL!}/verify/${token}`,
    //         });
    //         const sendPromise = new AWS.SES({ apiVersion: "2010-12-01" }).sendEmail(params).promise();
    //         sendPromise
    //             .then(() => {
    //                 res.status(202).send({
    //                     message: "Email verification has sent to your email.",
    //                 });
    //             })
    //             .catch((e) => {
    //                 res.status(400).send({
    //                     errors: [
    //                         {
    //                             message: `Could not sent email to ${req.body.email}`,
    //                         },
    //                     ],
    //                 });
    //             });
    //     } catch (e) {
    //         res.status(500).send({
    //             errors: [{ message: "Something went wrong" }],
    //         });
    //     }
    }
);

export default router;
