import { Router, Request, Response } from "express";
import { validationMiddleware } from "../validations/sign-in-validator";
import { SignInInput } from "../types/validation";
import setRateLimitMiddleware from "../utils/rateLimit";
import { comparePassword } from "../utils/hashing-actions";
import Auth from "../models/auth";
import jwt from "jsonwebtoken";

const router = Router();

router.post(
    "/sign-in",
    setRateLimitMiddleware(10, 20, "Too many login request, please try again later."),
    validationMiddleware,
    async (req: Request, res: Response) => {
        try {
            const { email, password } = req.body as SignInInput;
            const user = await Auth.findOne({ email }).select("_id password loginFail");
            if (!user) {
                return res.status(400).send({
                    errors: [{ message: "Email or password is incorrect" }],
                });
            }
            if(user.loginFail.canSignInAgainAt && new Date() < user.loginFail.canSignInAgainAt) {
                return res.status(400).send({
                    errors: [
                        {message: "Too much enter wrong password. Please try again later."}
                    ]
                })
            }
            const isMatch = await comparePassword(password, user.password);
            if (!isMatch) {
                if(user.loginFail.fail < 5) {
                    user.loginFail.fail = user.loginFail.fail + 1;
                    res.status(400).send({
                        errors: [{ message: "Email or password is incorrect" }],
                    });
                    await user.save();
                } else {
                    const canSignInAgainAt = new Date();
                    canSignInAgainAt.setMinutes(canSignInAgainAt.getMinutes() + 2);
                    user.loginFail.fail = 0;
                    user.loginFail.canSignInAgainAt = canSignInAgainAt;
                    await user.save();
                    res.status(400).send({
                        errors: [
                            {message: "Too much enter wrong password. Please try again later."}
                        ]
                    })
                }
            } else {
                user.loginFail.fail = 0;
                const token = jwt.sign(
                    {
                        userId: user._id,
                    },
                    process.env.JWT_AUTHORIZATION_TOKEN!,
                    {
                        expiresIn: "7d",
                    }
                );
                req.session = {
                    token
                }
                res.status(204).send();
                await user.save();
            }
        } catch (e) {
            res.status(500).send({
                errors: [{ message: "Something went wrong" }],
            });
        }
    }
);

export default router;
