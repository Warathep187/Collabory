import {NextFunction, Request, Response} from "express";
import Directory from "../models/directory";
import User from "../models/user";
import File from "../models/file";

export const onlyMemberProtection = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const {userId} = req.user;
        const teamId = req.params.teamId || req.body.teamId;
        if(!teamId) {
            return res.status(404).send({
                errors: [
                    {message: "Team not fond"}
                ]
            })
        }
        const user = await User.findById(userId).select("teams");
        if(!user!.teams.includes(teamId)) {
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

export const onlyDirectoryOwnerProtection = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const {userId} = req.user;
        const directoryId = req.params.directoryId || req.body.directoryId;
        if(!directoryId) {
            return res.status(404).send({
                errors: [
                    {message: "Directory not fond"}
                ]
            })
        }
        const directory = await Directory.findById(directoryId).select("createdBy");
        if(!directory) {
            return res.status(404).send({
                errors: [
                    {message: "Directory not fond"}
                ]
            })
        }
        if(directory.createdBy.toString() !== userId) {
            return res.status(409).send({
                errors: [
                    {message: "Could not delete this directory"}
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

export const onlyFileOwnerProtection = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const {userId} = req.user;
        const fileId = req.params.fileId || req.body.fileId;
        if(!fileId) {
            return res.status(404).send({
                errors: [
                    {message: "File not fond"}
                ]
            })
        }
        const file = await File.findById(fileId).select("createdBy");
        if(!file) {
            return res.status(404).send({
                errors: [
                    {message: "File not fond"}
                ]
            })
        }
        if(file.createdBy.toString() !== userId) {
            return res.status(409).send({
                errors: [
                    {message: "Could not manage this file"}
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