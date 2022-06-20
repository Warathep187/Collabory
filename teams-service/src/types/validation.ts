import { ZodIssue } from "zod";

export interface ValidationResult<T> {
    success: boolean;
    error?: {
        issues: ZodIssue[];
    };
    data?: T;
}

export interface CreateTeamInput {
    name: string;
    description: string;
}

export interface EditTeamInput {
    teamId: string;
    name: string;
    description: string;
}