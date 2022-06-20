import { z } from "zod";
import { ValidationResult } from "../types/validation";
import { Request, Response, NextFunction } from "express";
import reformatError from "../utils/reformat-error";
import { SignupInput } from "../types/validation";

const schema = z.object({
    email: z.string().trim().min(1, "Email must be provided").email("Email is invalid"),
    password: z.string().min(8, "Password must be at least 8 characters").trim(),
    confirm: z.string().min(8, "Confirm passwords must be at least 8 characters")
})

export const validationMiddleware = (req: Request, res: Response, next: NextFunction) => {
    try {
        const result = schema.safeParse(req.body as SignupInput) as ValidationResult<SignupInput>;
        if(!result.success) {
            res.status(400).send({
                errors: reformatError(result.error?.issues!)
            })
        } else {
            if(result.data?.password.trim() !== result.data?.confirm.trim()) {
                res.status(400).send({
                    errors: [
                        {
                            field: "confirm",
                            message: "Password does not match"
                        }
                    ]
                })
            } else {
                req.body = result.data;
                next();
            }
        }
    }catch(e) {
        res.status(500).send({
            errors: [
                {
                    message: "Something went wrong",
                },
            ],
        });
    }
}