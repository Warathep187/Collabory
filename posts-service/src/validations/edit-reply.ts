import {z} from "zod";
import reformatError from "../utils/reformat-error";
import { EditReplyInput, ValidationResult } from "../types/validation";
import { Request, Response, NextFunction } from "express";

const schema = z.object({
    content: z.string().max(2048, "Content must be less than 2048 characters"),
    replyId: z.string().min(1, "Reply ID is required").regex(/^(?=[a-f\d]{24}$)(\d+[a-f]|[a-f]+\d)/i, "Invalid reply ID"),
})

const editReplyValidationMiddleware = (req: Request, res: Response, next: NextFunction) => {
    try {
        const result = schema.safeParse(req.body as EditReplyInput) as ValidationResult<EditReplyInput>;
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

export default editReplyValidationMiddleware;