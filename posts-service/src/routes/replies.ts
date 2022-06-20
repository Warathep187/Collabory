import { Router, Request, Response } from "express";
import Reply from "../models/reply";
import Post from "../models/post";
import authorizedMiddleware from "../services/authorizedMiddleware";
import { onlyMemberProtectionMiddleware, onlyReplyOwnerProtectionMiddleware } from "../services/protectionMiddleware";
import editReplyValidationMiddleware from "../validations/edit-reply";
import { EditReplyInput } from "../types/validation";

const router = Router();

router.get(
    "/:postId/:teamId/replies",
    authorizedMiddleware,
    onlyMemberProtectionMiddleware,
    async (req: Request, res: Response) => {
        try {
            const { postId } = req.params;
            let skip = req.query.skip?.toString() || 0;
            skip = isNaN(+skip) ? 0 : +skip;

            if (!postId) {
                return res.status(404).send({
                    errors: [{ message: "Post not found" }],
                });
            }

            const replies = await Reply.find({ postId })
                .populate("createdBy", "_id name profileImageUrl")
                .limit(8)
                .skip(skip)
                .sort({ createdAt: -1 });

            res.send({
                replies,
            });
        } catch (e) {
            res.status(500).send({
                errors: [{ message: "Something went wrong" }],
            });
        }
    }
);

router.post(
    "/:postId/:teamId/replies/create",
    authorizedMiddleware,
    onlyMemberProtectionMiddleware,
    async (req: Request, res: Response) => {
        try {
            const { content } = req.body as { content: string };
            const { postId, teamId } = req.params;
            const { userId } = req.user;

            if (!content || content.trim() === "") {
                return res.status(400).send({
                    errors: [{ field: "content", message: "Content is required" }],
                });
            }
            if (content.length > 2048) {
                return res.status(400).send({
                    errors: [{ field: "content", message: "Content must be less than 2048 characters" }],
                });
            }

            const post = await Post.findById(postId).select("_id createdBy");
            if (!post) {
                return res.status(404).send({
                    errors: [{ message: "Post not found" }],
                });
            }

            const newReply = new Reply({ content, postId, teamId, createdBy: userId, createdAt: new Date() });
            await newReply.save();

            res.status(201).send({
                reply: newReply,
            });
        } catch (e) {
            res.status(500).send({
                errors: [{ message: "Something went wrong" }],
            });
        }
    }
);

router.put(
    "/:teamId/replies/edit",
    authorizedMiddleware,
    onlyMemberProtectionMiddleware,
    onlyReplyOwnerProtectionMiddleware,
    editReplyValidationMiddleware,
    async (req: Request, res: Response) => {
        try {
            const {content, replyId} = req.body as EditReplyInput;

            await Reply.updateOne({_id: replyId}, {$set: {content}});

            res.status(204).send();
        }catch(e) {
            res.status(500).send({
                errors: [
                    {message: "Something went wrong"}
                ]
            })
        }
    }
);

router.delete("/:teamId/replies/:replyId", authorizedMiddleware, onlyMemberProtectionMiddleware, onlyReplyOwnerProtectionMiddleware, async (req: Request, res: Response) => {
    try {
        const {replyId} = req.params;;

        await Reply.deleteOne({_id: replyId});

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
