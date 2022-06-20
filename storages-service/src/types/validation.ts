import { ZodIssue } from "zod";

export interface ValidationResult<T> {
    success: boolean;
    error?: {
        issues: ZodIssue[];
    };
    data?: T;
}

export interface DirectoryInput {
    name: string;
    teamId: string;
    directoryId: string;
}

export interface FileInput {
    teamId: string;
    directoryId: string;
}