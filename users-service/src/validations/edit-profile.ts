import { Request, Response, NextFunction } from "express";
import { z } from "zod";
import reformatError from "../utils/reformat-error";
import { ValidationResult, EditProfileInput } from "../types/validation";

const schema = z.object({
    name: z.string().trim().min(1, "Name must be provided").max(64, "Name must be less than 64 characters"),
    bio: z.string().max(1024, "Bio must be less than 1024 characters"),
});

export const editProfileValidationMiddleware = (req: Request, res: Response, next: NextFunction) => {
    try {
        const result = schema.safeParse(req.body as EditProfileInput) as ValidationResult<EditProfileInput>;
        if (!result.success) {
            return res.status(400).send({
                errors: reformatError(result.error?.issues!),
            });
        }
        req.body = result.data;
        next();
    } catch (e) {
        res.status(500).send({
            errors: [{ message: "Something went wrong" }],
        });
    }
};
