import { Router, Request, Response } from "express";
import authorizedMiddleware from "../services/authorizedMiddleware";
import { onlyMemberProtectionMiddleware } from "../services/protectionMiddleware";
import Post from "../models/post";
import { Types } from "mongoose";

const router = Router();

router.get("/:postId/:teamId", authorizedMiddleware, onlyMemberProtectionMiddleware, async (req: Request, res: Response) => {
    try {
        const {postId} = req.params;

        if(!postId) {
            return res.status(404).send({
                errors: [
                    {message: "Post not found"}
                ]
            })
        }

        const post = await Post.findById(postId).select("likes").populate("likes", "_id name profileImageUrl");

        if(!post) {
            return res.status(404).send({
                errors: [
                    {message: "Post not found"}
                ]
            })
        }

        res.send({
            likes: post.likes
        })
    }catch(e) {
        res.status(500).send({
            errors: [
                {message: "Something went wrong"}
            ]
        })
    }
})

router.put("/:postId/:teamId", authorizedMiddleware, onlyMemberProtectionMiddleware, async (req: Request, res: Response) => {
    try {
        const {userId} = req.user;
        const {postId} = req.params;

        if(!postId) {
            return res.status(404).send({
                errors: [
                    {message: "Post not found"}
                ]
            })
        }

        const post = await Post.findById(postId).select("likes");

        if(!post) {
            return res.status(404).send({
                errors: [
                    {message: "Post not found"}
                ]
            })
        }

        const userObjectId = new Types.ObjectId(userId);
        if(post.likes.includes(userObjectId)) {
            return res.status(409).send({
                errors: [
                    {message: "You has already liked this post"}
                ]
            })
        }
        post.likes.push(userObjectId);
        await post.save();

        res.status(204).send();
    }catch(e) {
        res.status(500).send({
            errors: [
                {message: "Something went wrong"}
            ]
        })
    }
});

router.put("/unlike/:postId/:teamId", authorizedMiddleware, onlyMemberProtectionMiddleware, async (req: Request, res: Response) => {
    try {
        const {userId} = req.user;
        const {postId} = req.params;

        if(!postId) {
            return res.status(404).send({
                errors: [
                    {message: "Post not found"}
                ]
            })
        }

        const post = await Post.findById(postId).select("likes");

        if(!post) {
            return res.status(404).send({
                errors: [
                    {message: "Post not found"}
                ]
            })
        }

        const userObjectId = new Types.ObjectId(userId);
        if(!post.likes.includes(userObjectId)) {
            return res.status(409).send({
                errors: [
                    {message: "You does not like this post yet"}
                ]
            })
        }
        post.likes = post.likes.filter(like => like.toString() !== userId);
        await post.save();

        res.status(204).send();
    }catch(e) {
        res.status(500).send({
            errors: [
                {message: "Something went wrong"}
            ]
        })
    }
})

export default router;