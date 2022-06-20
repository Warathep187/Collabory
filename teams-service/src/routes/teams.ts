import { Request, Response, Router } from "express";
import authorizedMiddleware from "../services/authorizedMiddleware";
import Team from "../models/team";
import {onlyMemberProtection} from "../services/protectionMiddleware";

const router = Router();

router.get("/", authorizedMiddleware, async (req: Request, res: Response) => {
    try {
        const { userId } = req.user;
        const teams = await Team.find({ members: userId }).select("-_version");
        const reformatedTeams = teams.map((team) => ({
            _id: team._id,
            hostId: team.hostId,
            name: team.name,
            imageUrl: team.image.url,
            members: team.members.length,
        }));
        res.send({
            teams: reformatedTeams,
        });
    } catch (e) {
        res.status(500).send({
            errors: [{ message: "Something went wrong" }],
        });
    }
});

router.get("/:teamId", authorizedMiddleware, onlyMemberProtection, async (req: Request, res: Response) => {
    try {
        const { teamId } = req.params;
        const team = await Team.findOne({ _id: teamId })
            .select("-_version")
            .populate("hostId", "_id name profileImageUrl")
            .populate("members", "_id name profileImageUrl");
        if(!team) {
            return res.status(404).send({
                errors: [
                    {message: "Team not found"}
                ]
            })
        }
        res.send({
            team,
        });
    } catch (e) {
        res.status(500).send({
            errors: [{ message: "Something went wrong" }],
        });
    }
});

export default router;
