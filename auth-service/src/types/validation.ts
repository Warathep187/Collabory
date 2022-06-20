import { ZodIssue } from "zod";

export interface ValidationResult<T> {
    success: boolean;
    error?: {
        issues: ZodIssue[];
    };
    data?: T;
}

export interface SignupInput {
    email: string;
    password: string;
    confirm: string;
}

export interface SignInInput {
    email: string;
    password: string;
}

export interface ChangePasswordInput {
    password: string;
    confirm: string;
}