import { Request, Response, NextFunction } from "express";
import User from "../models/user";
import Post from "../models/post";
import Reply from "../models/reply";

export const onlyMemberProtectionMiddleware = async (req: Request, res: Response, next: NextFunction) => {
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
        if(!user || !user!.teams.includes(teamId)) {
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

export const onlyPostOwnerProtectionMiddleware = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const {userId} = req.user;
        const postId = req.params.postId || req.body.postId;

        if(!postId) {
            return res.status(404).send({
                errors: [
                    {message: "Post not found"}
                ]
            })
        }

        const post = await Post.findById(postId).select("createdBy");
        if(!post) {
            return res.status(404).send({
                errors: [
                    {message: "Post not found"}
                ]
            })
        }
        if(post.createdBy.toString() !== userId) {
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

export const onlyReplyOwnerProtectionMiddleware = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const {userId} = req.user;
        const replyId = req.params.replyId || req.body.replyId;

        if(!replyId) {
            return res.status(404).send({
                errors: [
                    {message: "Reply not found"}
                ]
            })
        }

        const reply = await Reply.findById(replyId).select("createdBy");

        if(!reply) {
            return res.status(404).send({
                errors: [
                    {message: "Reply not found"}
                ]
            })
        }
        if(reply.createdBy.toString() !== userId) {
            return res.status(409).send({
                errors: [
                    {message: "Access denied"}
                ]
            })
        }
        next();
    }catch(e) {
        console.log(e);
        res.status(500).send({
            errors: [
                {message: "Something went wrong"}
            ]
        })
    }
}