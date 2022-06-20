import { Request, Response, Router } from "express";
import authorizedMiddleware from "../services/authorizedMiddleware";
import { TeamInvitedEvent, TeamInviteCancelledEvent, TeamAcceptedEvent, TeamDeclinedEvent, TeamRemovedEvent } from "../types/publish-events";
import NatsEvents from "../events/events";
import { onlyHostProtection, onlyInvitedUserProtection } from "../services/protectionMiddleware";
import setRateLimitMiddleware from "../utils/rateLimit";
import Invitation from "../models/invitation";
import User from "../models/user";
import Team from "../models/team";
import Publisher from "../events/base-publisher";

const router = Router();

router.get("/:teamId/invitations", authorizedMiddleware, onlyHostProtection, async (req: Request, res: Response) => {
    try {
        const {teamId} = req.params;
        
        const invitations = await Invitation.find({teamId}).populate("userId", "_id name profileImageUrl").sort({createdAt: -1});
        res.send({
            invitations
        })
    } catch(e) {
        res.status(500).send({
            errors: [
                {message: "Something went wrong"}
            ]
        })
    }
})

router.post("/:teamId/invite", authorizedMiddleware, onlyHostProtection, async (req: Request, res: Response) => {
    try {
        const { teamId } = req.params;
        const { userId } = req.body as {userId: string};

        if(!userId || !userId.match(/^(?=[a-f\d]{24}$)(\d+[a-f]|[a-f]+\d)/i)) {
            return res.status(400).send({
                errors: [
                    {message: "Invalid user ID"}
                ]
            })
        }

        const user = await User.findOne({ _id: userId }).select("_id");
        if (!user) {
            return res.status(404).send({
                errors: [{ message: "User not found" }],
            });
        }
        const invitation = await Invitation.findOne({ teamId, userId });
        if (invitation) {
            return res.status(409).send({
                errors: [{ message: "User has already invited" }],
            });
        }
        const team = await Team.findById(teamId).select("members");
        if (team!.members.includes(userId)) {
            return res.status(409).send({
                errors: [{ message: "User is already in this team" }],
            });
        }

        const newInvitation = new Invitation({ userId, teamId, createdAt: new Date() });
        await newInvitation.save();

        const publisher = new Publisher<TeamInvitedEvent>(NatsEvents.TeamInvited);
        await publisher.publish({
            teamId,
            userId,
        });

        res.status(204).send();
    } catch (e) {
        res.status(500).send({
            errors: [{ message: "Something went wrong" }],
        });
    }
});

router.put("/:teamId/invite/cancel", authorizedMiddleware, onlyHostProtection, async (req: Request, res: Response) => {
    try {
        const { teamId } = req.params;
        const { userId } = req.body;

        const user = await User.findOne({ _id: userId }).select("_id");
        if (!user) {
            return res.status(404).send({
                errors: [{ message: "User not found" }],
            });
        }
        const invitation = await Invitation.findOne({ teamId, userId });
        if (!invitation) {
            return res.status(409).send({
                errors: [{ message: "User does not invite yet" }],
            });
        }
        const team = await Team.findById(teamId).select("members");
        if (team!.members.includes(userId)) {
            return res.status(409).send({
                errors: [{ message: "User is already in this team" }],
            });
        }

        await Invitation.deleteOne({ userId, teamId });
        const publisher = new Publisher<TeamInviteCancelledEvent>(NatsEvents.TeamInviteCancelled);
        await publisher.publish({
            teamId,
            userId,
        });

        res.status(204).send();
    } catch (e) {
        res.status(500).send({
            errors: [{ message: "Something went wrong" }],
        });
    }
});

router.put("/:teamId/accept", authorizedMiddleware, onlyInvitedUserProtection, async (req: Request, res: Response) => {
    try {
        const {userId} = req.user;
        const {teamId} = req.params;

        await Team.updateOne({_id: teamId}, {$push: {members: userId}});
        await Invitation.deleteOne({userId, teamId});

        const publisher = new Publisher<TeamAcceptedEvent>(NatsEvents.TeamAccepted);
        await publisher.publish({
            userId,
            teamId
        })

        res.status(204).send();
    }catch(e) {
        res.status(500).send({
            errors: [
                {message: "Something went wrong"}
            ]
        })
    } 
});

router.put("/:teamId/decline", authorizedMiddleware, onlyInvitedUserProtection, async (req: Request, res: Response) => {
    try {
        const {userId} = req.user;
        const {teamId} = req.params;

        await Invitation.deleteOne({userId, teamId});

        const publisher = new Publisher<TeamDeclinedEvent>(NatsEvents.TeamDeclined);
        await publisher.publish({
            userId,
            teamId
        })

        res.status(204).send();
    }catch(e) {
        res.status(500).send({
            errors: [
                {message: "Something went wrong"}
            ]
        })
    } 
});

router.delete("/:teamId/remove/:userId", authorizedMiddleware, onlyHostProtection, async (req: Request, res: Response) => {
    try {
        const _id = req.user.userId;
        const {teamId, userId} = req.params;

        if(_id === userId) {
            return res.status(409).send({
                errors: [
                    {message: "Con not remove yourself"}
                ]
            })
        }
        
        const team = await Team.findOne({_id: teamId, members: userId}).select("_id members");
        if(!team) {
            return res.status(409).send({
                errors: [
                    {message: "User is not in this team"}
                ]
            })
        }
        team.members = team.members.filter(member => member.toString() !== userId);
        await team.save();

        const publisher = new Publisher<TeamRemovedEvent>(NatsEvents.TeamRemoved);
        await publisher.publish({
            teamId,
            userId
        })

        res.status(204).send();
    } catch (e) {
        res.status(500).send({
            errors: [{ message: "Something went wrong" }],
        });
    }
});

export default router;
