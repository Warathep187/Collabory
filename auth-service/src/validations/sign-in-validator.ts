import { z } from "zod";
import { Request, Response, NextFunction } from "express";
import reformatError from "../utils/reformat-error";
import {ValidationResult} from "../types/validation";
import { SignInInput } from "../types/validation";

const schema = z.object({
    email: z.string().trim().min(1, "Email must be provided").email("Email is invalid"),
    password: z.string().trim().min(8, "Email or password is incorrect"),
});

export const validationMiddleware = (req: Request, res: Response, next: NextFunction) => {
    try {
        const result = schema.safeParse(req.body as SignInInput) as ValidationResult<SignInInput>;
        if (!result.success) {
            res.status(400).send({
                errors: reformatError(result.error?.issues!),
            });
        } else {
            req.body = result.data;
            next();
        }
    } catch (e) {
        res.status(500).send({
            errors: [
                {
                    message: "Something went wrong",
                },
            ],
        });
    }
};