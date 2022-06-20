import {Router, Request, Response} from "express";
import authorizedMiddleware from "../services/authorizedMiddleware";

const router = Router();

router.put("/logout", authorizedMiddleware, (req: Request, res: Response) => {
    try {
        req.session = null;
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