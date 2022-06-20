import { ZodIssue } from "zod";

const reformatError = (issues: ZodIssue[]) => {
    return issues.map(issue => ({field: issue.path[0], message: issue.message}));
}

export default reformatError;