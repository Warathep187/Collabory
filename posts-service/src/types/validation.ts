import { ZodIssue } from "zod";

export interface ValidationResult<T> {
    success: boolean;
    error?: {
        issues: ZodIssue[];
    };
    data?: T;
}

export interface NewPostInput {
    title: string;
    content: string;
    teamId: string;
}

export interface EditPostInput extends NewPostInput {
    postId: string;
}

export interface EditReplyInput {
    content: string;
    replyId: string;
}