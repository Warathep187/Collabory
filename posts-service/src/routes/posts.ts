import { Router, Request, Response } from "express";
import authorizedMiddleware from "../services/authorizedMiddleware";
import { onlyMemberProtectionMiddleware, onlyPostOwnerProtectionMiddleware } from "../services/protectionMiddleware";
import { NewPostInput, EditPostInput } from "../types/validation";
import createPostValidationMiddleware from "../validations/create-post";
import editPostValidationMiddleware from "../validations/edit-post";
import Post from "../models/post";
import { Types } from "mongoose";
import Reply from "../models/reply";

const router = Router();

router.get("/:teamId", authorizedMiddleware, onlyMemberProtectionMiddleware, async (req: Request, res: Response) => {
    try {
        const { userId } = req.user;
        const { teamId } = req.params;
        let skip = req.query.skip?.toString() || 0;
        skip = isNaN(+skip) ? 0 : +skip;

        if (!teamId) {
            return res.status(404).send({
                errors: [{ message: "Team not found" }],
            });
        }

        const posts = await Post.find({ teamId })
            .populate("createdBy", "_id name profileImageUrl")
            .skip(skip)
            .limit(10)
            .sort({ createdAt: -1 });

        const userObjectId = new Types.ObjectId(userId);
        const reformatedPosts = posts.map((post) => ({
            _id: post._id,
            title: post.title,
            content: post.content,
            teamId: post.teamId,
            likes: post.likes.length,
            isLiked: post.likes.includes(userObjectId),
            createdBy: post.createdBy,
            createdAt: post.createdAt,
        }));
        res.send({
            posts: reformatedPosts,
        });
    } catch (e) {
        res.status(500).send({
            errors: [{ message: "Something went wrong" }],
        });
    }
});

router.get(
    "/:postId/:teamId",
    authorizedMiddleware,
    onlyMemberProtectionMiddleware,
    async (req: Request, res: Response) => {
        try {
            const { userId } = req.user;
            const { postId } = req.params;

            if (!postId) {
                return res.status(404).send({
                    errors: [{ message: "Post not found" }],
                });
            }

            const post = await Post.findById(postId).populate("createdBy", "_id name profileImageUrl");

            if (!post) {
                return res.status(404).send({
                    errors: [{ message: "Post not found" }],
                });
            }

            const userObjectId = new Types.ObjectId(userId);
            const reformatedPost = {
                _id: post._id,
                title: post.title,
                content: post.content,
                teamId: post.teamId,
                likes: post.likes.length,
                isLiked: post.likes.includes(userObjectId),
                createdBy: post.createdBy,
                createdAt: post.createdAt,
            };

            res.send({
                post: reformatedPost,
            });
        } catch (e) {
            res.status(500).send({
                errors: [{ message: "Something went wrong" }],
            });
        }
    }
);

router.post(
    "/create",
    authorizedMiddleware,
    onlyMemberProtectionMiddleware,
    createPostValidationMiddleware,
    async (req: Request, res: Response) => {
        try {
            const { userId } = req.user;
            const { title, content, teamId } = req.body as NewPostInput;

            const newPost = new Post({ title, content, teamId, likes: [], createdBy: userId, createdAt: new Date() });
            await newPost.save();

            res.status(201).send({
                post: newPost,
            });
        } catch (e) {
            console.log(e);
            res.status(500).send({
                errors: [{ message: "Something went wrong" }],
            });
        }
    }
);

router.put(
    "/edit",
    authorizedMiddleware,
    onlyMemberProtectionMiddleware,
    onlyPostOwnerProtectionMiddleware,
    editPostValidationMiddleware,
    async (req: Request, res: Response) => {
        try {
            const { title, content, teamId, postId } = req.body as EditPostInput;

            await Post.updateOne({_id: postId}, {$set: {title, content, teamId}});

            res.status(204).send();
        } catch (e) {
            res.status(500).send({
                errors: [{ message: "Something went wrong" }],
            });
        }
    }
);

router.delete("/:postId/:teamId", authorizedMiddleware, onlyMemberProtectionMiddleware, onlyPostOwnerProtectionMiddleware, async (req: Request, res: Response) => {
    try {
        const {postId} = req.params;

        await Post.deleteOne({_id: postId});
        await Reply.deleteMany({postId});

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
