import {z} from "zod";
import reformatError from "../utils/reformat-error";
import { NewPostInput, ValidationResult } from "../types/validation";
import { Request, Response, NextFunction } from "express";

const schema = z.object({
    title: z.string().min(1, "Title must be provided").max(256, "Title must be less than 256 characters"),
    content: z.string().max(2048, "Content must be less than 2048 characters"),
    teamId: z.string().min(1, "Team ID is required").regex(/^(?=[a-f\d]{24}$)(\d+[a-f]|[a-f]+\d)/i, "Invalid team ID")
})

const createPostValidationMiddleware = (req: Request, res: Response, next: NextFunction) => {
    try {
        const result = schema.safeParse(req.body as NewPostInput) as ValidationResult<NewPostInput>;
        if(!result.success) {
            res.status(400).send({
                errors: reformatError(result.error?.issues!)
            })
        } else {
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

export default createPostValidationMiddleware;