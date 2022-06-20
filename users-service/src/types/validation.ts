import { ZodIssue } from "zod";

export interface ValidationResult<T> {
    success: boolean;
    error?: {
        issues: ZodIssue[];
    };
    data?: T;
}

export interface EditProfileInput {
    name: string;
    bio: string;
}