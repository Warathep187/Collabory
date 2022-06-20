import { Message } from "node-nats-streaming";
import NatsEvents from "../events/events";
import { UserCreatedEvent, UserEditedEvent, UserImageEditedEvent, TeamCreatedEvent, TeamInvitedEvent, TeamAcceptedEvent, TeamDeclinedEvent, TeamRemovedEvent, TeamInviteCancelledEvent } from "../types/listen-events";
import {natsClient} from "../services/nats-streaming";
import User from "../models/user";
import Team from "../models/team";

const getSubscriptionOption = (qGroup: string) => {
    return natsClient
        .subscriptionOptions()
        .setDeliverAllAvailable()
        .setManualAckMode(true)
        .setAckWait(30 * 1000)
        .setDurableName(qGroup);
};

export const setUserCreatedListener = (qGroup: string) => {
    const listener = natsClient.subscribe(NatsEvents.UserCreated, qGroup, getSubscriptionOption(qGroup));
    listener.on("message", async (msg: Message) => {
        try {
            const data = JSON.parse(msg.getData().toString()) as UserCreatedEvent["data"];

            const isExisting = await User.findById(data._id);
            if(isExisting) {
                return msg.ack();
            }
            const {_id, name} = data;
            const newUser = new User({_id, name, teams: [], invitations: []});
            await newUser.save();

            msg.ack();
        }catch(e) {
            throw new Error("Something went wrong");
        }
    })
}

export const setUserEditedListener = (qGroup: string) => {
    const listener = natsClient.subscribe(NatsEvents.UserEdited, qGroup, getSubscriptionOption(qGroup));
    listener.on("message", async (msg: Message) => {
        try {
            const data = JSON.parse(msg.getData().toString()) as UserEditedEvent["data"];

            const user = await User.findOne({_id: data._id, _version: data._version - 1});
            if(!user) {
                throw new Error("User not found")
            }
            user.name = data.name;
            user._version = data._version;
            await user.save();

            msg.ack();
        }catch(e) {
            throw new Error("Something went wrong");
        }
    })
}

export const setUserImageEditedListener = (qGroup: string) => {
    const listener = natsClient.subscribe(NatsEvents.UserImageEdited, qGroup, getSubscriptionOption(qGroup));
    listener.on("message", async (msg: Message) => {
        try {
            const data = JSON.parse(msg.getData().toString()) as UserImageEditedEvent["data"];

            const user = await User.findOne({_id: data._id, _version: data._version - 1});
            if(!user) {
                throw new Error("User not found")
            }
            user.profileImageUrl = data.profileImageUrl;
            user._version = data._version;
            await user.save();

            msg.ack();
        }catch(e) {
            throw new Error("Something went wrong");
        }
    })
}

export const setTeamCreatedListener = (qGroup: string) => {
    const listener = natsClient.subscribe(NatsEvents.TeamCreated, qGroup, getSubscriptionOption(qGroup));
    listener.on("message", async (msg: Message) => {
        try {
            const data = JSON.parse(msg.getData().toString()) as TeamCreatedEvent["data"];

            const isExisting = await Team.findById(data._id);
            if(isExisting) {
                return msg.ack();
            }

            const {_id, hostId} = data;
            const newTeam = new Team({_id, hostId});
            await newTeam.save();
            await User.updateOne({_id: data.hostId}, {$push: {teams: data._id}});

            msg.ack();
        }catch(e) {
            throw new Error("Something went wrong");
        }
    })
}

export const setTeamInvitedListener = (qGroup: string) => {
    const listener = natsClient.subscribe(NatsEvents.TeamInvited, qGroup, getSubscriptionOption(qGroup));
    listener.on("message", async (msg: Message) => {
        try {
            const data = JSON.parse(msg.getData().toString()) as TeamInvitedEvent["data"];

            const user = await User.findOne({_id: data.userId, $or: [{teams: data.teamId}, {invitations: data.teamId}]});
            if(user) {
                throw new Error("User has already in team or already invited");
            }
            await User.updateOne({_id: data.userId}, {$push: {invitations: data.teamId}});

            msg.ack();
        }catch(e) {
            throw new Error("Something went wrong");
        }
    })
}

export const setTeamInviteCancelledListener = (qGroup: string) => {
    const listener = natsClient.subscribe(NatsEvents.TeamInviteCancelled, qGroup, getSubscriptionOption(qGroup));
    listener.on("message", async (msg: Message) => {
        try {
            const data = JSON.parse(msg.getData().toString()) as TeamInviteCancelledEvent["data"];

            const user = await User.findById(data.userId);
            if(!user) {
                throw new Error("User not found");
            }
            user.invitations = user.invitations.filter(invitation => invitation !== data.teamId);
            await user.save();

            msg.ack();
        }catch(e) {
            throw new Error("Something went wrong");
        }
    })
}

export const setTeamAcceptedListener = (qGroup: string) => {
    const listener = natsClient.subscribe(NatsEvents.TeamAccepted, qGroup, getSubscriptionOption(qGroup));
    listener.on("message", async (msg: Message) => {
        try {
            const data = JSON.parse(msg.getData().toString()) as TeamAcceptedEvent["data"];

            const user = await User.findById(data.userId);
            if(!user) {
                throw new Error("User not found");
            }
            user.invitations = user.invitations.filter(invitation => invitation !== data.teamId);
            user.teams.push(data.teamId);
            await user.save();

            msg.ack();
        }catch(e) {
            throw new Error("Something went wrong");
        }
    })
}

export const setTeamDeclinedListener = (qGroup: string) => {
    const listener = natsClient.subscribe(NatsEvents.TeamDeclined, qGroup, getSubscriptionOption(qGroup));
    listener.on("message", async (msg: Message) => {
        try {
            const data = JSON.parse(msg.getData().toString()) as TeamDeclinedEvent["data"];

            const user = await User.findById(data.userId);
            if(!user) {
                throw new Error("User not found");
            }
            user.invitations = user.invitations.filter(invitation => invitation !== data.teamId);
            await user.save();

            msg.ack();
        }catch(e) {
            throw new Error("Something went wrong");
        }
    })
}

export const setTeamRemovedListener = (qGroup: string) => {
    const listener = natsClient.subscribe(NatsEvents.TeamRemoved, qGroup, getSubscriptionOption(qGroup));
    listener.on("message", async (msg: Message) => {
        try {
            const data = JSON.parse(msg.getData().toString()) as TeamRemovedEvent["data"];

            const user = await User.findById(data.userId);
            if(!user) {
                throw new Error("User not found");
            }
            user.teams = user.teams.filter(teamId => teamId !== data.teamId);
            await user.save();

            msg.ack();
        }catch(e) {
            throw new Error("Something went wrong");
        }
    })
}