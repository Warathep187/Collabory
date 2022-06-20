import { Request, Response, NextFunction } from "express";
import Team from "../models/team";

export const onlyHostProtectionMiddleware = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const {userId} = req.user;
        const {teamId} = req.params;
        const team = await Team.findById(teamId).select("hostId");
        if(!team) {
            return res.status(500).send({
                errors: [
                    {message: "Something went wrong"}
                ]
            })
        }
        if(team.hostId !== userId) {
            return res.status(409).send({
                errors: [
                    {message: "Access denied"}
                ]
            })
        }
        next();
    }catch(e) {
        res.status(500).send({
            errors: [
                {message: "Something went wrong"}
            ]
        })
    }
}