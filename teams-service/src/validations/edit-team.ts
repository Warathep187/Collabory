import reformatError from "../utils/reformat-error";
import { ValidationResult, EditTeamInput } from "../types/validation";
import { z } from "zod";
import {Request, Response, NextFunction} from "express";

const schema = z.object({
    teamId: z.string().regex(/^(?=[a-f\d]{24}$)(\d+[a-f]|[a-f]+\d)/i, "Invalid team id"),
    name: z.string().trim().max(128, "Team name must be less than 128 characters"),
    description: z.string().max(1024, "Team description must be less than 1024 characters")
});

const editTeamValidationMiddleware = (req: Request, res: Response, next: NextFunction) => {
    try {
        const result = schema.safeParse(req.body as EditTeamInput) as ValidationResult<EditTeamInput>;
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

export default editTeamValidationMiddleware;