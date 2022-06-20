import { Router, Request, Response } from "express";
import { getValueInCache, deleteDataInCache } from "../services/caching-actions";
import jwt from "jsonwebtoken";
import { hashPassword } from "../utils/hashing-actions";
import Auth from "../models/auth";
import { Publisher } from "../events/base-publisher";
import NatsEvents from "../events/events";
import { UserCreatedEvent } from "../types/publish-events";
import generateUniqueName from "../utils/generate-unique-name";

const router = Router();

router.post("/verify", (req: Request, res: Response) => {
    try {
        const {token} = req.body as {token: string};
        if(!token || !token.match(/^[\w-]*\.[\w-]*\.[\w-]*$/)) {
            return res.status(400).send({
                errors: [
                    {message: "Token is invalid"}
                ]
            })
        }
        jwt.verify(token, process.env.JWT_EMAIL_VERIFICATION!, async (err, result) => {
            if(err || !result) {
                return res.status(400).send({
                    errors: [
                        {message: "Token is invalid or expired"}
                    ]
                })
            }
            const {email} = result as {email: string;};
            const isUserVerified = await Auth.findOne({email});
            if(isUserVerified) {
                return res.status(409).send({
                    errors: [
                        {message: "Account has already verified."}
                    ]
                })
            }
            const password = await getValueInCache(email);
            if(!password) {
                return res.status(400).send({
                    errors: [
                        {message: "Token has expired. Please signup again."}
                    ]
                })
            }
            const hashedPassword = await hashPassword(password);
            const name = generateUniqueName();
            const newUser = new Auth({email, password: hashedPassword, createdAt: new Date()});
            await newUser.save();

            const publisher = new Publisher<UserCreatedEvent>(NatsEvents.UserCreated);
            await publisher.publish({
                _id: newUser._id,
                name,
                email: newUser.email
            })

            res.status(201).send({
                message: "Verified. Let's login!"
            })

            deleteDataInCache(email);
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