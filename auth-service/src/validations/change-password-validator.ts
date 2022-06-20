import { z } from "zod";
import { Request, Response, NextFunction } from "express";
import { ValidationResult } from "../types/validation";
import reformatError from "../utils/reformat-error";
import { ChangePasswordInput } from "../types/validation";

const schema = z.object({
    password: z.string().trim().min(8, "Password must be at least 8 characters"),
    confirm: z.string().trim().min(8, "Password must be at least 8 characters")
})

export const validationMiddleware = (req: Request, res: Response, next: NextFunction) => {
    try {
        const result = schema.safeParse(req.body as ChangePasswordInput) as ValidationResult<ChangePasswordInput>;
        if(!result.success) {
            res.status(400).send({
                errors: reformatError(result.error?.issues!)
            })
        } else {
            if(result.data?.password !== result.data?.confirm) {
                return res.status(400).send({
                    errors: [
                        {field: "confirm", message: "Password does not match"}
                    ]
                })
            }
            req.body = result.data;
            next();
        }
    }catch(e) {
        res.status(500).send({
            errors: [
                {message: "Something went wrong"}
            ]
        })
    }
}