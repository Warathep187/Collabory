import jwt from "jsonwebtoken";
import {Request, Response, NextFunction} from "express";

interface UserPayload {
    userId: string
}

declare global {
    namespace Express {
        interface Request {
            user: {
                userId: string
            }
        }
    }
}

const authorizedMiddleware = (req: Request, res: Response, next: NextFunction) => {
    try {
        const token = req.session?.token as string | undefined;
        if(!token) {
            return res.status(401).send({
                errors: [
                    {message: "Unauthorized"}
                ]
            })
        }
        jwt.verify(token, process.env.JWT_AUTHORIZATION_TOKEN!, (err, result) => {
            if(err) {
                req.session = null;
                return res.status(401).send({
                    errors: [
                        {message: "Unauthorized"}
                    ]
                })
            }
            const {userId} = result as UserPayload;
            req.user = {
                userId
            }
            next();
        })
    }catch(e) {
        res.status(500).send({
            errors: [
                {message: "Something went wrong"}
            ]
        })
    }
}

export default authorizedMiddleware;