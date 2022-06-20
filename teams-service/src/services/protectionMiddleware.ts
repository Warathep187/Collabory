import {Request, Response, NextFunction} from "express";
import Invitation from "../models/invitation";
import Team from "../models/team";

export const onlyHostProtection = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const {userId} = req.user;
        const teamId = req.params.teamId || req.body.teamId;
        const team = await Team.findOne({_id: teamId}).select("hostId");
        if(!team) {
            return res.status(404).send({
                errors: [
                    {message: "Team not found"}
                ]
            })
        }
        if(team.hostId.toString() !== userId) {
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

export const onlyMemberProtection = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const {userId} = req.user;
        const teamId = req.params.teamId || req.body.teamId;

        const team = await Team.findOne({_id: teamId}).select("members");
        if(!team) {
            return res.status(404).send({
                errors: [
                    {message: "Team not found"}
                ]
            })
        }
        if(!team.members.includes(userId)) {
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
                {message: "Something went  wrong"}
            ]
        })
    }
}

export const onlyInvitedUserProtection = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const {userId} = req.user;
        const {teamId} = req.params;
        
        const invitation = await Invitation.findOne({userId, teamId});
        if(!invitation) {
            return res.status(409).send({
                errors: [
                    {message: "You have not been invited"}
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