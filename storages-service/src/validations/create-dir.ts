import { Request, Response, NextFunction } from "express";
import { z } from "zod";
import {ValidationResult, DirectoryInput} from "../types/validation";
import reformatError from "../utils/reformat-error";

const Schema = z.object({
    name: z.string().min(1, "Directory name must be provided"),
    teamId: z
        .string()
        .min(1, "Team ID must be provided")
        .regex(/^(?=[a-f\d]{24}$)(\d+[a-f]|[a-f]+\d)/i, "Invalid team ID"),
    directoryId: z
        .string()
        .min(1, "Directory ID must be provided")
        .regex(/^(?=[a-f\d]{24}$)(\d+[a-f]|[a-f]+\d)/i, "Invalid directory ID"),
});


export const createDirectoryValidationMiddleware = (req: Request, res: Response, next: NextFunction) => {
    try {
        const result = Schema.safeParse(req.body as DirectoryInput) as ValidationResult<DirectoryInput>;
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

export default createDirectoryValidationMiddleware;